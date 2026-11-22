import {
  ORIGINS,
  PORTRAIT_ASPECT,
  PORTRAIT_HEIGHT,
  PORTRAIT_WIDTH,
  validateFields,
  type PassportFields,
} from "../passport";
import { updateDataPage } from "./data-page";
import { gliderBurst } from "./effects";
import { reducedMotion } from "./tilt";

const MAX_ZOOM = 4;
const KEY_STEP = 16;

export function mountEditor(form: HTMLFormElement, dialog: HTMLDialogElement) {
  const page = form.querySelector<HTMLElement>("[data-page]")!;
  const originInput = form.querySelector<HTMLInputElement>("#placeOfOrigin")!;
  const originToggle = form.querySelector<HTMLElement>('[data-ph-toggle="origin"]')!;
  const fileInput = form.querySelector<HTMLInputElement>("#portrait-file")!;
  const pickLabel = form.querySelector<HTMLElement>("[data-pick-label]")!;
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;

  let portrait: Blob | null = null;
  let portraitUrl: string | null = null;
  const hadPortrait = form.hasAttribute("data-has-portrait");

  const read = (): PassportFields => {
    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    return {
      firstName: text("firstName"),
      surname: text("surname"),
      placeOfOrigin: text("placeOfOrigin"),
      dateOfBirth: text("dateOfBirth"),
    };
  };

  const scan = page.querySelector<HTMLElement>("[data-scan]")!;
  scan.addEventListener("animationend", () => scan.classList.remove("is-scanning"));
  const sweep = () => scan.classList.add("is-scanning");
  const refresh = () => {
    updateDataPage(page, read());
    sweep();
  };

  function showErrors(errors: Record<string, string>, message?: string) {
    for (const node of form.querySelectorAll<HTMLElement>("[data-error-for]")) {
      const name = node.dataset.errorFor!;
      node.hidden = !errors[name];
      node.querySelector("span")!.textContent = errors[name] ?? "";
      form.querySelector(`[name="${name}"]`)?.toggleAttribute("aria-invalid", !!errors[name]);
    }
    const formError = form.querySelector<HTMLElement>("[data-form-error]")!;
    formError.hidden = !message;
    formError.querySelector("span")!.textContent = message ?? "";
  }

  form.addEventListener("input", (event) => {
    const name = (event.target as HTMLInputElement).name;
    const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (error) error.hidden = true;
    (event.target as HTMLElement).removeAttribute("aria-invalid");
    refresh();
  });
  originToggle.addEventListener("ph:change", (event) => {
    const value = (event as CustomEvent<{ value: string }>).detail.value;
    originInput.hidden = value !== "";
    originInput.value = value;
    if (value === "") originInput.focus();
    refresh();
  });
  if (ORIGINS.includes(originInput.value)) originInput.hidden = true;

  form.querySelector("[data-pick-portrait]")!.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (file) cropper.open(file);
  });

  const cropper = createCropper(dialog, (blob) => {
    portrait = blob;
    if (portraitUrl) URL.revokeObjectURL(portraitUrl);
    portraitUrl = URL.createObjectURL(blob);
    updateDataPage(page, read(), portraitUrl);
    sweep();
    pickLabel.textContent = "Change picture";
    showErrors({});
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = read();
    const errors: Record<string, string> = validateFields(fields);
    if (!portrait && !hadPortrait) errors.portrait = "Add a portrait.";
    if (Object.keys(errors).length) {
      showErrors(errors, "Some fields need changes.");
      return;
    }

    const body = new FormData();
    for (const [key, value] of Object.entries(fields)) body.set(key, value);
    if (portrait) body.set("portrait", portrait, "portrait.jpg");

    submit.disabled = true;
    showErrors({});
    try {
      const response = await fetch("/api/request", { method: "POST", body });
      const result = (await response.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
      if (!response.ok) {
        showErrors(result.fields ?? {}, result.error ?? "Something went wrong. Try again.");
        return;
      }
      await stamp(page);
      location.assign("/");
    } catch {
      showErrors({}, "Could not reach the server. Check your connection and try again.");
    } finally {
      submit.disabled = false;
    }
  });
}

