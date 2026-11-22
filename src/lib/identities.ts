import type { PassportFields } from "./passport";
import type { PortraitName } from "./portraits";

export type Identity = { fields: PassportFields; portrait: PortraitName; number: number };

/** Example passports for the landing page. */
export const IDENTITIES: Identity[] = [
  { fields: { firstName: "Wack", surname: "Hacker", placeOfOrigin: "The woods", dateOfBirth: "1200-04-06" }, portrait: "hacker", number: 1 },
  { fields: { firstName: "Whiskers", surname: "McHackface", placeOfOrigin: "Under the bed", dateOfBirth: "2019-04-01" }, portrait: "cat", number: 42 },
  { fields: { firstName: "Ribbit", surname: "Von Pond", placeOfOrigin: "A lily pad", dateOfBirth: "2000-02-29" }, portrait: "frog", number: 314 },
  { fields: { firstName: "Boo", surname: "Ectoplasm", placeOfOrigin: "The attic", dateOfBirth: "1692-10-31" }, portrait: "ghost", number: 666 },
  { fields: { firstName: "Unit", surname: "Seven", placeOfOrigin: "Lawfice", dateOfBirth: "1999-12-31" }, portrait: "robot", number: 1010 },
  { fields: { firstName: "Quackers", surname: "Duckworth", placeOfOrigin: "Lambfice", dateOfBirth: "2001-02-03" }, portrait: "duck", number: 7 },
  { fields: { firstName: "Glider", surname: "Conway", placeOfOrigin: "The tundra", dateOfBirth: "1970-10-01" }, portrait: "glider", number: 3 },
];
