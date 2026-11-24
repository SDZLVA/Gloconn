/**
 * Milestone 90 — Italian versions of the destination pages (/it/destinazioni/<itSlug>).
 *
 * Each entry is written in Italian from the verified English facts in lib/destinations/data.ts and
 * lib/destinations/details.ts (same places, same prices, same dates). It is not a word-for-word
 * translation: titles and questions follow how Italians search. Shared data (photo, best months,
 * flight-search city, region) comes from the English destination with the same `slug`.
 *
 * Rules: own words, no dashes used as punctuation, keep the facts equal to the English page, and
 * update both pages together when a fact changes (the weekly refresh does this).
 */

import type { Attraction } from "@/lib/destinations/types";
import type { FaqItem } from "@/lib/seo/jsonld";

export type ItDestination = {
  /** English destination slug (key into lib/destinations/data.ts). */
  slug: string;
  /** URL part of the Italian page: /it/destinazioni/<itSlug>. */
  itSlug: string;
  name: string;
  country: string;
  tagline: string;
  /** H1. */
  title: string;
  /** At most 160 characters. */
  description: string;
  intro: string[];
  attractions: Attraction[];
  bestTime: string[];
  tips: string[];
  faq: FaqItem[];
  details: {
    gettingAround: string[];
    whereToStay: { area: string; text: string }[];
    costs: string[];
    extraFaq: FaqItem[];
  };
  /** YYYY-MM-DD the facts (same as the English page) were last checked. */
  checked: string;
};

