/**
 * Milestone 30: Glooconn place label ("London, United Kingdom") → the
 * city name + ISO country code LiteAPI's free rates search takes. (LiteAPI's
 * own place search costs $0.01 per call, so it is not used.)
 */

let countryCodes: Map<string, string> | null = null;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

/** English country name → ISO 3166-1 alpha-2, built from Intl. */
function codeForCountry(name: string): string | null {
  if (!countryCodes) {
    countryCodes = new Map();
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    for (let a = 65; a <= 90; a += 1) {
      for (let b = 65; b <= 90; b += 1) {
        const code = String.fromCharCode(a, b);
        let label: string | undefined;
        try {
          label = display.of(code);
        } catch {
          label = undefined;
        }
        if (label && label !== code) countryCodes.set(normalize(label), code);
      }
    }
    // Common alternative spellings.
    const aliases: Record<string, string> = {
      uk: "GB",
      unitedkingdom: "GB",
      greatbritain: "GB",
      england: "GB",
      usa: "US",
      unitedstates: "US",
      unitedstatesofamerica: "US",
      uae: "AE",
      czechrepublic: "CZ",
      southkorea: "KR",
      russia: "RU",
      turkey: "TR",
      vietnam: "VN",
    };
    for (const [alias, code] of Object.entries(aliases)) countryCodes.set(alias, code);
  }
  return countryCodes.get(normalize(name)) ?? null;
}

export type LiteApiPlace = { cityName: string; countryCode: string };

/** Null when the label has no recognisable country. */
export function placeFromLabel(label: string, fallbackCountry?: string): LiteApiPlace | null {
  const parts = label
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const cityName = parts[0];
  if (!cityName) return null;
  const country = parts.length > 1 ? parts[parts.length - 1] : fallbackCountry;
  const countryCode = country ? (/^[A-Za-z]{2}$/.test(country) ? country.toUpperCase() : codeForCountry(country)) : null;
  return countryCode ? { cityName, countryCode } : null;
}
