/** Duffel branch — checks for the booking form (browser and server use the same rules). */

export type PassengerInput = { id: string; title: string; gender: string; givenName: string; familyName: string; bornOn: string };

const NAME = /^[\p{L}][\p{L} '\-.]{0,39}$/u;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE = /^\+[1-9]\d{6,14}$/;

/** Problems with one passenger (empty = fine). `today` is YYYY-MM-DD. */
export function passengerProblems(p: PassengerInput, type: "adult" | "child" | "infant", today: string): string[] {
  const out: string[] = [];
  if (!["mr", "ms", "mrs", "miss"].includes(p.title)) out.push("Choose a title.");
  if (!["m", "f"].includes(p.gender)) out.push("Choose a gender.");
  if (!NAME.test(p.givenName.trim())) out.push("Enter the first name as on the passport (letters only).");
  if (!NAME.test(p.familyName.trim())) out.push("Enter the last name as on the passport (letters only).");
  if (!DATE.test(p.bornOn) || p.bornOn >= today || p.bornOn < "1900-01-01") out.push("Enter a valid date of birth.");
  else {
    const age = ageOn(p.bornOn, today);
    if (type === "adult" && age < 18) out.push("This traveller must be 18 or older.");
    if (type === "child" && (age < 2 || age >= 18)) out.push("A child must be between 2 and 17.");
    if (type === "infant" && age >= 2) out.push("An infant must be under 2.");
  }
  return out;
}

export function ageOn(bornOn: string, today: string): number {
  const [by, bm, bd] = bornOn.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}