export const IT_DESTINATIONS: readonly ItDestination[] = [
  {
    slug: "paris",
    itSlug: "parigi",
    name: "Parigi",
    country: "Francia",
    tagline: "Musei, caffè e passeggiate lungo la Senna, meglio in primavera e in autunno",
    title: "Guida di viaggio a Parigi: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Parigi: cosa vedere, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Parigi è una città compatta, fatta di grandi musei, passeggiate lungo la Senna, caffè e quartieri antichi. La maggior parte dei luoghi principali si trova vicino al fiume, quindi molto si fa a piedi e in metropolitana.",
      "La città è affollata quasi tutto l'anno. Prenotare in anticipo voli, hotel e i biglietti più richiesti rende il viaggio più semplice e spesso più economico.",
    ],
    attractions: [
      { name: "Torre Eiffel", text: "La torre di ferro è il simbolo della città. Se vuoi salire, prenota online l'orario d'ingresso, oppure goditela dal parco del Champ de Mars." },
      { name: "Il Louvre", text: "Uno dei più grandi musei d'arte del mondo, con la Gioconda. È troppo grande per una sola visita, quindi scegli poche sale." },
      { name: "Notre-Dame e l'Île de la Cité", text: "La cattedrale sorge su un'isola nella Senna. Le strade intorno sono adatte a una passeggiata senza fretta." },
      { name: "Montmartre e il Sacré-Cœur", text: "Un quartiere sulla collina, con vie ripide, piccole piazze e una basilica bianca che offre una vista ampia sulla città." },
      { name: "Passeggiate lungo la Senna", text: "Le rive sono gratuite e vanno bene con ogni tempo. Cammina da un ponte all'altro e fermati alle bancarelle dei libri e ai caffè." },
    ],
    bestTime: [
      "Molte guide indicano la primavera (circa da aprile a giugno) e l'inizio dell'autunno (settembre e ottobre) per il clima mite. Sono anche mesi molto richiesti, quindi trovare un hotel può essere difficile, soprattutto a maggio, giugno, settembre e ottobre.",
      "L'inverno, circa da dicembre a febbraio, di solito è il periodo più economico, con meno visitatori ma giornate fredde e piovose. Luglio e agosto portano folla e caldo. Ad agosto alcuni piccoli ristoranti e negozi chiudono perché molti parigini sono in vacanza, anche se molti restano aperti.",
    ],
    tips: [
      "Prenota voli e hotel con anticipo per la primavera e l'autunno.",
      "Compra online, prima di partire, i biglietti per la Torre Eiffel e per il Louvre.",
      "Controlla i giorni di apertura di ogni museo, perché cambiano da uno all'altro.",
      "In estate scegli un hotel con aria condizionata se il caldo ti dà fastidio.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Parigi?", a: "Circa da aprile a giugno e da settembre a ottobre, quando il clima è mite. Sono anche i mesi più affollati." },
      { q: "Quando costa meno andare a Parigi?", a: "Di solito in inverno, circa da dicembre a febbraio, escluse le vacanze di Natale. In quei mesi voli e hotel spesso costano meno." },
      { q: "Parigi è chiusa ad agosto?", a: "No, ma alcuni piccoli ristoranti e negozi chiudono mentre i parigini sono via. Le attrazioni principali restano aperte e la città è piena di visitatori." },
      { q: "Quanti giorni servono per visitare Parigi?", a: "Tre o quattro giorni bastano per i luoghi principali. Aggiungi giorni se vuoi fare una gita fuori città o visitare un secondo grande museo." },
    ],
    details: {
      gettingAround: [
        "Dall'aeroporto Charles de Gaulle (CDG) il treno RER B arriva nel centro di Parigi in circa 35-50 minuti. Da gennaio 2026 un unico biglietto Paris Region to Airports costa 14 euro (7 euro per i bambini sotto i 10 anni). Lo stesso biglietto vale per la linea 14 della metropolitana da Orly (ORY), che raggiunge Châtelet in meno di 40 minuti.",
        "Nel 2026 i taxi da CDG hanno tariffe fisse: 56 euro per la Rive Droite e 65 euro per la Rive Gauche. L'autobus per l'aeroporto RoissyBus ha smesso di circolare a fine febbraio 2026.",
        "In città un biglietto singolo di metropolitana, RER o treno costa 2,55 euro e uno di autobus o tram 2,05 euro nel 2026. Il Navigo Jour, il pass giornaliero per tutte le zone, costa circa 12 euro. I biglietti di carta stanno sparendo, quindi carica i biglietti su una carta o nell'app Bonjour RATP.",
      ],
      whereToStay: [
        { area: "Le Marais (3° e 4° arrondissement)", text: "Centrale, con facile accesso al Louvre e a Notre-Dame. È la scelta più comune per una prima visita." },
        { area: "Quartiere Latino (5°)", text: "Una zona vivace sulla Rive Gauche, subito oltre la Senna rispetto al Marais." },
        { area: "Saint-Germain-des-Prés (6°)", text: "Caffè storici e l'atmosfera artistica della Rive Gauche. Fa per te se il budget lo permette." },
        { area: "1° arrondissement", text: "La base più vicina al Louvre e al giardino delle Tuileries, tranquilla la sera." },
        { area: "Montmartre (18°)", text: "Gli hotel qui tendono a costare un po' meno che in altre zone centrali, quindi è una buona scelta per il rapporto qualità prezzo." },
      ],
      costs: [
        "Le stime sono diverse. Una guida del 2026 indica circa 95-120 euro al giorno per chi viaggia con budget ridotto e 150-220 euro per chi sceglie una fascia media, letto compreso. Un posto in dormitorio in ostello costa circa 28-45 euro a notte.",
        "Aggiungi la tassa di soggiorno sugli hotel, che si paga per adulto e per notte e va da meno di 1 euro a circa 16 euro a seconda del tipo di alloggio. Una grande attrazione costa in media circa 24 euro a biglietto.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto Charles de Gaulle al centro di Parigi?", a: "Prendi il treno RER B. Impiega circa 35-50 minuti per arrivare alle stazioni centrali come Gare du Nord e Châtelet, e un biglietto singolo dall'aeroporto costa 14 euro nel 2026." },
        { q: "Quanto costa un biglietto della metropolitana a Parigi?", a: "Nel 2026 un biglietto singolo di metropolitana, RER o treno costa 2,55 euro e uno di autobus o tram 2,05 euro. I biglietti da e per gli aeroporti costano 14 euro." },
      ],
    },
    checked: "2026-11-22",
  },
];

/** The Italian hub is hidden from search engines until this many Italian pages exist. */
export const IT_HUB_MIN_PAGES = 5;

export function findItDestination(itSlug: string): ItDestination | null {
  return IT_DESTINATIONS.find((d) => d.itSlug === itSlug) ?? null;
}

/** The Italian page for an English destination slug, if there is one. */
export function italianFor(slug: string): ItDestination | null {
  return IT_DESTINATIONS.find((d) => d.slug === slug) ?? null;
}
