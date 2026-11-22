export const CURRENT_PASSPORT_VERSION = 1;

/** Data page size in points. Every layout value is a multiple of this unit. */
export const PAGE_WIDTH = 472;
export const PAGE_HEIGHT = 322;

export const PORTRAIT_ASPECT = 148 / 185;
export const PORTRAIT_WIDTH = 888;
export const PORTRAIT_HEIGHT = 1110;
export const PORTRAIT_MAX_BYTES = 5 * 1024 * 1024;

export const NAME_MAX = 24;
export const ORIGIN_MAX = 13;
export const ORIGINS = ["The woods", "The deep sea", "The tundra"];

export type PassportFields = {
  firstName: string;
  surname: string;
  placeOfOrigin: string;
  dateOfBirth: string;
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const pad = (value: number, length: number) => String(value).padStart(length, "0");

/** Parses `YYYY-MM-DD` as a UTC date. */
export function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return date.getUTCDate() === +match[3] ? date : null;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function formatPageDate(date: Date) {
  return `${pad(date.getUTCDate(), 2)} ${MONTHS[date.getUTCMonth()]} ${pad(date.getUTCFullYear(), 4)}`;
}

export function formatNumber(passportNumber: number, version = CURRENT_PASSPORT_VERSION) {
  return (version + passportNumber * 0.0001).toFixed(4);
}

/** Returns field errors. An empty object means the fields are valid. */
export function validateFields(fields: PassportFields) {
  const errors: Partial<Record<keyof PassportFields, string>> = {};
  if (!fields.firstName.trim()) errors.firstName = "Write a first name.";
  else if (fields.firstName.length > NAME_MAX) errors.firstName = `Use ${NAME_MAX} characters or fewer.`;
  if (!fields.surname.trim()) errors.surname = "Write a last name.";
  else if (fields.surname.length > NAME_MAX) errors.surname = `Use ${NAME_MAX} characters or fewer.`;
  if (!fields.placeOfOrigin.trim()) errors.placeOfOrigin = "Write a place of origin.";
  else if (fields.placeOfOrigin.length > ORIGIN_MAX)
    errors.placeOfOrigin = `Use ${ORIGIN_MAX} characters or fewer.`;
  const birth = parseDate(fields.dateOfBirth);
  if (!birth || birth.getUTCFullYear() < 1000) errors.dateOfBirth = "Write a valid date.";
  else if (fields.dateOfBirth > today()) errors.dateOfBirth = "The date of birth cannot be in the future.";
  return errors;
}

function mrzName(value: string) {
  return (
    value
      .replace(/[å]/g, "AA")
      .replace(/[ä]/g, "AE")
      .replace(/[ð]/g, "DH")
      .replace(/[Ĳ-ĳ]/g, "IJ")
      .replace(/[ö]/g, "OE")
      .replace(/[ü]/g, "UE")
      .replace(/[ñ]/g, "N")
      .replace(/[æ]/g, "AE")
      .replace(/[œ]/g, "OE")
      .replace(/[ß]/g, "SS")
      .replace(/[þ]/g, "TH")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/- /g, "<")
      .replace(/[^a-zA-Z0-9]/g, "")
  );
}

function checksum(value: string) {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (/[A-Z]/i.test(char)) sum += weights[i % 3] * (char.toUpperCase().charCodeAt(0) - 55);
    else if (/\d/.test(char)) sum += weights[i % 3] * Number(char);
  }
  return String(sum % 10);
}

/** The two machine-readable lines at the bottom of the data page. */
export function machineReadableZone(
  fields: PassportFields,
  passportNumber: number,
  issued: Date,
  version = CURRENT_PASSPORT_VERSION,
) {
  const birth = parseDate(fields.dateOfBirth) ?? new Date(0);
  const top = `PHHAK${mrzName(fields.surname)}<<${mrzName(fields.firstName)}`.padEnd(44, "<").slice(0, 44);

  const document = pad(version, 3) + pad(passportNumber, 6);
  const birthDigits = pad(birth.getUTCFullYear(), 4) + pad(birth.getUTCMonth() + 1, 2) + pad(birth.getUTCDate(), 2);
  const expiry = pad(issued.getUTCFullYear() + 1000, 4) + "0101";
  const filler = "<<<<<<<<<<<";
  const documentCheck = checksum(document);
  const birthCheck = checksum(birthDigits);
  const expiryCheck = checksum(expiry);
  const composite = checksum(
    documentCheck + documentCheck + birthDigits + birthCheck + expiry + expiryCheck + filler,
  );
  const bottom = `${document}${documentCheck}HAK${birthDigits}${birthCheck}<${expiry}${expiryCheck}${filler}${composite}`;
  return [top, bottom] as const;
}
