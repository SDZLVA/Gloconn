import type { Destination } from "@/lib/destinations/types";

export const ASIA_NEW: Destination[] = [
  {
    slug: "bali",
    region: "asia",
    rank: 5,
    added: "2026-11-22",
    cityCode: "DPS",
    name: "Bali",
    country: "Indonesia",
    photo: "bali",
    tagline: "Temples, rice terraces and surf beaches, driest from May to September",
    bestMonths: [5, 6, 7, 8, 9],
    title: "Bali travel guide: what to see, when to go, flights and hotels",
    description: "Plan a trip to Bali: temples, rice terraces, beaches, the best months to visit, and a live search for flights and hotels from anywhere in the world.",
    intro: [
      "Bali is an Indonesian island with volcanoes, rice terraces, Hindu temples and a long coast of surf and sunset beaches. You can spend a week in one area or move between the cool hills and the coast.",
      "Where you stay changes the trip a lot. Ubud is calm and green, Canggu and Seminyak are for surf and cafes, and the south has the busiest beaches.",
    ],
    attractions: [
      { name: "Ubud and the rice terraces", text: "Ubud is the cultural centre of the island, with temples, museums, markets and green terraces nearby. It is cooler than the coast and works well even on rainy days." },
      { name: "Uluwatu and Tanah Lot temples", text: "Both are sea temples on dramatic rock edges, and both are popular at sunset. Arrive early to get a good spot." },
      { name: "Mount Batur", text: "A volcano that many visitors climb before dawn to watch the sunrise. Most people go with a local guide." },
      { name: "Nusa Penida", text: "A small island a short boat ride from the main island, known for steep cliffs and clear water. It is usually quieter than the south coast." },
      { name: "Canggu and Seminyak beaches", text: "The west coast has surf breaks, beach clubs and many cafes. It is lively, so choose another area if you want quiet." },
    ],
    bestTime: [
      "Bali has a dry season and a wet season. The dry season runs roughly from April or May to September or October, with sunny days that suit beaches, hiking, diving and surfing. May, June and September are often named as a good balance of dry weather and fewer people.",
      "July and August are the busiest and most expensive months, and Christmas and New Year are busy too. The wet season, roughly November to March, is the cheapest, with heavy but often short rain. Nyepi, the Day of Silence, usually falls around March and almost everything closes for a day, so check the date before you book.",
    ],
    tips: [
      "Compare flights for a few dates; the cheap months can save a lot.",
      "Pick your base area first, because traffic makes moving around slow.",
      "Foreign visitors pay a one-off tourist levy per trip. Check the official Love Bali site for the current rules.",
      "Cover your shoulders and knees at temples, and be ready to wear a sarong there.",
    ],
    faq: [
      { q: "When is the best time to visit Bali?", a: "Roughly May to September, in the dry season. May, June and September usually have good weather and fewer crowds than July and August." },
      { q: "When is Bali cheapest?", a: "In the wet season, roughly November to March, apart from the Christmas and New Year weeks. Expect more rain." },
      { q: "Is there a tourist tax in Bali?", a: "Yes. Foreign visitors pay a one-off levy per trip. Check the official Love Bali website for the amount and how to pay." },
      { q: "How many days do I need in Bali?", a: "About a week is enough for two areas, for example Ubud plus the coast. Add days for Nusa Penida or other islands." },
    ],
    checked: "2026-11-22",
  },
];
