import { max } from "drizzle-orm";
import { db } from "./db";
import { passportRequest, type PassportRequest } from "./db/schema";

/**
 * Creates passports in Purdue Hackers ID for these requests and returns their numbers, in the same order.
 *
 * Placeholder: the ID integration (endpoint or scope) is not decided yet. Until then, the numbers
 * continue from the highest number that this app has given.
 */
export async function createPassports(requests: PassportRequest[]): Promise<number[]> {
  // Risk: until ID creates passports, these numbers can collide with passports that already exist in ID.
  const [{ highest }] = await db.select({ highest: max(passportRequest.passportNumber) }).from(passportRequest);
  return requests.map((_, i) => (highest ?? 0) + i + 1);
}
