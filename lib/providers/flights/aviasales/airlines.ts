/**
 * IATA airline code → display name (Milestone 19).
 *
 * Aviasales returns codes ("U2"), not names. This covers the carriers most
 * likely on Glooconn's European routes. Anything missing is shown as its
 * code — accurate, if less friendly — rather than guessed.
 */

const AIRLINE_NAMES: Readonly<Record<string, string>> = {
  A3: "Aegean Airlines",
  AA: "American Airlines",
  AC: "Air Canada",
  AF: "Air France",
  AI: "Air India",
  AT: "Royal Air Maroc",
  AY: "Finnair",
  AZ: "ITA Airways",
  BA: "British Airways",
  BT: "airBaltic",
  BY: "TUI Airways",
  CX: "Cathay Pacific",
  DE: "Condor",
  DL: "Delta Air Lines",
  DY: "Norwegian",
  EI: "Aer Lingus",
  EK: "Emirates",
  EN: "Air Dolomiti",
  ET: "Ethiopian Airlines",
  EW: "Eurowings",
  EY: "Etihad Airways",
  FR: "Ryanair",
  FZ: "flydubai",
  G9: "Air Arabia",
  HV: "Transavia",
  IB: "Iberia",
  JL: "Japan Airlines",
  JU: "Air Serbia",
  KL: "KLM",
  LH: "Lufthansa",
  LO: "LOT Polish Airlines",
  LS: "Jet2",
  LX: "Swiss",
  MS: "EgyptAir",
  NH: "ANA",
  NT: "Binter Canarias",
  OS: "Austrian Airlines",
  PC: "Pegasus Airlines",
  QF: "Qantas",
  QR: "Qatar Airways",
  RO: "TAROM",
  SK: "SAS",
  SN: "Brussels Airlines",
  SQ: "Singapore Airlines",
  TK: "Turkish Airlines",
  TO: "Transavia France",
  TP: "TAP Air Portugal",
  U2: "easyJet",
  UA: "United Airlines",
  UL: "SriLankan Airlines",
  UX: "Air Europa",
  V7: "Volotea",
  VY: "Vueling",
  VF: "AJet",
  W4: "Wizz Air Malta",
  W6: "Wizz Air",
  X3: "TUIfly",
  ZQ: "German Airways",
  "2L": "Helvetic Airways",
  "6E": "IndiGo",
};

const IATA_AIRLINE_PATTERN = /^[A-Z0-9]{2}$/;

/** Display name for an airline code, or null when the code is unusable. */
export function airlineDisplayName(code: string | undefined): string | null {
  const normalized = code?.trim().toUpperCase() ?? "";
  if (!IATA_AIRLINE_PATTERN.test(normalized)) {
    return null;
  }
  return AIRLINE_NAMES[normalized] ?? normalized;
}
