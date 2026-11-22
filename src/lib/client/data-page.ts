import { formatNumber, formatPageDate, machineReadableZone, parseDate, type PassportFields } from "../passport";

function fillLine(line: HTMLElement | null, text: string) {
  if (!line) return;
  line.replaceChildren(
    ...[...text].map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      return span;
    }),
  );
}

/** Updates a data page rendered by DataPage.astro. */
export function updateDataPage(root: HTMLElement, fields: PassportFields, portraitUrl?: string | null) {
  const set = (name: keyof PassportFields, value: string) => {
    const node = root.querySelector(`[data-field="${name}"]`);
    if (node) node.textContent = value;
  };
  const birth = parseDate(fields.dateOfBirth);
  set("firstName", fields.firstName);
  set("surname", fields.surname);
  set("placeOfOrigin", fields.placeOfOrigin);
  set("dateOfBirth", birth ? formatPageDate(birth) : "");
  const number = root.querySelector("[data-field=number]");
  if (number) number.textContent = formatNumber(Number(root.dataset.number ?? 0));

  const [top, bottom] = machineReadableZone(fields, Number(root.dataset.number ?? 0), new Date(root.dataset.issued ?? Date.now()));
  fillLine(root.querySelector("[data-mrz=top]"), top);
  fillLine(root.querySelector("[data-mrz=bottom]"), bottom);

  if (portraitUrl !== undefined) {
    const image = root.querySelector<HTMLImageElement>("[data-portrait]");
    if (image) {
      image.hidden = !portraitUrl;
      if (portraitUrl) image.src = portraitUrl;
      else image.removeAttribute("src");
    }
  }
  root.setAttribute("aria-label", `Passport data page for ${fields.firstName} ${fields.surname}`);
}