function createCropper(dialog: HTMLDialogElement, onsave: (blob: Blob) => void) {
  const view = dialog.querySelector<HTMLElement>("[data-crop-view]")!;
  const image = dialog.querySelector<HTMLImageElement>("[data-crop-image]")!;
  const zoomInput = dialog.querySelector<HTMLInputElement>("[data-crop-zoom]")!;
  const saveButton = dialog.querySelector<HTMLButtonElement>("[data-crop-save]")!;

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let zoom = 1;
  let source = "";

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const viewWidth = () => view.clientWidth;
  const viewHeight = () => view.clientHeight;
  // The crop frame at zoom 1 is the largest 4:5 area that fits in the picture.
  const baseWidth = () => Math.min(width, height * PORTRAIT_ASPECT);
  const scale = () => (width ? (viewWidth() / baseWidth()) * zoom : 0);
  const halfWidth = () => baseWidth() / (2 * zoom);
  const halfHeight = () => halfWidth() / PORTRAIT_ASPECT;

  function draw() {
    const s = scale();
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.transform = `translate(${viewWidth() / 2 - centerX * s}px, ${viewHeight() / 2 - centerY * s}px) scale(${s})`;
    image.classList.toggle("invisible", !s);
    zoomInput.value = String(zoom);
  }

  function place(x: number, y: number, nextZoom = zoom) {
    zoom = clamp(nextZoom, 1, MAX_ZOOM);
    centerX = clamp(x, halfWidth(), width - halfWidth());
    centerY = clamp(y, halfHeight(), height - halfHeight());
    draw();
  }

  const pan = (dx: number, dy: number) => place(centerX - dx / scale(), centerY - dy / scale());

  function zoomAt(nextZoom: number, px = viewWidth() / 2, py = viewHeight() / 2) {
    const s = scale();
    const ix = centerX + (px - viewWidth() / 2) / s;
    const iy = centerY + (py - viewHeight() / 2) / s;
    const next = clamp(nextZoom, 1, MAX_ZOOM);
    const nextScale = (viewWidth() / baseWidth()) * next;
    place(ix - (px - viewWidth() / 2) / nextScale, iy - (py - viewHeight() / 2) / nextScale, next);
  }

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  const local = (event: PointerEvent | WheelEvent) => {
    const box = view.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const spread = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  view.addEventListener("pointerdown", (event) => {
    view.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, local(event));
    if (pointers.size === 2) pinch = spread();
  });
  view.addEventListener("pointermove", (event) => {
    const last = pointers.get(event.pointerId);
    if (!last) return;
    const point = local(event);
    pointers.set(event.pointerId, point);
    if (pointers.size === 1) {
      pan(point.x - last.x, point.y - last.y);
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const distance = spread();
      if (pinch) zoomAt(zoom * (distance / pinch), (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = distance;
    }
  });
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    pinch = pointers.size === 2 ? spread() : 0;
  };
  view.addEventListener("pointerup", release);
  view.addEventListener("pointercancel", release);
  view.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const point = local(event);
      zoomAt(zoom * Math.exp(-event.deltaY * 0.002), point.x, point.y);
    },
    { passive: false },
  );
  view.addEventListener("keydown", (event) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [KEY_STEP, 0],
      ArrowRight: [-KEY_STEP, 0],
      ArrowUp: [0, KEY_STEP],
      ArrowDown: [0, -KEY_STEP],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      pan(...move);
    } else if (event.key === "+" || event.key === "=") {
      zoomAt(zoom * 1.1);
    } else if (event.key === "-") {
      zoomAt(zoom / 1.1);
    }
  });
  zoomInput.addEventListener("input", () => zoomAt(Number(zoomInput.value)));

  image.addEventListener("load", () => {
    width = image.naturalWidth;
    height = image.naturalHeight;
    zoom = 1;
    place(width / 2, height / 2);
    saveButton.disabled = false;
  });
  image.addEventListener("error", () => {
    dialog.close();
    alert("That picture could not be opened. Try a JPEG or PNG.");
  });
  dialog.addEventListener("close", () => {
    if (source) URL.revokeObjectURL(source);
    source = "";
    image.removeAttribute("src");
    width = height = 0;
    draw();
  });

  saveButton.addEventListener("click", async () => {
    if (!width) return;
    saveButton.disabled = true;
    const canvas = document.createElement("canvas");
    canvas.width = PORTRAIT_WIDTH;
    canvas.height = PORTRAIT_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, PORTRAIT_WIDTH, PORTRAIT_HEIGHT);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      centerX - halfWidth(),
      centerY - halfHeight(),
      halfWidth() * 2,
      halfHeight() * 2,
      0,
      0,
      PORTRAIT_WIDTH,
      PORTRAIT_HEIGHT,
    );
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.92));
    dialog.close();
    if (blob) onsave(blob);
  });

  return {
    open(file: File) {
      saveButton.disabled = true;
      source = URL.createObjectURL(file);
      dialog.showModal();
      image.src = source;
    },
  };
}

/** Slams the hidden "Requested" stamp onto the data page. */
async function stamp(page: HTMLElement) {
  const mark = page.querySelector<HTMLElement>("[data-stamp]");
  if (!mark) return;
  mark.hidden = false;
  if (reducedMotion()) return new Promise((done) => setTimeout(done, 600));
  page.scrollIntoView({ block: "nearest", behavior: "smooth" });
  mark.classList.add("is-slamming");
  await new Promise((done) => setTimeout(done, 270));
  page.classList.add("is-shaking");
  const box = mark.getBoundingClientRect();
  gliderBurst(box.left + box.width / 2, box.top + box.height / 2);
  await new Promise((done) => setTimeout(done, 1300));
}
