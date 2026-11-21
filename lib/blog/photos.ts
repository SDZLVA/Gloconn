/**
 * Milestone 63c/64 — blog photos (Unsplash, free under the Unsplash License)
 * and their CDN URLs. Shared by the blog and the home page "Travel ideas".
 */

export type BlogPhoto = {
  /** "photo-1610016302534-6f67f1c968d8" */
  id: string;
  alt: string;
  by: string;
  /** The photo's Unsplash page, for the credit link. */
  page: string;
};

/** Unsplash CDN link, cropped to w × h (the CDN resizes on the fly). */
export function photoUrl(id: string, w: number, h: number = Math.round((w * 9) / 16)): string {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=75`;
}

const U = "https://unsplash.com/photos/";

/** Photos used on the blog (all checked: "Free to use under the Unsplash License", 2026-11-18). */
export const PHOTOS = {
  milan: { id: "photo-1610016302534-6f67f1c968d8", alt: "Milan Cathedral (Duomo di Milano) at sunset", by: "Ouael Ben Salah", page: `${U}0xe2FGo7Vc0` },
  budapest: { id: "photo-1698657792682-48f73d9d0b8c", alt: "The Hungarian Parliament in Budapest lit up at night on the Danube", by: "Leonhard Niederwimmer", page: `${U}KiUE0O5pVeI` },
  krakow: { id: "photo-1697821830112-665545013660", alt: "Kraków Main Market Square with the Cloth Hall", by: "Tomasz Anusiewicz", page: `${U}tT_lGiR7udY` },
  lisbon: { id: "photo-1590941761838-60179f0ed248", alt: "A yellow tram 28 in Lisbon", by: "Paulo Evangelista", page: `${U}2N0PVuB0byQ` },
  seville: { id: "photo-1605086944102-56c678d51c9a", alt: "Seville Cathedral and the Giralda tower at night", by: "Tom Podmore", page: `${U}2cEdlKdGEq4` },
  athens: { id: "photo-1603565816030-6b389eeb23cb", alt: "The Acropolis of Athens at golden hour", by: "Constantinos Kollias", page: `${U}yqBvJJ8jGBQ` },
  strasbourg: { id: "photo-1580112613591-a4be59e156a5", alt: "The lit-up Christkindelsmärik sign over the Christmas market in Strasbourg at night", by: "Alexis Brandner", page: `${U}OHMRoA40xAI` },
  strasbourgCathedral: { id: "photo-1601743859611-b8adb4d31cbe", alt: "Strasbourg Cathedral rising above the old-town streets", by: "Clément PIERSON", page: `${U}kPFM7vU3YA0` },
  prague: { id: "photo-1766470656764-08092ac99094", alt: "The lit Christmas tree and the Old Town Hall clock tower over the Christmas market stalls in Prague at night", by: "Carnet de Voyage d'Alex", page: `${U}1H7d0m1v5lA` },
  pragueRoofs: { id: "photo-1766471674279-af0cd91b264a", alt: "Snow-covered red rooftops of Prague seen from above", by: "Carnet de Voyage d'Alex", page: `${U}mgEtt0EW2aM` },
  viennaChristkindlmarkt: { id: "photo-1761273075373-283827884bb5", alt: "The lit-up Wiener Christkindlmarkt arch in front of Vienna City Hall at night", by: "Jeffrey Zhang", page: `${U}ZocPJYse3tI` },
  viennaRathaus: { id: "photo-1761273075344-bd6150f90f7b", alt: "Vienna City Hall (Rathaus) lit up at night above the Christmas market", by: "Jeffrey Zhang", page: `${U}uz57Ep3Fbsg` },
  // Milestone 75 — home "Hot destinations" and /destinations pages (checked 2026-11-20).
  dubai: { id: "photo-1512453979798-5ea266f8880c", alt: "The Burj Khalifa and skyscrapers above a highway interchange in Dubai", by: "David Rodrigo", page: `${U}Fr6zexbmjmc` },
  bangkok: { id: "photo-1563492065599-3520f775eeed", alt: "Orange-roofed temples in Bangkok", by: "Alejandro Cartagena", page: `${U}B64B6-kAWlw` },
  maldives: { id: "photo-1573843981267-be1999ff37cd", alt: "Aerial view of a resort island and water villas in the Maldives", by: "Rayyu Maldives", page: `${U}xPsFXsbXJRg` },
  tokyo: { id: "photo-1513407030348-c983a97b98d8", alt: "Tokyo Tower lit up at dusk above the city skyline", by: "Louie Martinez", page: `${U}IocJwyqRv3M` },
  lisbonTram: { id: "photo-1585208798174-6cedd86e019a", alt: "A yellow tram on a street lined with historic buildings in Lisbon", by: "Aayush Gupta", page: `${U}ljhCEaHYWJ8` },
  newYork: { id: "photo-1496588152823-86ff7695e68f", alt: "Panoramic view of the Brooklyn Bridge in New York", by: "Luca Bravo", page: `${U}_QdFx92MO2U` },
  istanbul: { id: "photo-1527838832700-5059252407fa", alt: "Domes and minarets of Istanbul", by: "Fatih Yürür", page: `${U}kNSREmtaGOE` },
  // Blog buffer post tromso-polar-night-northern-lights-2026 (checked 2026-11-21: Free to use under the Unsplash License).
  tromsoAurora: { id: "photo-1443926818681-717d074a57af", alt: "Green northern lights over the night sky near Tromsø, Norway", by: "Marcelo Quinan", page: `${U}R3pUGn5YiTg` },
  tromsoCity: { id: "photo-1677033730887-4c53a95c3dd9", alt: "Aerial view of Tromsø lit up at night under snow", by: "Tianxiang Ji", page: `${U}JdyG_JWu8S8` },
  // Blog buffer post budapest-christmas-markets-2026 (checked 2026-11-21: Free to use under the Unsplash License).
  budapestBasilica: { id: "photo-1512116701772-032c2c803cf4", alt: "St. Stephen's Basilica in Budapest framed by an arch, with Christmas market huts in front", by: "Liam McKay", page: `${U}szFEMeoKp-g` },
  // Blog buffer post tenerife-winter-sun-2026 (checked 2026-11-21: Free to use under the Unsplash License).
  tenerifeCoast: { id: "photo-1691397553539-c7c573138747", alt: "Green mountains meeting the blue Atlantic on the coast of Tenerife", by: "Hendrik Cornelissen", page: `${U}kWwtIQi6JgA` },
  tenerifeGigantes: { id: "photo-1768857081884-2a68e19a336c", alt: "Aerial view of the marina at Los Gigantes cliffs, Tenerife", by: "Kamil Molendys", page: `${U}AmLI0ZOH7I0` },
  // Blog buffer post dolomites-ski-season-2026-world-cup (checked 2026-11-21: Free to use under the Unsplash License).
  dolomitesRoccaPietore: { id: "photo-1683962935404-4f7e420a677b", alt: "Snow-covered peaks of the Dolomites near Rocca Pietore, Italy", by: "NIR HIMI", page: `${U}Z_xaMPfCGpE` },
  dolomitesVillnoess: { id: "photo-1604598879256-c5d52ab56b8e", alt: "Winter sunrise over a forest and the Zanser Alm in Villnöss, South Tyrol", by: "Daniel Seßler", page: `${U}QdIJeoMCPwI` },
  // Third photo for each buffer post, so no post repeats a photo (checked 2026-11-21: Free to use under the Unsplash License).
  tromsoTown: { id: "photo-1639471196942-4f209e0d5f5e", alt: "Tromsø at night with snow-covered mountains behind the town", by: "Dana Andreea Gheorghe", page: `${U}wGSW5Rw_aWY` },
  budapestBastion: { id: "photo-1636636608747-d1eb57d0ba3d", alt: "Fisherman's Bastion and the church in Budapest lit up at night", by: "Michelangelo Azzariti", page: `${U}Lhc5iNjW6uM` },
  tenerifeBenijo: { id: "photo-1579090814807-60808035e1cb", alt: "A coastal road above Benijo beach on Tenerife", by: "Maria Lupan", page: `${U}OkuM6V9m9l0` },
  dolomitesSanMartino: { id: "photo-1614093643263-7ebf3d099724", alt: "Snow-covered pine trees and mountains near San Martino di Castrozza in the Dolomites", by: "Cristina Gottardi", page: `${U}Tr55sj841Fg` },
} satisfies Record<string, BlogPhoto>;

export type PhotoKey = keyof typeof PHOTOS;
