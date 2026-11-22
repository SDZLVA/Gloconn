import { PHOTOS, type BlogPhoto } from "@/lib/blog/photos";

/**
 * Milestone 78 — photos for the /destinations pages (mostly Unsplash, "Free to use under the Unsplash
 * License"). Keyed by destination slug. A destination with no entry here and none in the blog
 * PHOTOS shows a plain coloured card instead of a photo.
 */
const U = "https://unsplash.com/photos/";

export const DEST_PHOTOS: Record<string, BlogPhoto> = {
  bali: { id: "photo-1555400038-63f5ba517a47", alt: "Lush green rice terraces with palm trees in Tegallalang, Bali", by: "Niklas Weiss", page: `${U}-2WlTWZLnRc` },
  paris: { id: "photo-1502602898657-3e91760cbb34", alt: "The Eiffel Tower rising above Paris", by: "Chris Karidis", page: `${U}nnzkZNYWHaU` },
  rome: { id: "photo-1663143050642-69240b347b2b", alt: "The Colosseum in Rome at golden hour under a clear sky", by: "Matteo del Piano", page: `${U}7Y015gklIDg` },
  london: { id: "photo-1761777773044-f76c0fe5114d", alt: "Tower Bridge over the River Thames in London", by: "Philippe BONTEMPS", page: `${U}9nyPDs7of7k` },
  barcelona: { id: "photo-1583422409516-2895a77efded", alt: "Aerial view of Barcelona city buildings in daylight", by: "Logan Armstrong", page: `${U}hVhfqhDYciU` },
  cancun: { id: "photo-1602088113235-229c19758e9f", alt: "Beach umbrellas on a sandy beach in Cancún", by: "David Vives", page: `${U}ELf8M_YWRTY` },
  "los-angeles": { id: "photo-1757386117831-d4e9bc583076", alt: "Downtown Los Angeles skyline at sunrise", by: "Venti Views", page: `${U}y9eP8uxD4Io` },
  "las-vegas": { id: "photo-1772314323794-1480138dd3f9", alt: "The Las Vegas Strip with the Bellagio fountains at twilight", by: "Scott K", page: `${U}jlTy96QYNRU` },
  "rio-de-janeiro": { id: "photo-1775958489123-2101d2be03d4", alt: "Christ the Redeemer overlooking Rio de Janeiro at sunset", by: "Alan Aprilio", page: `${U}zUJFq4YOYIQ` },
  "buenos-aires": { id: "photo-1725499267114-15531716d101", alt: "Buenos Aires city view with tall buildings and the Obelisco", by: "Ricardo Díaz", page: `${U}6zXclZKqI_8` },
  cusco: { id: "photo-1587595431973-160d0d94add1", alt: "The ancient stone ruins of Machu Picchu among green mountains in Peru", by: "Eddie Kiszka", page: `${U}rFESpq5MMTg` },
  "mexico-city": { id: "photo-1547686669-9a8cb1a22d91", alt: "Aerial view of the Palacio de Bellas Artes dome in Mexico City", by: "Carlos Aguilar", page: `${U}oGRrpBX2ER4` },
  cartagena: { id: "photo-1714686495394-73e2bb1bbd39", alt: "A narrow street lined with colourful colonial buildings in Cartagena's old town", by: "Ricky Beron", page: `${U}acH94SHbWS4` },
  santiago: { id: "photo-1689850543263-01a52ccc6943", alt: "Santiago, Chile with the Andes mountains in the background", by: "Chalo Gallardo", page: `${U}eXL2DYVmq-0` },
  marrakech: { id: "photo-1597212618440-806262de4f6b", alt: "The Koutoubia Mosque minaret rising above Marrakech with the Atlas Mountains behind", by: "Paul Macallan", page: `${U}CFKksjYRSQ8` },
  "cape-town": { id: "photo-1588455471455-4b28e9ab3cd5", alt: "Mountains rising above the sea at Camps Bay, Cape Town", by: "Jaman Asad", page: `${U}FQ03xcur9As` },
  cairo: { id: "photo-1761561044700-4262beec7d63", alt: "The Pyramids of Giza rising from the desert edge near Cairo", by: "Thomas K", page: `${U}ER37sUV9Zzc` },
  zanzibar: { id: "photo-1575999502951-4ab25b5ca889", alt: "White sand beach with palm trees and a wooden pier in Zanzibar", by: "Mulberry Digital", page: `${U}e6dRLBx6Kg8` },
  nairobi: { id: "photo-1519659528534-7fd733a832a0", alt: "A hot air balloon over a herd of zebras in the Maasai Mara, Kenya", by: "sutirta budiman", page: `${U}kjOBqwMUnWw` },
  sydney: { id: "photo-1771760171302-2d60b9a3576f", alt: "The Sydney Opera House at sunset over the harbour", by: "Sung Jin Cho", page: `${U}M7xPhPxyV2Y` },
  melbourne: { id: "photo-1595434971780-79d5c20c5090", alt: "Melbourne city skyline at sunrise with hot air balloons", by: "Urlaubstracker", page: `${U}dW8dOC8r7O4` },
  auckland: { id: "photo-1600208669687-f19af3638cb9", alt: "Auckland city skyline at night", by: "Partha Narasimhan", page: `${U}x0NvSdPk404` },
  queenstown: { id: "photo-1705927161510-0e84f8e1901e", alt: "Aerial view of Lake Wakatipu surrounded by mountains at Queenstown, New Zealand", by: "Sung Jin Cho", page: `${U}K3uTZdnaagM` },
  fiji: { id: "photo-1788052191673-0717c1115f38", alt: "A yellow boat anchored in turquoise water off a white sand beach with palm trees, Monuriki Island, Fiji", by: "Adam Young", page: `${U}ZJyv8SWiEDQ` },
  "antarctic-peninsula": { id: "photo-1551415923-a2297c7fda79", alt: "Chinstrap penguins on snow at Two Hummock Island off the Antarctic Peninsula", by: "Derek Oyen", page: `${U}3Xd5j9-drDA` },
  "weddell-sea": { id: "photo-1585247174031-7ff21755972c", alt: "A tabular iceberg rising from the Weddell Sea, Antarctica", by: "66 north", page: `${U}NaQMJ-xNDWI` },
  "port-lockroy": { id: "wm:Port Lockroy, Antarctica.jpg", alt: "The red-doored Bransfield House hut at Port Lockroy with penguins on the rocks around it", by: "Liam Quinn", page: `https://commons.wikimedia.org/wiki/File:Port_Lockroy,_Antarctica.jpg`, license: { name: "CC BY-SA 2.0", url: "https://creativecommons.org/licenses/by-sa/2.0/" } },
  "paradise-bay": { id: "wm:Paradise Harbour, Antarctica.jpg", alt: "Glaciers and snow-covered mountains reflected in the calm water of Paradise Harbour, Antarctica", by: "Liam Quinn", page: `https://commons.wikimedia.org/wiki/File:Paradise_Harbour,_Antarctica.jpg`, license: { name: "CC BY-SA 2.0", url: "https://creativecommons.org/licenses/by-sa/2.0/" } },
  "deception-island": { id: "wm:Antarctica(js) 41.jpg", alt: "Dark volcanic cliffs and mountains along the coast of Deception Island, Antarctica", by: "Jerzy Strzelecki", page: `https://commons.wikimedia.org/wiki/File:Antarctica(js)_41.jpg`, license: { name: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0/" } },
};

export function destinationPhoto(key: string): BlogPhoto | null {
  return DEST_PHOTOS[key] ?? (PHOTOS as Record<string, BlogPhoto>)[key] ?? null;
}

void U;
