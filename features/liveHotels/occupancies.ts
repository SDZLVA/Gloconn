/** Milestone 30/31: rooms for LiteAPI search and white-label links (shared, not server-only). */

/** Splits guests over rooms the way travellers expect (adults first). */
export function buildOccupancies(adults: number, children: number, rooms: number) {
  const roomCount = Math.max(1, Math.min(rooms, adults));
  const occupancies: { adults: number; children: number[] }[] = [];
  for (let i = 0; i < roomCount; i += 1) {
    const roomAdults = Math.floor(adults / roomCount) + (i < adults % roomCount ? 1 : 0);
    const roomChildren = Math.floor(children / roomCount) + (i < children % roomCount ? 1 : 0);
    // Ages are not asked in the search form; 8 is a neutral child age.
    occupancies.push({ adults: roomAdults, children: Array.from({ length: roomChildren }, () => 8) });
  }
  return occupancies;
}

/** White-label `occupancies` URL value: base64 of the JSON array (LiteAPI docs). */
export function whitelabelOccupancies(adults: number, children: number, rooms: number): string {
  const json = JSON.stringify(buildOccupancies(adults, children, rooms));
  return typeof btoa === "function" ? btoa(json) : Buffer.from(json).toString("base64");
}
