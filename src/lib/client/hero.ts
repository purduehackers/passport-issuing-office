import { IDENTITIES } from "../identities";
import { formatNumber, formatPageDate, machineReadableZone, parseDate } from "../passport";
import { portraitUrl } from "../portraits";
import { flap, gliderBurst, letters } from "./effects";
import { reducedMotion, smoothTilt } from "./tilt";

const INTERVAL = 3400;

export function mountHero(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-hero-stage]")!;
  const book = root.querySelector<HTMLElement>("[data-hero-book]")!;
  const cover = root.querySelector<HTMLElement>("[data-hero-cover]")!;
  const page = root.querySelector<HTMLElement>("[data-page]")!;
  const portrait = page.querySelector<HTMLImageElement>("[data-portrait]")!;
  const scan = page.querySelector<HTMLElement>("[data-scan]")!;
  const issued = new Date(page.dataset.issued ?? Date.now());
  const reduce = reducedMotion();

  let index = 0;
  let busy = false;
  let timer = 0;
  let onScreen = true;

  // Touch scrolling also sends pointer events, so only a real mouse tilts the passport.
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    const tilt = smoothTilt(({ x, y }) => {
      book.style.setProperty("--rx", `${-y * 16}deg`);
      book.style.setProperty("--ry", `${x * 22}deg`);
      page.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
      page.style.setProperty("--my", `${(y + 0.5) * 100}%`);
      cover.style.setProperty("--foil-x", `${50 + x * 60}%`);
    }, 0.08);
    const clamp = (v: number) => Math.min(0.5, Math.max(-0.5, v));
    window.addEventListener("pointermove", (event) => {
      const box = stage.getBoundingClientRect();
      tilt.aim(clamp((event.clientX - box.left) / box.width - 0.5), clamp((event.clientY - box.top) / box.height - 0.5));
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => tilt.reset());
  }

  async function show(next: number) {
    if (busy) return;
    busy = true;
    index = next;
    const { fields, number, portrait: art } = IDENTITIES[index];
    const birth = parseDate(fields.dateOfBirth);
    const text: Record<string, string> = {
      firstName: fields.firstName.toUpperCase(),
      surname: fields.surname.toUpperCase(),
      placeOfOrigin: fields.placeOfOrigin.toUpperCase(),
      dateOfBirth: birth ? formatPageDate(birth) : "",
      number: formatNumber(number),
    };
    const jobs = Object.entries(text).map(([name, value]) => {
      const node = page.querySelector(`[data-field="${name}"]`)!;
      return flap(letters(node, value.length), [...value]);
    });
    const [top, bottom] = machineReadableZone(fields, number, issued);
    for (const [line, value] of [["top", top], ["bottom", bottom]] as const) {
      const spans = [...page.querySelectorAll(`[data-mrz="${line}"] span`)];
      jobs.push(flap(spans, [...value], { stagger: 10, settle: 200 }));
    }

    if (reduce) {
      portrait.src = portraitUrl(art);
    } else {
      portrait.classList.add("is-swapping");
      setTimeout(() => (portrait.src = portraitUrl(art)), 150);
      setTimeout(() => portrait.classList.remove("is-swapping"), 320);
      scan.classList.remove("is-scanning");
      void scan.offsetWidth;
      scan.classList.add("is-scanning");
    }
    page.setAttribute("aria-label", `Example passport data page for ${fields.firstName} ${fields.surname}`);
    await Promise.all(jobs);
    busy = false;
  }

  const randomOther = () => (index + 1 + Math.floor(Math.random() * (IDENTITIES.length - 1))) % IDENTITIES.length;

  function schedule() {
    clearTimeout(timer);
    if (reduce || !onScreen || document.hidden) return;
    timer = window.setTimeout(async () => {
      await show((index + 1) % IDENTITIES.length);
      schedule();
    }, INTERVAL);
  }

  function shuffle(event?: MouseEvent | KeyboardEvent) {
    if (busy) return;
    void show(randomOther()).then(schedule);
    if (reduce) return;
    book.animate([{ scale: "1" }, { scale: "0.96" }, { scale: "1.02" }, { scale: "1" }], { duration: 380, easing: "ease-out" });
    const box = stage.getBoundingClientRect();
    const x = event instanceof MouseEvent && event.clientX ? event.clientX : box.left + box.width / 2;
    const y = event instanceof MouseEvent && event.clientY ? event.clientY : box.top + box.height / 2;
    gliderBurst(x, y, 12);
  }

  stage.addEventListener("click", shuffle);
  stage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      shuffle(event);
    }
  });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    schedule();
  }).observe(stage);
  document.addEventListener("visibilitychange", schedule);

  if (reduce) return;
  book.animate(
    [
      { translate: "0 -60px", rotate: "-8deg", opacity: 0 },
      { translate: "0 0", rotate: "0deg", opacity: 1 },
    ],
    { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards", delay: 150 },
  );
  setTimeout(() => {
    root.toggleAttribute("data-open", true);
    cover.addEventListener("transitionend", schedule, { once: true });
  }, 750);
}
