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
  /** Italian preposition that goes before the name: "a" by default, "alle" for the Maldive. */
  at?: string;
  /** Italian version of the English gatewayNote (Antarctic pages). */
  gatewayNote?: string;
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
  {
    slug: "rome",
    itSlug: "roma",
    name: "Roma",
    country: "Italia",
    tagline: "Rovine antiche, piazze e pasta, clima mite in primavera e in autunno",
    title: "Guida di viaggio a Roma: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Roma: Colosseo, Vaticano, quando andare e una ricerca di voli e hotel. Guida pratica con costi e trasporti.",
    intro: [
      "Roma racchiude duemila anni di storia in una sola città: rovine antiche, chiese, fontane e piazze affollate. Gran parte del centro si attraversa a piedi, e camminare fa parte del divertimento.",
      "I luoghi più famosi hanno lunghe code, quindi un po' di organizzazione serve. Prenota in anticipo i più richiesti e lascia tempo per girare senza meta.",
    ],
    attractions: [
      { name: "Il Colosseo e il Foro Romano", text: "La grande arena di pietra e le rovine accanto mostrano il cuore dell'antica Roma. Le visite speciali, come quella ai sotterranei, hanno posti limitati, quindi prenotale in anticipo." },
      { name: "Musei Vaticani e San Pietro", text: "I musei finiscono nella Cappella Sistina. Prenota data e orario in anticipo, soprattutto nei mesi più affollati, e per la basilica indossa abiti che coprano spalle e ginocchia." },
      { name: "Pantheon", text: "Un tempio antico ben conservato, con una grande cupola e un'apertura al centro del tetto. Controlla le regole attuali sui biglietti prima di andare." },
      { name: "Fontana di Trevi e il centro storico", text: "La fontana è affollata a qualsiasi ora, quindi prova la mattina presto. Le strade e le piazze vicine sono adatte a una passeggiata serale." },
      { name: "Galleria Borghese", text: "Un museo d'arte dentro un grande parco, con ingresso a orari rigidi. Prenota in anticipo, soprattutto in alta stagione." },
    ],
    bestTime: [
      "La primavera (circa da aprile a giugno) e l'inizio dell'autunno (settembre e ottobre) sono indicati da molti come i periodi migliori, con giornate calde e notti più fresche. Maggio e settembre possono costare di più, quindi prenota presto.",
      "L'estate, circa da giugno ad agosto, è calda e affollata. Verso la metà di agosto molti romani lasciano la città, e alcune fonti dicono che in quel periodo gli hotel costano meno. L'inverno, circa da novembre a febbraio, è il periodo più economico e tranquillo, con code più corte ma tempo freddo e piovoso. I prezzi salgono intorno a Pasqua, Natale e Capodanno.",
    ],
    tips: [
      "Prenota in anticipo i Musei Vaticani e la Galleria Borghese per il giorno scelto.",
      "Porta scarpe comode, perché le strade sono lastricate di sampietrini.",
      "In estate programma le visite al mattino e riposa nelle ore più calde del pomeriggio.",
      "Copri spalle e ginocchia quando entri nelle chiese.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Roma?", a: "Circa da aprile a giugno e da settembre a ottobre, quando fa caldo ma non troppo." },
      { q: "Quando costa meno andare a Roma?", a: "Di solito in inverno, circa da novembre a febbraio, escluso il periodo di Natale. Alcune fonti segnalano hotel meno cari anche nel momento più caldo dell'estate." },
      { q: "Serve prenotare i biglietti in anticipo?", a: "Per i Musei Vaticani e la Galleria Borghese sì, soprattutto nei mesi affollati. Anche per le visite speciali al Colosseo." },
      { q: "Quanti giorni servono per visitare Roma?", a: "Tre giorni bastano per i luoghi principali. Con quattro o più giorni vai più piano e puoi aggiungere una gita fuori città." },
    ],
    details: {
      gettingAround: [
        "Il Leonardo Express è il treno diretto dall'aeroporto di Fiumicino (FCO) a Roma Termini. Impiega 32 minuti, costa 14 euro e parte circa ogni 15 minuti dalla mattina presto fino a sera tardi. I treni regionali FL1 collegano l'aeroporto con altre stazioni di Roma.",
        "Un taxi da Fiumicino al centro ha una tariffa fissa ufficiale di 55 euro.",
        "In città un biglietto singolo ATAC costa 1,50 euro e vale 100 minuti, con una corsa in metropolitana e cambi illimitati tra autobus e tram. Un pass di 24 ore costa 7 euro e uno di 48 ore 12,50 euro. Il centro è compatto: dal Colosseo al Vaticano sono circa 4 km a piedi.",
      ],
      whereToStay: [
        { area: "Centro Storico", text: "Il centro storico, con il Pantheon, Piazza Navona e la Fontana di Trevi raggiungibili a piedi. È la scelta abituale per chi viene la prima volta." },
        { area: "Monti", text: "Un quartiere da girare a piedi accanto al Colosseo, con un'atmosfera da paese, spesso consigliato a chi visita Roma per la prima volta." },
        { area: "Trastevere", text: "Dall'altra parte del fiume, noto per l'atmosfera e la vita notturna." },
        { area: "Prati", text: "Una base più tranquilla vicino al Vaticano." },
        { area: "Testaccio", text: "Adatto a chi ama il cibo e vuole un'atmosfera più locale." },
      ],
      costs: [
        "Le stime sono diverse. Lonely Planet suggerisce di calcolare da 100 a 250 euro al giorno a persona, mentre le guide low cost indicano circa 60-100 euro con ostello o semplice B&B, cibo di strada e tanto cammino.",
        "Roma applica una tassa di soggiorno a persona e a notte, che le guide indicano tra circa 3 e 10 euro a seconda dell'hotel. Gli hotel costano di solito meno da fine novembre a inizio marzo e di più a luglio e ad agosto.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Fiumicino al centro di Roma?", a: "Il Leonardo Express arriva diretto a Roma Termini in 32 minuti per 14 euro. Un taxi ha una tariffa fissa di 55 euro, e i treni regionali FL1 collegano l'aeroporto con altre stazioni di Roma." },
        { q: "Quanto costa un biglietto di autobus o metropolitana a Roma?", a: "Un biglietto singolo costa 1,50 euro e vale 100 minuti, con una corsa in metropolitana e cambi illimitati tra autobus e tram. Un pass di 24 ore costa 7 euro." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "london",
    itSlug: "londra",
    name: "Londra",
    country: "Regno Unito",
    tagline: "Musei gratuiti, luoghi reali e grandi parchi, più affollata d'estate",
    title: "Guida di viaggio a Londra: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Londra: luoghi da vedere, musei gratuiti, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Londra è una città enorme, con palazzi reali, musei di livello mondiale, grandi parchi e mercati in ogni quartiere. La metropolitana, la Underground, rende facile coprire lunghe distanze.",
      "Può essere cara, ma molti dei musei e delle gallerie più importanti sono gratuiti, e questo aiuta molto il budget.",
    ],
    attractions: [
      { name: "British Museum", text: "Un museo enorme con reperti di tutto il mondo. L'ingresso generale è gratuito, mentre alcune mostre speciali si pagano a parte." },
      { name: "Tower of London e Tower Bridge", text: "L'antica fortezza sul Tamigi custodisce i gioielli della Corona. Tower Bridge è a pochi passi ed è ottimo per le foto." },
      { name: "National Gallery e Trafalgar Square", text: "La galleria ha dipinti europei di molti secoli e l'ingresso è gratuito. La piazza qui fuori è un buon punto d'incontro." },
      { name: "Buckingham Palace e i parchi reali", text: "Guarda il cambio della guardia, che è gratuito, poi passeggia in Hyde Park e negli altri parchi vicini." },
      { name: "Tate Modern e la South Bank", text: "Arte moderna in una ex centrale elettrica, con ingresso gratuito e un percorso lungo il fiume verso altri luoghi da vedere." },
    ],
    bestTime: [
      "A Londra non esiste una stagione delle piogge, perché può piovere in qualsiasi mese. L'estate è il periodo più caldo, mentre primavera e autunno sono miti. Molte guide consigliano da maggio a luglio e settembre per il miglior equilibrio tra tempo ed eventi.",
      "Da giugno a settembre è il periodo più affollato e caro, con vacanze scolastiche e grandi eventi. Sono affollate anche le settimane di pausa scolastica di febbraio, intorno a Pasqua e a ottobre. Da gennaio a marzo di solito costa meno, anche se fa fresco e può essere piovoso. In estate la Underground può diventare molto calda, perché ha poca aria condizionata.",
    ],
    tips: [
      "Sfrutta i musei e le gallerie gratuiti per risparmiare.",
      "Prenota presto i voli per l'estate e per le vacanze scolastiche.",
      "Porta una giacca leggera antipioggia in qualsiasi mese.",
      "Prenota online prima di partire la Tower of London e le altre attrazioni a pagamento.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Londra?", a: "Circa da maggio a luglio e a settembre, per un clima mite o caldo e molte cose da fare. L'estate è anche il periodo più affollato." },
      { q: "Quando costa meno andare a Londra?", a: "Di solito da gennaio a marzo, fuori dalle settimane di vacanza scolastica. Fa più fresco e a volte piove." },
      { q: "Quali musei di Londra sono gratuiti?", a: "Molti lo sono, tra cui il British Museum, la National Gallery, la Tate Modern e il Natural History Museum. Le mostre speciali possono costare extra." },
      { q: "Quanti giorni servono per visitare Londra?", a: "Tre o quattro giorni bastano per i luoghi principali. Con cinque o più giorni puoi visitare i musei con calma e aggiungere una gita fuori città." },
    ],
    details: {
      gettingAround: [
        "Da Heathrow la Elizabeth line arriva nel centro di Londra in meno di 40 minuti. La tariffa di sola andata è salita a 15,50 sterline a marzo 2026. L'Heathrow Express è più veloce: 15 minuti senza fermate fino a Paddington, con tariffe in anticipo da circa 10 sterline. La linea Piccadilly è l'opzione su rotaia più economica, intorno alle 6 sterline, ma impiega da 50 a 60 minuti.",
        "In città paga con la stessa carta contactless o con lo smartphone a ogni viaggio, oppure usa una Oyster card. Le tariffe hanno un tetto giornaliero: per le zone 1 e 2 il tetto giornaliero per adulti è di 8,90 sterline nel 2026 e quello settimanale, da lunedì a domenica, di 44,70 sterline. Una corsa in autobus costa 1,75 sterline, con un tetto giornaliero per gli autobus di 5,25 sterline.",
      ],
      whereToStay: [
        { area: "Covent Garden e Soho", text: "La scelta più centrale, con teatri, ristoranti e molti luoghi da vedere raggiungibili a piedi." },
        { area: "Westminster", text: "Il cuore storico e politico della città, con il Big Ben, il Parlamento e il Tamigi." },
        { area: "South Bank e Southwark", text: "Una base sul fiume, dall'altra parte del ponte rispetto al centro, con il London Eye vicino e belle passeggiate lungo il Tamigi." },
        { area: "Bayswater e Hyde Park", text: "Accanto a Hyde Park e ai Kensington Gardens." },
        { area: "Shoreditch", text: "Nell'East End, nota per il fermento culturale, adatta a un soggiorno meno tradizionale." },
      ],
      costs: [
        "Londra è una delle città più care d'Europa, e le guide danno cifre giornaliere molto diverse. Una stima del 2026 va da circa 75 a 260 sterline al giorno a persona, voli esclusi, e l'hotel è la voce che incide di più.",
        "Il cibo può costare da 15 a 20 sterline al giorno se prepari qualche pasto da te, e da 30 a 50 sterline con uno o due pasti di fascia media fuori. Molti grandi musei hanno l'ingresso gratuito, mentre le attrazioni a pagamento più note costano spesso 30-40 sterline o più a adulto.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Heathrow al centro di Londra?", a: "La Elizabeth line impiega meno di 40 minuti e da marzo 2026 costa 15,50 sterline di sola andata. L'Heathrow Express impiega 15 minuti fino a Paddington, e la linea Piccadilly è la più economica, a circa 6 sterline." },
        { q: "Serve una Oyster card a Londra?", a: "No. Una carta bancaria contactless o lo smartphone danno le stesse tariffe e gli stessi tetti giornalieri di una Oyster card. Usa la stessa carta per ogni viaggio, così il tetto si applica." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "barcelona",
    itSlug: "barcellona",
    name: "Barcellona",
    country: "Spagna",
    tagline: "Gaudí, vicoli antichi e spiagge in città, meglio in primavera e in autunno",
    title: "Guida di viaggio a Barcellona: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Barcellona: Gaudí, vicoli antichi, spiagge, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Barcellona unisce architettura insolita, vie medievali, mercati del cibo e spiagge in città. Il centro è compatto, e metropolitana e camminate coprono quasi tutto.",
      "I luoghi più famosi esauriscono i biglietti, quindi prenota prima di arrivare.",
    ],
    attractions: [
      { name: "Sagrada Família", text: "La chiesa incompiuta di Gaudí è il luogo più visitato della città. I biglietti si vendono online, quindi prenota presto, ancora di più se vuoi salire su una torre." },
      { name: "Park Güell", text: "Un parco sulla collina con dettagli a mosaico e vista sulla città. L'ingresso all'area principale è a orari fissi e si compra online, quindi prenota in anticipo." },
      { name: "Casa Batlló", text: "Una casa di Gaudí sul Passeig de Gràcia, con la facciata colorata e le stanze all'interno. Prenota qualche giorno prima nei mesi affollati." },
      { name: "Il Barri Gòtic", text: "Vicoli medievali e piccole piazze nel centro storico. Si esplora meglio a piedi, senza un programma." },
      { name: "Spiagge e lungomare", text: "Le spiagge della città si raggiungono facilmente in metropolitana. Vanno bene per una passeggiata o un bagno in estate." },
    ],
    bestTime: [
      "Primavera e inizio autunno sono indicati da molti come i periodi migliori. Maggio e settembre spiccano per il clima piacevole e un calendario vivace, con eventi come Sant Jordi ad aprile e la Mercè a settembre.",
      "L'estate, circa da giugno ad agosto, è la stagione più affollata, e luglio e agosto possono essere caldi e umidi. L'inverno, fuori dal periodo di Natale, di solito è il più economico e tranquillo, anche se le giornate sono più fresche e corte. Le tariffe degli hotel tendono a calare da settembre.",
    ],
    tips: [
      "Prenota online la Sagrada Família e il Park Güell il prima possibile.",
      "Arriva presto nei luoghi più affollati per evitare le code più lunghe.",
      "In estate programma la spiaggia e il riposo nelle ore più calde.",
      "Confronta i voli per più date, perché lo stesso viaggio può costare meno una settimana dopo.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Barcellona?", a: "Circa da maggio a giugno e da settembre a ottobre, per un clima caldo e meno folla che in piena estate." },
      { q: "Quando costa meno andare a Barcellona?", a: "Di solito in inverno, fuori da Natale, e le tariffe degli hotel spesso calano da settembre. L'estate è il periodo più affollato." },
      { q: "Serve prenotare la Sagrada Família in anticipo?", a: "Sì. I biglietti si vendono online e le date più richieste si esauriscono. Prenota il prima possibile, soprattutto per salire su una torre." },
      { q: "Quanti giorni servono per visitare Barcellona?", a: "Tre giorni bastano per i luoghi principali. Aggiungi un giorno per la spiaggia o per una gita fuori città." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Barcellona (BCN) dista circa 15 km dal centro. L'Aerobus collega l'aeroporto alla città circa ogni 5-10 minuti e impiega circa 35 minuti. Un biglietto singolo costa circa 7 euro, e le fonti indicano prezzi leggermente diversi, quindi controlla il sito dell'operatore.",
        "La metropolitana L9 Sud richiede un biglietto speciale Airport da circa 5,90 euro nel 2026. Il biglietto singolo ordinario e la carta T-casual non sono accettati alle stazioni della metropolitana dell'aeroporto. Il treno R2 Nord dal Terminal 2 e l'autobus 46 accettano invece la T-casual.",
        "In città una T-casual da 10 corse costa circa 13 euro, cioè circa 1,30 euro a corsa, e un biglietto singolo della zona 1 circa 2,90 euro. La maggior parte dei luoghi da vedere è nella zona 1. I taxi dall'aeroporto partono da circa 21 euro con i supplementi e di solito arrivano a 30-45 euro per il centro.",
      ],
      whereToStay: [
        { area: "Barri Gòtic", text: "La scelta abituale per la prima visita, con vicoli medievali stretti, la Cattedrale e la Rambla vicine." },
        { area: "Eixample", text: "Una griglia di strade larghe con edifici di Gaudí e il Passeig de Gràcia, e una buona copertura della metropolitana." },
        { area: "El Born", text: "Noto per bar, boutique e il Museo Picasso, una buona scelta per le coppie." },
        { area: "Gràcia", text: "Un quartiere più tranquillo, quasi da paese, che le guide spesso consigliano alle famiglie." },
        { area: "Barceloneta", text: "La zona più vicina alla spiaggia, anche se diverse guide avvertono che per mangiare è molto turistica." },
      ],
      costs: [
        "Una guida del 2026 indica per un visitatore tipo da 80 a 220 euro al giorno, da circa 80 euro per chi viaggia con poco budget a 150-180 euro per la fascia media. Dormire a Gràcia, Poble-sec, Sant Antoni o Poblenou invece che nel Barri Gòtic può ridurre i costi dell'alloggio di circa il 20-40 per cento.",
        "La Catalogna ha circa raddoppiato la tassa di soggiorno dal 1° aprile 2026. Si paga a persona e a notte, in aggiunta al prezzo della camera, e dipende dal tipo di struttura. Le guide indicano cifre da circa 8 a 15 euro a notte per gli hotel a 4 e 5 stelle, quindi controlla l'importo per la tua prenotazione.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Barcellona al centro?", a: "L'Aerobus impiega circa 35 minuti per arrivare in centro e costa circa 7 euro. Il treno R2 Nord e l'autobus 46 accettano la carta T-casual, mentre la metropolitana L9 richiede un biglietto speciale Airport da circa 5,90 euro." },
        { q: "Posso usare la carta T-casual all'aeroporto di Barcellona?", a: "Non alle stazioni della metropolitana L9 dell'aeroporto. Funziona invece sul treno R2 Nord e sull'autobus 46, ed è il modo più economico per usare metropolitana, autobus e tram della città." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "new-york",
    itSlug: "new-york",
    name: "New York",
    country: "Stati Uniti",
    tagline: "Luci e mercatini di Natale da fine novembre",
    title: "Guida di viaggio a New York: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a New York: monumenti, musei, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "New York è fatta di cinque distretti pieni di monumenti, musei, cibo e quartieri. Le attrazioni principali si vedono in pochi giorni, ma la città premia chi si ferma più a lungo.",
    ],
    attractions: [
      { name: "Central Park", text: "Un enorme parco nel cuore di Manhattan, ottimo per camminare, andare in barca e osservare la gente in ogni stagione." },
      { name: "Statua della Libertà ed Ellis Island", text: "I traghetti partono da Battery Park e da Liberty State Park. Prenota i biglietti in anticipo nei periodi affollati." },
      { name: "Ponte di Brooklyn", text: "Attraversalo all'alba o la sera per godere della vista sullo skyline." },
      { name: "Il Met e gli altri musei", text: "Il Metropolitan Museum of Art è enorme, quindi scegli alcune sezioni invece di provare a vedere tutto." },
      { name: "La High Line", text: "Un parco sopraelevato costruito su una vecchia linea ferroviaria, sul lato ovest di Manhattan." },
      { name: "Times Square", text: "Trafficata e luminosa. Quasi tutti vogliono vederla una volta, meglio la sera." },
    ],
    bestTime: [
      "Fine novembre e dicembre portano luci, mercatini e vetrine di Natale, ma sono anche le settimane più affollate e care. Primavera e autunno (intorno a maggio e a ottobre) sono miti e adatti a camminare.",
      "Da gennaio a inizio marzo di solito è il periodo più economico, ma fa freddo.",
    ],
    tips: [
      "Prenota presto gli hotel per dicembre, perché i prezzi salgono in fretta.",
      "Usa la metropolitana invece dei taxi per la maggior parte degli spostamenti.",
      "Prenota in anticipo le attrazioni più richieste nelle settimane di punta.",
      "Controlla le regole di ingresso e l'eventuale autorizzazione di viaggio per il tuo passaporto.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare New York?", a: "Maggio e ottobre sono miti e adatti a camminare. Fine novembre e dicembre hanno le luci di Natale, con prezzi più alti." },
      { q: "Quando costa meno andare a New York?", a: "Da gennaio a inizio marzo di solito i prezzi sono più bassi, ma fa freddo." },
      { q: "Quanti giorni servono per visitare New York?", a: "Quattro o cinque giorni bastano per i luoghi principali. Con una settimana puoi esplorare i quartieri." },
    ],
    details: {
      gettingAround: [
        "Dal JFK la soluzione più economica è l'AirTrain fino alla metropolitana. La tariffa dell'AirTrain è di 8,75 dollari nel 2026 e la metropolitana costa 3 dollari, quindi circa 11,75 dollari in totale e da 60 a 90 minuti. Un taxi giallo dal JFK a Manhattan ha una tariffa fissa di 70 dollari più pedaggi e mancia.",
        "Da Newark l'AirTrain e il NJ Transit arrivano a Penn Station in circa 45-60 minuti per circa 15-17 dollari. LaGuardia non ha un AirTrain. L'autobus Q70 per la metropolitana è gratuito, e i taxi con tassametro per Manhattan costano di solito da 45 a 75 dollari.",
        "In città appoggia una carta contactless o lo smartphone sul lettore OMNY. Una corsa in metropolitana o su un autobus locale costa 3 dollari nel 2026, con un cambio gratuito entro due ore, e le corse sono gratuite dopo 12 corse pagate in una settimana. La MetroCard è stata eliminata a gennaio 2026.",
      ],
      whereToStay: [
        { area: "Midtown Manhattan", text: "La base abituale per la prima visita, con Times Square, i teatri, molte linee della metropolitana e collegamenti facili con gli aeroporti." },
        { area: "Greenwich Village e SoHo", text: "Il Greenwich Village era un tempo il centro della New York bohémien. SoHo è nota per lo shopping e per gli hotel nella fascia alta dei prezzi." },
        { area: "Upper West Side", text: "Un quartiere che le guide consigliano alle famiglie." },
        { area: "Long Island City (Queens)", text: "Spesso più conveniente di Manhattan, con collegamenti in metropolitana attraverso il fiume." },
        { area: "Downtown Brooklyn e Williamsburg", text: "Buon cibo e vita notturna dall'altra parte del fiume, con Downtown Brooklyn spesso più conveniente di Manhattan e Williamsburg scelta alla moda." },
      ],
      costs: [
        "New York è cara, e le guide non sono d'accordo tra loro. Una stima del 2026 indica circa 140 dollari al giorno per chi viaggia con poco budget e circa 385 dollari a persona per la fascia media, voli esclusi, mentre alcune guide riportano cifre più basse, da 80 a 130 dollari.",
        "L'hotel è la spesa maggiore. Long Island City e Downtown Brooklyn sono spesso più economiche di Manhattan, ma valuta il risparmio rispetto al tempo di viaggio in più.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto JFK a Manhattan?", a: "Il modo più economico è l'AirTrain più la metropolitana, circa 11,75 dollari e da 60 a 90 minuti. Un taxi giallo ha una tariffa fissa di 70 dollari più pedaggi e mancia." },
        { q: "Quanto costa la metropolitana a New York?", a: "Nel 2026 una corsa costa 3 dollari, pagati appoggiando una carta contactless o lo smartphone sul lettore OMNY. Hai un cambio gratuito entro due ore." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "dubai",
    itSlug: "dubai",
    name: "Dubai",
    country: "Emirati Arabi Uniti",
    tagline: "Sole, grattacieli e souk da novembre a marzo",
    title: "Guida di viaggio a Dubai: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Dubai: Burj Khalifa, souk, deserto, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Dubai è una città di torri da record, lunghe spiagge, bordi di deserto e antichi quartieri commerciali, tutto nella stessa area urbana. Va bene per uno scalo di qualche giorno e per una vacanza di una settimana.",
      "La scelta principale è il periodo. I mesi più miti sono anche i più affollati, quindi prenota presto voli e hotel.",
    ],
    attractions: [
      { name: "Burj Khalifa e Dubai Mall", text: "Il Burj Khalifa è l'edificio più alto del mondo. Accanto, il Dubai Mall ha lo spettacolo della fontana la sera e molti spazi al chiuso per i pomeriggi caldi." },
      { name: "La vecchia Dubai e il Creek", text: "Passeggia nel quartiere di Al Fahidi, attraversa il Creek su una piccola barca abra e gira tra i souk dell'oro e delle spezie, per vedere un lato molto diverso della città." },
      { name: "Safari nel deserto", text: "Le gite di mezza giornata ti portano fuori città tra le dune, con una cena in un campo. Scegli un operatore affidabile e controlla cosa è incluso." },
      { name: "Palm Jumeirah e le spiagge", text: "Le spiagge pubbliche costeggiano la riva, e sulla Palm ci sono hotel, ristoranti e vista sul mare. Il mare è più piacevole nei mesi freschi." },
      { name: "Museum of the Future", text: "Un edificio scenografico con mostre su tecnologia e futuro. I biglietti hanno di solito un orario, quindi prenota in anticipo nelle settimane di punta." },
    ],
    bestTime: [
      "Molte guide indicano il clima migliore circa da novembre a marzo, e alcune lo estendono ad aprile. Le giornate sono calde ma non estreme, quindi passeggiate, spiagge e deserto sono tutti piacevoli.",
      "Inizio novembre e fine marzo sono spesso i margini più economici della stagione, mentre dicembre e le settimane di vacanze scolastiche sono le più affollate e care. L'estate è bassa stagione: gli hotel abbassano i prezzi, ma il caldo è intenso e quasi tutte le attività si spostano al chiuso.",
    ],
    tips: [
      "Confronta i voli per qualche data, perché lo stesso viaggio può costare meno una settimana prima o dopo.",
      "In inverno prenota l'hotel con largo anticipo per le settimane di Natale e Capodanno.",
      "In estate programma le attività all'aperto al mattino presto o alla sera.",
      "Controlla le regole sul visto per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Dubai?", a: "Circa da novembre a marzo, quando il clima è caldo ma non estremo. Inizio novembre e fine marzo costano spesso meno di dicembre." },
      { q: "Dubai costa meno in estate?", a: "Di solito i prezzi degli hotel scendono in estate, che è bassa stagione, ma il caldo è intenso. Molti ci vanno solo se pensano di fare soprattutto attività al chiuso." },
      { q: "Quanti giorni servono per visitare Dubai?", a: "Da tre a quattro giorni bastano per i luoghi principali. Aggiungi giorni se vuoi più tempo in spiaggia o una gita nel deserto." },
    ],
    details: {
      gettingAround: [
        "Il Dubai International (DXB) ha stazioni della metropolitana ai Terminal 1 e 3, e la Linea Rossa va dall'aeroporto al Downtown fino alla Marina. Il Terminal 2, usato dalle compagnie low cost come flydubai e Air Arabia, non è sulla metropolitana, quindi lì serve un taxi o un'app di trasporto.",
        "Per viaggiare serve una carta nol. Una nol Silver costa 25 dirham con 19 dirham di credito inclusi, e un biglietto di carta Red costa 2 dirham. Le tariffe Silver sono 3 dirham per una zona, 5 per due zone e 7,50 per tre o più, quindi dall'aeroporto al Downtown si pagano circa 7,50 dirham. La metropolitana funziona dalle 5 circa a mezzanotte, più a lungo il venerdì e dalle 8 la domenica.",
        "I taxi dall'aeroporto partono da circa 25 dirham sul tassametro, e si aggiungono tempo di attesa e pedaggi Salik. La stessa carta nol vale anche su tram, autobus e trasporti via acqua.",
      ],
      whereToStay: [
        { area: "Downtown Dubai", text: "La scelta per chi viene la prima volta, accanto al Burj Khalifa e al Dubai Mall, con la metropolitana vicina." },
        { area: "Dubai Marina e JBR", text: "La scelta per spiaggia, ristoranti e vita notturna. Queste zone si affollano il giovedì e il venerdì." },
        { area: "Deira e Bur Dubai", text: "I quartieri più antichi sui due lati del Creek, con le camere più economiche e i souk, e buoni collegamenti in metropolitana." },
        { area: "Business Bay", text: "Vicina al Downtown, spesso a prezzi più bassi." },
        { area: "Palm Jumeirah e Jumeirah", text: "Resort di lusso sulla spiaggia. Sulla Palm non c'è una stazione della metropolitana." },
      ],
      costs: [
        "Le guide non sono d'accordo. Una stima del 2026 indica per persona circa 73 dollari al giorno con poco budget e circa 339 dollari in fascia media, mentre un'altra indica circa 175 dollari per la fascia media. Contano soprattutto gli hotel: le camere a due e tre stelle a Deira e Bur Dubai sono indicate da circa 150 a 350 dirham a notte, contro diverse centinaia o più nel Downtown e alla Marina.",
        "Le tariffe pubblicate degli hotel spesso escludono dei costi extra. Dubai aggiunge una tassa Tourism Dirham di circa 7-20 dirham a camera e a notte, a seconda della categoria dell'hotel, e molti hotel aggiungono spese di servizio e una tassa comunale. I trasporti pubblici costano poco e Dubai si visita meglio circa da novembre a marzo.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Dubai al centro in metropolitana?", a: "Prendi la Linea Rossa dal Terminal 1 o 3 con una carta nol. Il viaggio fino al Downtown costa circa 7,50 dirham e dura circa 30 minuti. Il Terminal 2 non ha una stazione della metropolitana." },
        { q: "Serve una carta nol a Dubai?", a: "Sì per metropolitana, tram e autobus, perché ai varchi non si accettano contanti. Una carta Silver costa 25 dirham con 19 dirham di credito e si compra alle stazioni della metropolitana dell'aeroporto." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "bangkok",
    itSlug: "bangkok",
    name: "Bangkok",
    country: "Thailandia",
    tagline: "Templi, cibo di strada e vita sul fiume, ora fresca e asciutta",
    title: "Guida di viaggio a Bangkok: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Bangkok: templi, mercati, cibo di strada, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Bangkok mescola templi dorati, barche sul fiume, grandi mercati e alcuni dei migliori cibi di strada dell'Asia. È anche un grande scalo aereo, quindi molte rotte verso il resto del Sud-est asiatico partono da qui.",
    ],
    attractions: [
      { name: "Grand Palace e Wat Phra Kaew", text: "Il complesso reale è il luogo più visitato della città. Valgono regole di abbigliamento (spalle e ginocchia coperte) ed è meglio andarci la mattina presto." },
      { name: "Wat Pho", text: "Ospita il lungo Buddha sdraiato, vicino al Grand Palace, quindi i due luoghi stanno in una sola mattina." },
      { name: "Wat Arun", text: "Il tempio sul fiume con la guglia alta si vede meglio dall'altra riva del Chao Phraya al tramonto." },
      { name: "Chatuchak Weekend Market", text: "Un enorme mercato con migliaia di bancarelle, aperto nei fine settimana. Vai presto e porta dell'acqua." },
      { name: "Cibo di strada a Yaowarat (Chinatown)", text: "Le strade del cibo la sera sono un buon posto per assaggiare tanti piatti piccoli. Vai con appetito e scegli le bancarelle affollate." },
      { name: "Barche sul Chao Phraya", text: "I battelli pubblici sul fiume sono un modo economico per spostarsi tra i luoghi da vedere ed evitare il traffico." },
    ],
    bestTime: [
      "La stagione fresca e asciutta va circa da novembre a febbraio, con il clima più piacevole e i prezzi più alti. Da marzo a maggio fa caldo, e la stagione delle piogge va circa da giugno a ottobre, con acquazzoni spesso brevi ma forti.",
      "Se vuoi prezzi più bassi e sopporti caldo o pioggia, le stagioni intermedie e quelle piovose possono essere convenienti.",
    ],
    tips: [
      "Porta un indumento leggero: centri commerciali, treni e autobus hanno un'aria condizionata molto forte.",
      "Usa i battelli sul fiume e i treni BTS e MRT per evitare il traffico.",
      "Prenota l'hotel presto per dicembre e gennaio.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Bangkok?", a: "Circa da novembre a febbraio c'è la stagione fresca e asciutta, con il clima migliore. È anche il periodo più caro." },
      { q: "La stagione delle piogge è un brutto periodo per andare?", a: "Non necessariamente. La pioggia arriva spesso a tratti brevi e i prezzi sono più bassi, ma le strade possono allagarsi e c'è molta umidità." },
      { q: "Quanti giorni servono per visitare Bangkok?", a: "Tre giorni bastano per i templi, i mercati e il cibo principali. Molti inseriscono Bangkok in un viaggio più lungo in Thailandia." },
    ],
    details: {
      gettingAround: [
        "Da Suvarnabhumi (BKK) l'Airport Rail Link parte dal livello interrato e arriva a Phaya Thai in circa 26-30 minuti per 45 baht, dalle 05:30 a mezzanotte. Phaya Thai è collegata alla BTS Skytrain, e Makkasan alla MRT. Un taxi o Grab per Sukhumvit o Silom richiede di solito da 45 a 60 minuti, di più nelle ore di punta, e i taxi dell'aeroporto aggiungono un supplemento di 50 baht più i pedaggi stradali.",
        "BTS e MRT sono sistemi separati, quindi cambiare tra l'uno e l'altro di solito significa pagare una nuova tariffa. Le tariffe BTS vanno da 17 a circa 65 baht, e quelle della Linea Blu MRT da 17 a 44 baht dopo il cambio di tariffe del 3 luglio 2026. Una guida riporta una tariffa ferroviaria comune di 17-45 baht dal 1° gennaio 2027, quindi controlla prima di partire.",
      ],
      whereToStay: [
        { area: "Sukhumvit", text: "La scelta più comune per chi viene la prima volta, con la BTS, negozi, cibo, vita notturna e hotel di molte fasce di prezzo." },
        { area: "Silom e Sathorn", text: "Una base centrale tra la Città Vecchia e Sukhumvit, vicina al Lumphini Park." },
        { area: "Città Vecchia (Rattanakosin)", text: "Vicina al Grand Palace e a Wat Pho. Khao San Road ha i letti più economici, e le guide consigliano di stare vicino ad essa e non sulla strada stessa." },
        { area: "Lungofiume", text: "Più tranquillo, con hotel di lusso sul fiume Chao Phraya e accesso in barca ai templi." },
        { area: "Siam", text: "La zona dello shopping, che le guide consigliano spesso alle famiglie." },
      ],
      costs: [
        "Le guide indicano fasce diverse. Un confronto del 2026 indica ostelli da circa 10 a 30 sterline a notte e hotel economici da 30 a 70 sterline, con il lusso sul fiume molto più caro. Khao San è la zona più economica e Sukhumvit ha poche opzioni sotto le tre stelle.",
        "Il periodo migliore va da novembre a febbraio, e Rough Guides consiglia di prenotare in anticipo allora perché alcune pensioni accettano solo caparre in contanti. Le tariffe dei taxi per Pattaya, Ayutthaya e altre gite in giornata sono indicate in migliaia di baht, quindi un treno o un tour può costare meno.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto Suvarnabhumi al centro di Bangkok?", a: "Prendi l'Airport Rail Link dal livello interrato. Arriva a Phaya Thai in circa 26-30 minuti per 45 baht e si collega a BTS e MRT. Un taxi impiega da 45 a 60 minuti e aggiunge 50 baht di supplemento aeroportuale più i pedaggi." },
        { q: "Dove dormire a Bangkok la prima volta?", a: "Molte guide indicano Sukhumvit come base più semplice per la prima volta. La Città Vecchia è adatta ai templi, Silom è centrale e Khao San ha i letti più economici." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "tokyo",
    itSlug: "tokyo",
    name: "Tokyo",
    country: "Giappone",
    tagline: "Il foliage autunnale raggiunge il picco tra fine novembre e inizio dicembre",
    title: "Guida di viaggio a Tokyo: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Tokyo: templi, quartieri, foliage e ciliegi, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Tokyo è una città enorme fatta di tanti quartieri più piccoli, dai santuari tranquilli agli incroci al neon. I treni sono veloci e facili da usare, quindi si riesce a vedere molto anche in un soggiorno breve.",
    ],
    attractions: [
      { name: "Senso-ji, Asakusa", text: "Il tempio più antico di Tokyo, con una strada di negozi che porta all'ingresso. Vai presto o tardi per evitare la folla." },
      { name: "Shibuya Crossing", text: "Il famoso incrocio pedonale. Guardalo da un edificio vicino e poi attraversalo a piedi." },
      { name: "Santuario Meiji", text: "Un santuario tranquillo in un bosco accanto a Harajuku, ideale per iniziare la giornata con calma." },
      { name: "Shinjuku Gyoen", text: "Un grande giardino particolarmente amato per i colori dell'autunno e per la fioritura primaverile." },
      { name: "Mercato esterno di Tsukiji", text: "Bancarelle e piccoli ristoranti per colazione e spuntini." },
      { name: "Gite in giornata", text: "Kamakura e Nikko sono due gite in giornata molto popolari da Tokyo in treno." },
    ],
    bestTime: [
      "La primavera (da marzo a maggio, con i ciliegi in fiore tra fine marzo e inizio aprile) e l'autunno (da ottobre a novembre) sono le stagioni più popolari. Il foliage autunnale a Tokyo raggiunge di solito il picco da fine novembre a inizio dicembre, a seconda del giardino e dell'anno.",
      "L'estate è calda e umida, e l'inverno è freddo ma spesso asciutto e limpido, con prezzi più bassi fuori dalla settimana di Capodanno.",
    ],
    tips: [
      "Prendi una carta ricaricabile per treni e autobus.",
      "Prenota l'hotel presto per i ciliegi in fiore e per il foliage autunnale.",
      "Porta un po' di contanti: piccoli negozi e ristoranti possono non accettare carte.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Tokyo?", a: "La primavera (ciliegi in fiore) e l'autunno (colori, con il picco da fine novembre a inizio dicembre) sono le preferite." },
      { q: "Quanti giorni servono per visitare Tokyo?", a: "Da quattro a cinque giorni bastano per le zone principali. Aggiungi giorni per le gite in giornata." },
      { q: "Tokyo è cara?", a: "I voli di solito sono la spesa maggiore. Una volta lì, cibo e trasporti possono essere convenienti, mentre gli hotel nelle stagioni di punta costano di più." },
    ],
    details: {
      gettingAround: [
        "Haneda (HND) è l'aeroporto più vicino. Il Tokyo Monorail e la linea Keikyu arrivano nel centro di Tokyo in circa 13-20 minuti per meno di 550 yen. Narita (NRT) è a Chiba, a circa un'ora dal centro con il treno più veloce.",
        "Da Narita il Keisei Skyliner impiega circa 40 minuti fino a Ueno e costa circa 2.470 yen. Il JR Narita Express costa da circa 3.140 yen. I possessori di passaporto straniero possono comprare un'andata e ritorno sul Narita Express per 5.200 yen. Un taxi a tariffa fissa da Haneda al distretto di Chiyoda costa circa 7.600 yen da aprile 2026, e di più per Shibuya o Shinjuku.",
        "Carica una carta Suica o Pasmo, oppure la Welcome Suica riservata ai visitatori, e usala a ogni varco di treni, metropolitana e autobus. Scegli un alloggio a breve distanza a piedi da una stazione della linea JR Yamanote, perché quell'anello collega Shinjuku, Shibuya, la stazione di Tokyo e Ueno.",
      ],
      whereToStay: [
        { area: "Shinjuku", text: "La base più comune per chi viene la prima volta, con treni, cibo, negozi e locali notturni raggiungibili a piedi." },
        { area: "Shibuya", text: "Una zona più giovane e animata per shopping e vita notturna, vicina allo Shibuya Crossing." },
        { area: "Stazione di Tokyo e Marunouchi", text: "Una scelta pratica se il viaggio comprende lo Shinkansen." },
        { area: "Asakusa e Ueno", text: "Di solito le zone più economiche. Asakusa ha un'atmosfera più antica e tranquilla intorno al Senso-ji, e Ueno è comoda per Narita." },
        { area: "Ginza", text: "Una base più calma e più elegante per shopping e ristoranti." },
      ],
      costs: [
        "Le guide indicano cifre diverse. Una guida del 2026 mette gli ostelli ad Asakusa o Ueno da circa 3.500 yen a notte e gli hotel da circa 8.000 yen. Un'altra indica da 6.000 a 10.000 yen per le camere economiche e da 14.000 a 25.000 yen per quelle di fascia media ad Asakusa.",
        "I trasporti pubblici costano poco rispetto alla camera, e un biglietto di 24 ore della metropolitana di Tokyo combinato con lo Skyliner costa 2.890 yen dopo il cambio di tariffe di marzo 2026. I voli per Haneda possono costare un po' di più che per Narita, ma il trasferimento più breve ed economico in città spesso compensa.",
      ],
      extraFaq: [
        { q: "Meglio volare a Haneda o a Narita per Tokyo?", a: "Haneda è molto più vicina, con treni che arrivano nel centro di Tokyo in circa 13-20 minuti. Narita è a circa un'ora ma ha molti voli internazionali e low cost, quindi confronta il totale tra volo e trasferimento." },
        { q: "Dove dormire a Tokyo la prima volta?", a: "Molte guide consigliano Shinjuku come base più semplice, Shibuya per la vita notturna e Asakusa o Ueno per prezzi più bassi. Scegli un alloggio vicino a una stazione della linea Yamanote." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "maldives",
    itSlug: "maldive",
    name: "Maldive",
    at: "alle",
    country: "Maldive",
    tagline: "Inizia la stagione secca: lagune, barriere coralline e ville sull'acqua",
    title: "Guida di viaggio alle Maldive: isole, quando andare, voli e hotel",
    description: "Organizza un viaggio alle Maldive: isole, resort, snorkeling, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Le Maldive sono una catena di atolli corallini nell'oceano Indiano. La maggior parte dei visitatori atterra a Malé (MLE) e poi prosegue verso un'isola resort in motoscafo, idrovolante o con un breve volo interno.",
      "I trasferimenti fanno parte del costo, quindi confronta il prezzo totale di volo, hotel e trasferimento, non solo la camera.",
    ],
    attractions: [
      { name: "Barriere coralline e snorkeling", text: "Molte isole hanno una barriera proprio davanti alla spiaggia, quindi puoi fare snorkeling senza una gita in barca. Chiedi al resort informazioni sulla barriera prima di prenotare." },
      { name: "Isole resort", text: "Un resort per ogni isola è il soggiorno classico alle Maldive, con ville sull'acqua, una spiaggia privata e tutti i pasti sul posto." },
      { name: "Isole locali e guesthouse", text: "Un modo più economico di visitarle: piccole guesthouse su isole dove vive la gente, con spiaggia ed escursioni. Le regole su abbigliamento e alcol sono più rigide che sulle isole resort." },
      { name: "Immersioni e vita marina", text: "Le uscite di immersione e snorkeling vanno verso canali e barriere. I posti migliori dipendono dall'atollo e dalla stagione, quindi chiedi all'operatore." },
      { name: "Malé", text: "La capitale è piccola e trafficata, con un mercato del pesce e una vecchia moschea. La maggior parte dei visitatori ci passa soltanto, ma può riempire qualche ora tra un trasferimento e l'altro." },
    ],
    bestTime: [
      "La stagione secca va circa da dicembre ad aprile, con il tempo più soleggiato e calmo. Novembre è spesso l'inizio dell'alta stagione, e le settimane di Natale e Capodanno sono le più affollate.",
      "I mesi più piovosi vanno circa da maggio a ottobre. I prezzi sono più bassi, spesso al minimo circa tra aprile e agosto, e si possono comunque trovare giornate di sole.",
    ],
    tips: [
      "Aggiungi al budget i costi di trasferimento (barca o idrovolante) prima di confrontare i prezzi.",
      "Controlla i limiti di orario dei voli del resort: gli idrovolanti di solito volano solo di giorno.",
      "Prenota Natale e Capodanno con grande anticipo.",
      "Le guesthouse sulle isole locali sono un modo più economico di vedere le Maldive.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare le Maldive?", a: "Circa da dicembre ad aprile è la stagione secca, con il tempo migliore e i prezzi più alti." },
      { q: "Le Maldive costano meno nella stagione delle piogge?", a: "Di solito sì. I prezzi sono spesso al minimo circa tra aprile e agosto, ma gli acquazzoni sono più probabili." },
      { q: "A quale aeroporto devo volare?", a: "All'aeroporto internazionale Velana di Malé (MLE). Da lì prosegui in barca, idrovolante o con un volo interno fino alla tua isola." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto internazionale Velana (MLE) si trova su un'isola tutta sua, Hulhulé, accanto alla capitale Malé. Un traghetto pubblico per Malé parte ogni 10-15 minuti e costa circa 15 rufiyaa, più o meno 1 dollaro. Dall'aeroporto prosegui verso la tua isola in motoscafo, idrovolante, volo interno o traghetto pubblico.",
        "Gli idrovolanti volano solo di giorno, quindi un volo che atterra dopo le 16 circa di solito significa una notte vicino all'aeroporto o un resort raggiungibile in motoscafo. I resort con motoscafo vicini a Malé evitano il costo di un idrovolante, che le guide indicano in 500 dollari o più. Un motoscafo condiviso da Malé a Maafushi costa circa 25 dollari e impiega circa 45 minuti.",
        "I traghetti pubblici tra le isole locali costano pochi dollari, hanno orari limitati e non servono i resort privati. Una guida segnala che il venerdì non c'è servizio di traghetti.",
      ],
      whereToStay: [
        { area: "Isole resort", text: "Un'isola per ogni resort, con ville sull'acqua, barriere davanti alla spiaggia e pensione completa. Il tipo di trasferimento (motoscafo o idrovolante) cambia molto il costo totale." },
        { area: "Isole locali e guesthouse", text: "Isole come Maafushi hanno piccole guesthouse e caffè locali, e sono di gran lunga il modo più economico di soggiornare." },
        { area: "Hulhumalé", text: "Accanto all'aeroporto, comoda per una prima o ultima notte o per uno scalo breve." },
        { area: "Malé", text: "La capitale affollata, usata soprattutto per una visita in giornata e non per soggiornare." },
      ],
      costs: [
        "Le guide non sono d'accordo. Una indica le camere in guesthouse sulle isole locali più consolidate a circa 50-150 dollari a notte e una giornata da viaggiatore in guesthouse a 60-100 dollari. Un'altra elenca le guesthouse sulle isole a 80-140 dollari a notte in mezza pensione, i resort di fascia media a 500-1.000 dollari e quelli di fascia alta da 1.500 dollari.",
        "I prezzi indicati spesso escludono le tasse. Aggiungi un'imposta sui beni e servizi del 16-17 per cento, un costo di servizio del 10 per cento e una tassa verde a persona e a notte. La maggior parte delle guide la indica a 6 dollari, e una dice che è raddoppiata a 12 dollari dal 1° ottobre 2026, quindi controlla la tua prenotazione. Molte guide indicano anche una tassa di partenza che dipende dalla classe di cabina.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Malé alla mia isola alle Maldive?", a: "Dipende dall'isola. I resort vicini a Malé usano motoscafi, quelli più lontani idrovolanti o un volo interno, e le isole locali motoscafi pubblici o condivisi. Chiedi al tuo hotel quale usa prima di prenotare il volo." },
        { q: "Posso raggiungere un resort alle Maldive se il mio volo atterra la sera?", a: "Gli idrovolanti non volano dopo il tramonto, quindi chi arriva tardi spesso ha bisogno di una notte a Malé o a Hulhumalé, oppure di un resort raggiungibile in motoscafo." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "istanbul",
    itSlug: "istanbul",
    name: "Istanbul",
    country: "Turchia",
    tagline: "Moschee, bazar e il Bosforo su due continenti",
    title: "Guida di viaggio a Istanbul: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Istanbul: Santa Sofia, bazar, Bosforo, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Istanbul si estende tra Europa e Asia sul Bosforo. La città vecchia è piena di monumenti bizantini e ottomani, ed è anche una grande città moderna con una scena gastronomica forte.",
      "È un grande hub aereo, quindi spesso i voli sono facili da trovare da molti paesi.",
    ],
    attractions: [
      { name: "Santa Sofia e la Moschea Blu", text: "Due simboli della città vecchia, a pochi minuti l'uno dall'altra. Controlla orari di apertura e regole di abbigliamento prima di andare." },
      { name: "Palazzo di Topkapı", text: "L'ex palazzo ottomano ha cortili, l'Harem e viste sull'acqua. Calcola mezza giornata." },
      { name: "Gran Bazar", text: "Un mercato coperto con migliaia di negozi. Contrattare è normale." },
      { name: "Traghetto sul Bosforo", text: "I traghetti pubblici e le crociere turistiche mostrano le due sponde e sono un modo rilassato di vedere la città." },
      { name: "Moschea di Solimano", text: "Una grande moschea su una collina con vista sul Corno d'Oro, di solito più tranquilla delle moschee più famose." },
    ],
    bestTime: [
      "La primavera (aprile e maggio) e l'autunno (settembre e ottobre) sono in genere i periodi più piacevoli, con clima mite. L'estate è calda e affollata, e l'inverno è fresco e umido ma più tranquillo.",
    ],
    tips: [
      "Vestiti in modo sobrio per le moschee e porta un foulard se serve.",
      "Usa tram e traghetti per la città vecchia e per il Bosforo.",
      "Fai attenzione ai taxi: concorda la tariffa oppure usa il tassametro.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Istanbul?", a: "Aprile e maggio, e settembre e ottobre, hanno il clima più piacevole." },
      { q: "Quanti giorni servono per visitare Istanbul?", a: "Da tre a quattro giorni per la città vecchia, i bazar e una gita sul Bosforo." },
      { q: "A quale aeroporto devo volare?", a: "Istanbul ha due aeroporti principali, IST sul lato europeo e SAW sul lato asiatico. Confrontali entrambi quando cerchi i voli." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Istanbul (IST) è sul lato europeo, a circa 40-45 km a nord-ovest della città vecchia. Il percorso più economico è la metropolitana M11 fino a Gayrettepe, circa 30 minuti, poi la linea M2. Una guida del 2026 indica la M11 a circa 38 lire con una Istanbulkart e un'altra indica le corse in città a circa 35 lire, quindi aspettati più o meno questa cifra e controlla il prezzo attuale. La M11 non funziona tutta la notte.",
        "Gli autobus Havaist partono dal piano -2 su circa 11 linee, tra cui Taksim, Aksaray e Kadıköy, e non accettano più contanti. Una guida indica Taksim a circa 470 lire e un taxi a tariffa fissa a circa 2.100-3.000 lire. I prezzi in lire cambiano in fretta con l'inflazione, quindi considerali una base del 2026. Sabiha Gökçen (SAW), sul lato asiatico, è servita dalla metropolitana M4.",
        "Compra una Istanbulkart, che funziona su metropolitane, tram, autobus e traghetti. Il tram T1 passa per Sultanahmet ed Eminönü, e i traghetti attraversano verso Kadıköy e Üsküdar.",
      ],
      whereToStay: [
        { area: "Sultanahmet", text: "La città vecchia, con Santa Sofia e la Moschea Blu raggiungibili a piedi. Diverse guide la indicano per chi viene la prima volta." },
        { area: "Beyoğlu, Taksim e Galata", text: "Vita notturna, meze, bar sui tetti e la Torre di Galata, raggiungibili con il tram T1, la funicolare Tünel e i traghetti." },
        { area: "Karaköy", text: "Una zona elegante sul lungomare e un utile snodo dei trasporti, spesso indicata come base economica." },
        { area: "Beşiktaş", text: "Un quartiere vissuto sul Bosforo che Rough Guides consiglia alle famiglie." },
        { area: "Kadıköy", text: "Sul lato asiatico, con vita locale, prezzi più bassi e un viaggio in traghetto al posto del tram." },
      ],
      costs: [
        "Una guida del 2026 indica per viaggiare in fascia media circa 2.500-3.500 lire al giorno (circa 60-85 dollari) e con poco budget 2.000-2.800 lire, letto incluso. Un'altra indica camere economiche a circa 40-80 euro e buoni boutique hotel di fascia media a 90-150 euro.",
        "Un pass dei musei conviene solo se visiti rapidamente diversi luoghi a pagamento. Una guida segnala che l'Istanbul Museum Pass non copre Santa Sofia né l'Harem, quindi controlla cosa include prima di comprarlo. I prezzi salgono nei picchi di primavera e autunno.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Istanbul a Sultanahmet o Taksim?", a: "L'autobus Havaist è il più comodo con i bagagli, e la metropolitana M11 fino a Gayrettepe più la linea M2 è la più economica. Il taxi è il più veloce ma costa molto di più. Calcola da 45 a 90 minuti a seconda del traffico." },
        { q: "Serve una Istanbulkart?", a: "È il modo più semplice di pagare su metropolitane, tram, autobus e traghetti, e gli autobus Havaist non accettano più contanti. Puoi comprarne una ai distributori dell'aeroporto." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "athens",
    itSlug: "atene",
    name: "Atene",
    country: "Grecia",
    tagline: "Rovine antiche e weekend economici fuori stagione",
    title: "Guida di viaggio ad Atene: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio ad Atene: Acropoli, Plaka, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    at: "ad",
    intro: [
      "Atene racchiude siti antichi, quartieri vivaci e buon cibo in un centro compatto. È anche la porta d'ingresso per le isole greche.",
    ],
    attractions: [
      { name: "Acropoli e Partenone", text: "Il luogo principale. Vai la mattina presto, soprattutto in estate, e porta scarpe con una buona presa sulla pietra levigata." },
      { name: "Museo dell'Acropoli", text: "Un museo moderno ai piedi della collina con reperti del sito." },
      { name: "Plaka e Anafiotika", text: "Le vecchie strade sotto l'Acropoli, con piccoli negozi e caffè." },
      { name: "Agorà antica", text: "L'antico mercato, con il tempio di Efesto ben conservato." },
      { name: "Collina del Licabetto", text: "Un buon punto panoramico per il tramonto sulla città, raggiungibile a piedi o in funicolare." },
      { name: "Capo Sunio", text: "Una gita in giornata a un tempio di Poseidone sulla scogliera, meglio intorno al tramonto." },
    ],
    bestTime: [
      "La primavera (da aprile a giugno) e l'inizio dell'autunno (settembre e ottobre) hanno il miglior equilibrio tra clima e folla. L'estate è molto calda e affollata.",
      "Da novembre a marzo è il periodo più economico per voli e hotel, con clima più fresco e qualche pioggia.",
    ],
    tips: [
      "Visita i siti antichi presto per evitare il caldo e la folla.",
      "Prenota online i biglietti dell'Acropoli nei mesi affollati.",
      "Usa la metropolitana dall'aeroporto al centro.",
      "Valuta di aggiungere un'isola in traghetto o con un breve volo.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Atene?", a: "Da aprile a giugno e da settembre a ottobre il clima è piacevole e la folla è gestibile." },
      { q: "Quando costa meno andare ad Atene?", a: "Circa da novembre a marzo, anche se fa più fresco e può piovere." },
      { q: "Quanti giorni servono per visitare Atene?", a: "Da due a tre giorni per la città, di più se aggiungi un'isola." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Atene (ATH) è a circa 33 km a est del centro. La metropolitana impiega circa 40 minuti fino a Syntagma e costa 9 euro, e il biglietto dell'aeroporto è separato da quello normale della metropolitana cittadina. L'autobus espresso X95 per Syntagma costa 5,50 euro, funziona giorno e notte e impiega circa un'ora. Sull'autobus puoi usare una carta contactless.",
        "I taxi ufficiali dell'aeroporto hanno una tariffa fissa di 40 euro verso il centro di Atene dalle 05:00 a mezzanotte e circa 55 euro da mezzanotte alle 05:00, con pedaggi e bagaglio standard inclusi. I viaggi fuori dal centro si pagano a tassametro. Una fonte indica un biglietto turistico di 3 giorni a 20 euro che include una corsa di andata e ritorno dall'aeroporto.",
      ],
      whereToStay: [
        { area: "Plaka", text: "Strade piene di atmosfera ai piedi dell'Acropoli. È anche una delle zone più care." },
        { area: "Koukaki", text: "Una zona residenziale e verde a circa cinque minuti dal Museo dell'Acropoli, con buoni caffè e il miglior rapporto qualità prezzo vicino ai luoghi da vedere." },
        { area: "Monastiraki e Psyrri", text: "Mercati, bar e cibo, con facili collegamenti in metropolitana." },
        { area: "Syntagma", text: "Centrale, vicina alla metropolitana e all'autobus dell'aeroporto." },
        { area: "Exarchia", text: "Più locale e alternativa, con prezzi più bassi. Controlla il percorso di ritorno dopo il tramonto." },
      ],
      costs: [
        "Le guide non sono d'accordo. Una guida low cost del 2026 indica un range giornaliero da circa 52 euro per chi viaggia da solo con poco budget a 420 euro per il lusso, mentre un'altra suggerisce circa 150-200 euro al giorno per la fascia media. Una guida cita un biglietto cumulativo per sette siti archeologici a circa 30 euro.",
        "La Grecia aggiunge una tassa Climate Resilience Fee a camera e a notte, da circa 0,50 a 15 euro a seconda della stagione e del tipo di alloggio. Luglio e agosto portano la folla maggiore, i prezzi più alti e temperature sopra i 35 gradi.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Atene al centro?", a: "La metropolitana impiega circa 40 minuti fino a Syntagma e costa 9 euro. L'autobus X95 costa 5,50 euro e funziona tutta la notte. Un taxi ha una tariffa fissa di 40 euro di giorno e circa 55 euro di notte." },
        { q: "Dove dormire ad Atene la prima volta?", a: "Plaka per l'atmosfera o Koukaki per una base più calma vicino all'Acropoli. Monastiraki e Psyrri sono adatte a cibo e vita notturna, e Syntagma è centrale per i trasporti." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "marrakech",
    itSlug: "marrakech",
    name: "Marrakech",
    country: "Marocco",
    tagline: "Souk, palazzi e giardini, meglio in primavera e in autunno",
    title: "Guida di viaggio a Marrakech: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Marrakech: medina, souk, giardini, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Marrakech è una medina fortificata piena di vicoli stretti, mercati, palazzi e riad, con le montagne dell'Alto Atlante vicine. È trafficata, rumorosa e colorata, e premia chi cammina lentamente.",
      "La scelta principale è il periodo. L'estate è molto calda e le notti d'inverno sono fresche, quindi la maggior parte dei visitatori punta su primavera o autunno.",
    ],
    attractions: [
      { name: "Jemaa el-Fnaa", text: "La piazza principale della medina è più animata di notte, quando lanterne, musica e bancarelle di cibo la riempiono. Una guida suggerisce di visitarla tra le 17 e le 22 circa." },
      { name: "I souk", text: "I mercati coperti partono dalla piazza e vendono pelle, lampade, spezie e ceramiche. Contrattare è normale, quindi porta degli spiccioli." },
      { name: "Jardin Majorelle", text: "Un giardino creato dal pittore Jacques Majorelle negli anni Venti e Trenta del Novecento, poi appartenuto a Yves Saint Laurent. L'ingresso richiede biglietti con orario, quindi prenota in anticipo." },
      { name: "Palazzo Bahia", text: "Un palazzo dell'Ottocento noto per le piastrelle e i soffitti in cedro intagliato. È una buona sosta nelle ore centrali della giornata." },
      { name: "Tombe Saadiane", text: "Un luogo di sepoltura reale rimasto chiuso per secoli e riscoperto nel 1917. La Sala delle Dodici Colonne è la stanza più nota." },
    ],
    bestTime: [
      "La maggior parte delle guide indica il clima più piacevole da marzo a maggio e da settembre a ottobre. In primavera le giornate sono calde e i giardini verdi, e l'autunno è soleggiato e un po' più caldo.",
      "La primavera e le settimane intorno a Natale e Capodanno sono le più affollate e care. L'estate è il periodo più economico per riad e hotel, ma è molto calda, con temperature che a giugno possono arrivare a circa 45 gradi. Da novembre a febbraio è più piovoso e tranquillo, e gennaio è il mese più freddo. Durante il Ramadan di giorno la città è più calma, mangiare in pubblico è sconsigliato e gli orari dei negozi cambiano.",
    ],
    tips: [
      "Prenota in anticipo il biglietto del giardino Majorelle, perché l'ingresso ha un orario.",
      "Porta spiccioli per i souk e concorda i prezzi prima di comprare.",
      "Vestiti in modo sobrio nella medina, e ancora di più durante il Ramadan.",
      "In estate programma le visite al mattino presto e alla sera.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Marrakech?", a: "Circa da marzo a maggio e da settembre a ottobre, quando fa caldo ma non troppo. L'estate è molto calda e l'inverno è più fresco e piovoso." },
      { q: "Marrakech costa meno in estate?", a: "Di solito hotel e riad abbassano i prezzi da giugno ad agosto. Il caldo però è intenso, quindi programma soprattutto attività all'aperto al mattino presto e alla sera." },
      { q: "Quanti giorni servono per visitare Marrakech?", a: "Tre giorni bastano per la medina, i luoghi principali e un giardino. Aggiungi un giorno o due per una gita sull'Atlante o nel deserto di Agafay." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Menara (RAK) è a circa 6 km dalla medina. L'autobus 19 passa ogni 30 minuti circa verso Jemaa el-Fna e Gueliz e costa 30 dirham di sola andata e circa 50 andata e ritorno. Le ultime partenze sono di solito tra le 21:00 e le 23:30 circa, quindi controlla gli orari esposti.",
        "I taxi hanno tabelle di tariffe fisse all'aeroporto, e le guide indicano circa 70-150 dirham per la medina o Gueliz di giorno, a seconda della fonte, con tariffe più alte di notte. Conferma il prezzo prima di salire. Le auto non possono entrare nella medina fortificata, quindi il riad si raggiunge a piedi o con un facchino dalla porta più vicina.",
      ],
      whereToStay: [
        { area: "La medina", text: "Un riad dentro le mura offre atmosfera e comode passeggiate verso Jemaa el-Fna e i souk. Prenota in anticipo un ritiro per trovare la tua porta." },
        { area: "Gueliz", text: "Il quartiere moderno con strade larghe, bar e caffè, la stazione ferroviaria vicina e un accesso più facile ai taxi." },
        { area: "Hivernage", text: "Una zona più tranquilla e di livello più alto accanto a Gueliz, con hotel che i taxi raggiungono direttamente." },
        { area: "Kasbah", text: "La parte meridionale della città vecchia, più calma della zona intorno a Jemaa el-Fnaa." },
      ],
      costs: [
        "Una guida del 2026 indica un viaggio con poco budget a circa 330-930 dirham al giorno (circa 35 dollari) e la fascia media a circa 930-3.270 dirham. Riad economici e ostelli sono indicati a circa 15-35 dollari a notte.",
        "Una tassa di soggiorno cittadina di 15-30 dirham a persona e a notte, a seconda dell'alloggio, si paga in contanti alla fine del soggiorno, quindi tieni qualche dirham per il check-out. Prenota in anticipo il biglietto con orario del Jardin Majorelle perché la coda sul posto è lunga.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Marrakech alla medina?", a: "L'autobus 19 costa 30 dirham e impiega circa 30 minuti, e un taxi costa di solito circa 70-150 dirham. Poi si va a piedi fino al riad, perché le auto non arrivano alla maggior parte delle porte della medina." },
        { q: "C'è una tassa di soggiorno a Marrakech?", a: "Sì, una tassa cittadina di circa 15-30 dirham a persona e a notte, a seconda dell'alloggio, di solito pagata in contanti al check-out." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "cape-town",
    itSlug: "citta-del-capo",
    name: "Città del Capo",
    country: "Sudafrica",
    tagline: "Montagna, costa e terra del vino, più soleggiata da novembre a marzo",
    title: "Guida di viaggio a Città del Capo: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Città del Capo: Table Mountain, Cape Point, vigneti, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Città del Capo sta tra la Table Mountain e il mare, con spiagge, riserve naturali e terra del vino a una gita in giornata di distanza. Va bene per una lunga vacanza in città e per un viaggio più lungo in auto.",
      "Ricorda che le stagioni sono invertite. L'estate va circa da dicembre a marzo, e l'inverno circa da giugno ad agosto.",
    ],
    attractions: [
      { name: "Table Mountain", text: "Sali con la funivia, che ruota mentre sale, oppure percorri uno dei ripidi sentieri. In cima vivono i procavie." },
      { name: "Robben Island", text: "Una gita in barca attraverso la Table Bay porta all'isola dove fu imprigionato Nelson Mandela. Alcuni tour sono guidati da ex detenuti." },
      { name: "Cape Point", text: "Parte della riserva naturale del Capo di Buona Speranza, con costa selvaggia, piante di fynbos, antilopi, struzzi e babbuini. Funziona bene come giornata intera in auto." },
      { name: "Le terre del vino", text: "Stellenbosch, Franschhoek e Paarl distano circa da una a due ore di strada. Programma una giornata di degustazioni con un autista o un tour." },
      { name: "Avvistamento delle balene", text: "Le balene si vedono circa da giugno a novembre. Il Whale Festival di Hermanus si tiene a settembre." },
    ],
    bestTime: [
      "Città del Capo è una meta da visitare tutto l'anno, con un clima mediterraneo. L'estate, circa da novembre o dicembre a marzo, è asciutta e calda, e marzo è spesso descritto come soleggiato e piacevole. Tra fine agosto e settembre arrivano i fiori selvatici.",
      "L'estate e le vacanze di Natale sono il periodo più affollato e caro. Il forte vento di sud-est può rendere febbraio e la tarda primavera meno prevedibili, soprattutto sulla Table Mountain. L'inverno, da giugno ad agosto, è mite ma piovoso, con eventi più tranquilli e di solito prezzi più bassi.",
    ],
    tips: [
      "Controlla il meteo il giorno prima di salire sulla Table Mountain.",
      "Usa taxi autorizzati o app di trasporto, ed evita le strade poco illuminate e deserte.",
      "Tieni gli oggetti di valore fuori vista e non portare molti contanti.",
      "Prenota in anticipo Robben Island e i tour del vino in estate.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Città del Capo?", a: "Circa da novembre a marzo per un clima asciutto e caldo. Le stagioni sono invertite rispetto all'Europa e al Nord America, quindi questa è l'estate locale." },
      { q: "Città del Capo è sicura per i turisti?", a: "Il consiglio per i visitatori è usare trasporti autorizzati, stare nelle zone ben illuminate e tenere con sé gli oggetti di valore. Chiedi al personale dell'hotel informazioni sulla zona in cui ti trovi." },
      { q: "Quanti giorni servono per visitare Città del Capo?", a: "Da quattro a cinque giorni bastano per la città, Cape Point e una giornata nelle terre del vino. Aggiungine altri se vuoi escursioni o avvistamento delle balene." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto internazionale di Città del Capo (CPT) è a circa 20 km dalla City Bowl e dal V&A Waterfront. Uber e Bolt sono molto usati e le guide indicano circa 180-350 rand per il centro, con i taxi con tassametro dell'aeroporto più cari. Le fonti non concordano sul MyCiTi: alcune descrivono un autobus dall'aeroporto al Civic Centre in circa 30 minuti per circa 80-120 rand, mentre un rapporto di metà 2026 dice che al momento non c'è un servizio diretto dall'aeroporto. Controlla prima di contarci.",
        "In città gli autobus MyCiTi collegano il centro, il Waterfront, Sea Point e Camps Bay, ma non le terre del vino. Un pass giornaliero è indicato a 60-90 rand. Un Uber dal centro a Camps Bay costa circa 60-120 rand, e noleggiare un'auto è il modo più semplice per vedere la penisola del Capo.",
      ],
      whereToStay: [
        { area: "V&A Waterfront", text: "Da girare a piedi, con ristoranti e negozi, e una base comune per chi viene la prima volta." },
        { area: "City Bowl e Gardens", text: "Centrali, vicine alla funivia della Table Mountain e a molti ristoranti." },
        { area: "Sea Point e Green Point", text: "Una passeggiata sul lungomare, con il Waterfront raggiungibile a piedi." },
        { area: "Camps Bay", text: "Una striscia sul mare sotto le montagne. Ventosa a gennaio e febbraio." },
        { area: "Woodstock", text: "Street art, caffè e mercati, con un'atmosfera più locale." },
      ],
      costs: [
        "Una guida indica i letti in dormitorio in ostello a circa 200-450 rand a notte e le giornate da backpacker a 50-80 dollari. Una villa sul mare a Camps Bay può arrivare a 8.000 rand a notte o più, quindi la differenza di prezzo è grande.",
        "Le degustazioni di vino sono indicate a circa 50-150 rand, e Uber costa poco rispetto all'Europa. Il noleggio auto costa circa 750 rand al giorno prima di carburante e assicurazione. Città del Capo ha un alto tasso di criminalità, quindi di notte usa le app di trasporto.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Città del Capo al centro?", a: "Uber o Bolt costa circa 180-350 rand e impiega da 25 a 45 minuti circa. Controlla se l'autobus MyCiTi dell'aeroporto è attivo, perché le notizie sono discordanti." },
        { q: "Dove dormire a Città del Capo?", a: "Il V&A Waterfront o Sea Point per un primo soggiorno facile, la City Bowl per l'accesso centrale, e Camps Bay per la spiaggia." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "cairo",
    itSlug: "il-cairo",
    name: "Cairo",
    at: "al",
    country: "Egitto",
    tagline: "Piramidi, un nuovo museo e antichi bazar, mite da ottobre ad aprile",
    title: "Guida di viaggio al Cairo: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio al Cairo: Piramidi di Giza, Grande Museo Egizio, bazar, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Il Cairo è una città enorme e trafficata sul Nilo, con migliaia di anni di storia. Le Piramidi di Giza sono ai suoi margini, e antiche moschee, chiese e mercati riempiono il centro.",
      "La maggior parte dei visitatori ha bisogno di un visto per l'Egitto, quindi controlla presto le regole per il tuo passaporto. Molti viaggiatori possono usare un e-visa o comprarlo all'arrivo, ma le regole cambiano.",
    ],
    attractions: [
      { name: "Le Piramidi di Giza", text: "I visitatori arrivano alle Piramidi da più di duemila anni. Vai la mattina presto e porta acqua e protezione dal sole." },
      { name: "Grande Museo Egizio", text: "Aperto a novembre 2025 vicino al sito di Giza. Mostra l'intera collezione di Tutankhamon e la barca di Cheope. I biglietti si prenotano online in anticipo per una fascia oraria, e la visita richiede diverse ore." },
      { name: "Cairo islamico", text: "Un quartiere medievale di moschee, palazzi e scuole lungo la Sharia al-Muizz. Si vede meglio di giorno, ed è illuminato al tramonto." },
      { name: "Khan el-Khalili", text: "Il bazar più famoso del Cairo, attivo da circa 600 anni con lampade, gioielli, tessuti e souvenir. I prezzi sono trattabili." },
      { name: "Cairo copto", text: "Un piccolo quartiere con la Chiesa Sospesa, una sinagoga molto antica e la chiesa dei Santi Sergio e Bacco. Il Museo Copto aggiunge contesto." },
    ],
    bestTime: [
      "Le guide concordano che primavera e autunno sono le stagioni piacevoli, e anche l'inverno è confortevole. Aprile e maggio sono descritti come caldi ma piacevoli, e da ottobre in poi il clima è mite.",
      "Da ottobre a dicembre, e soprattutto nelle settimane di Natale e Capodanno, c'è il periodo più affollato e caro, quindi prenota con almeno un paio di mesi di anticipo. Aprile e maggio sono spesso più economici. L'estate è molto calda, con temperature che possono superare i 40 gradi, quindi visita Giza presto o scegli luoghi al chiuso. Il Ramadan si sposta di circa 11 giorni prima ogni anno, e in quel periodo gli orari di apertura cambiano.",
    ],
    tips: [
      "Prenota i biglietti del Grande Museo Egizio sul sito ufficiale e salva la conferma offline.",
      "Controlla le regole sul visto per il tuo passaporto prima di comprare i voli.",
      "Visita le Piramidi presto, quando fa più fresco ed è più tranquillo.",
      "Non mangiare né bere per strada di giorno durante il Ramadan.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare il Cairo?", a: "Circa da ottobre ad aprile, quando il clima è mite. Da ottobre a dicembre è la parte più affollata di questo periodo, quindi la primavera può costare meno." },
      { q: "Serve il visto per l'Egitto?", a: "Alla maggior parte dei viaggiatori serve. Si può richiedere un e-visa online, e a molte nazionalità è offerto anche il visto all'arrivo. Controlla le regole ufficiali per il tuo passaporto." },
      { q: "Quanti giorni servono per visitare il Cairo?", a: "Tre giorni bastano per Giza, il Grande Museo Egizio e il Cairo islamico. Aggiungi un giorno per il Cairo copto e più tempo ai bazar." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto internazionale del Cairo (CAI) è a circa 22 km a nord-est del Downtown. Uber e Careem sono molto consigliati per il tragitto e costano circa 3-4 sterline, con 45-90 minuti a seconda del traffico. I taxi ufficiali dell'aeroporto sono indicati a circa 200-350 sterline egiziane, e le offerte non ufficiali costano di più.",
        "In città la metropolitana costa pochissimo, con tariffe di sole poche sterline egiziane, e la Linea 2 arriva a Giza. Uber è la scelta pratica per le piramidi e il Grande Museo Egizio, che sono uno accanto all'altro. Diverse guide consigliano una guida autorizzata per la giornata a Giza.",
      ],
      whereToStay: [
        { area: "Downtown", text: "Strade belle époque un po' sbiadite, la maggior parte degli ostelli, il Museo Egizio e due linee della metropolitana. Rumoroso ma molto centrale." },
        { area: "Zamalek", text: "Un'isola nel Nilo con verde, gallerie e caffè, e un posto più calmo di notte." },
        { area: "Giza", text: "Vicina alle piramidi, comoda per una partenza presto, ma lontana dal Downtown." },
        { area: "Mohandiseen e Dokki", text: "Quartieri locali e più economici con accesso a Uber e metropolitana." },
      ],
      costs: [
        "Lonely Planet indica giornate con poco budget a circa 930-1.545 sterline egiziane (30-50 dollari) e giornate di fascia media a 1.545-4.640 sterline. L'ingresso a musei o siti va da circa 95 a 465 sterline.",
        "Lonely Planet dice che gli studenti sotto i 30 anni con un documento di studente valido hanno il 50 per cento di sconto nei siti statali. Il Grande Museo Egizio vende biglietti con orario online, e una guida del 2026 dice che dal novembre 2025 non ci sono vendite sul posto, quindi prenota prima di partire.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto del Cairo al centro?", a: "Uber o Careem è il modo più semplice, a circa 3-4 sterline e 45-90 minuti. I taxi ufficiali dell'aeroporto costano circa 200-350 sterline egiziane." },
        { q: "Devo prenotare in anticipo i biglietti del Grande Museo Egizio?", a: "Sì. Una guida del 2026 dice che il museo usa biglietti online con orario e che dal novembre 2025 non ci sono vendite sul posto, quindi prenota prima di partire." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "zanzibar",
    itSlug: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    tagline: "Spiagge e la vecchia Stone Town, più asciutta da giugno a ottobre",
    title: "Guida di viaggio a Zanzibar: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Zanzibar: spiagge, Stone Town, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Zanzibar è un'isola al largo della costa della Tanzania, nota per le spiagge di sabbia bianca, il mare caldo e la vecchia Stone Town. È facile unire un soggiorno al mare con qualche gita culturale in giornata.",
      "Qui il periodo conta. I mesi piovosi possono portare forti acquazzoni, e alcuni hotel più piccoli chiudono nelle settimane più umide.",
    ],
    attractions: [
      { name: "Stone Town", text: "Una città vecchia patrimonio UNESCO di vicoli stretti. Il museo dell'antico mercato degli schiavi è una buona prima tappa per capire la storia dell'isola." },
      { name: "Isola di Changuu (Prison Island)", text: "Una breve gita in barca da Stone Town. Ha un edificio carcerario del 1893 e tartarughe giganti, e funziona come uscita di mezza giornata." },
      { name: "Foresta di Jozani", text: "Il Parco Nazionale di Jozani Chwaka Bay ospita i colobi rossi, che si trovano solo a Zanzibar. È una gita facile in giornata da Stone Town." },
      { name: "Piantagioni di spezie", text: "Zanzibar è ancora un grande produttore di spezie, e molte piantagioni offrono visite guidate in cui puoi annusare e assaggiare spezie fresche." },
      { name: "Le spiagge", text: "Il nord è più affollato e sviluppato, mentre l'est è più tranquillo. Scegli in base a quanta animazione vuoi intorno a te." },
    ],
    bestTime: [
      "Le fonti differiscono di qualche settimana, ma circa da giugno a ottobre è la stagione secca e soleggiata, e anche gennaio e febbraio sono popolari e caldi. Le temperature sono intorno ai 30 gradi nei mesi asciutti.",
      "Da giugno a ottobre è anche il periodo più affollato e agosto è molto amato dalle famiglie, quindi prenota presto. Le piogge lunghe vanno circa da marzo a maggio, con aprile il più piovoso, e portano prezzi più bassi e spiagge più tranquille. Piogge brevi e più leggere arrivano di solito a novembre e dicembre.",
    ],
    tips: [
      "Prenota presto gli hotel in spiaggia per luglio, agosto e le settimane di Natale.",
      "Ad aprile e maggio controlla che il tuo hotel sia aperto prima di prenotare.",
      "A Stone Town, lontano dalla spiaggia, vestiti in modo sobrio.",
      "Calcola più tempo per andare dall'aeroporto alla costa orientale.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Zanzibar?", a: "Circa da giugno a ottobre per il tempo più asciutto, e anche gennaio e febbraio sono buoni. La pioggia più forte è intorno ad aprile." },
      { q: "Quando costa meno Zanzibar?", a: "Durante le piogge lunghe, circa da marzo a maggio. Aspettati più acquazzoni, e alcuni hotel più piccoli chiudono." },
      { q: "Quanti giorni servono per visitare Zanzibar?", a: "Da quattro a sette giorni vanno bene per un soggiorno al mare con uno o due giorni a Stone Town e una o due gite in giornata." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Zanzibar (ZNZ) è a circa 5 km da Stone Town, e un taxi costa di solito circa 10-25 dollari e impiega 15-20 minuti. I trasferimenti per Nungwi, Paje o altre zone di spiaggia costano circa 35-70 dollari e impiegano da 30 a 90 minuti. Uber e Grab al momento non operano sull'isola.",
        "I minibus locali chiamati dala-dala sono il modo più economico di attraversare l'isola, con tariffe di circa 500-3.000 scellini. Da Stone Town a Nungwi ci vogliono circa 90 minuti. Per spostarsi tra le spiagge molti visitatori noleggiano un taxi per tutta la giornata.",
      ],
      whereToStay: [
        { area: "Stone Town", text: "La città vecchia patrimonio UNESCO con vicoli, ristoranti sui tetti e case di mercanti restaurate. La maggior parte dei visitatori trascorre qui due o tre notti." },
        { area: "Nungwi e Kendwa", text: "La punta nord, con le spiagge più popolari e un'atmosfera vivace." },
        { area: "Paje e Jambiani", text: "Spiagge della costa orientale note per il kitesurf e per un'atmosfera da boutique." },
        { area: "Matemwe", text: "Una base più tranquilla a nord-est per le immersioni e le gite all'isola di Mnemba." },
        { area: "Michamvi e Bwejuu", text: "Villaggi assonnati della costa orientale con lunghe spiagge tranquille." },
      ],
      costs: [
        "Le guide variano. Una indica il budget giornaliero a circa 99 dollari per chi viaggia da solo con poco budget e 215 dollari in fascia media, mentre un'altra stima per sette notti solo a terra 700-1.200 dollari con poco budget e 1.400-2.600 dollari in fascia media per due persone che dividono la camera. I letti in ostello a Stone Town costano circa 12-14 dollari e gli hotel di fascia media circa 70-93 dollari.",
        "Il visto turistico si vende all'arrivo, e le guide indicano 50 dollari per alcune nazionalità e 69 dollari per altre, quindi controlla il tuo. I menu dei resort sulla spiaggia hanno prezzi per turisti e costano molto più che a Stone Town. L'alta stagione va da dicembre a febbraio.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Zanzibar a Stone Town o Nungwi?", a: "In taxi o con un trasferimento prenotato. Stone Town dista circa 15 minuti e costa 10-25 dollari. Nungwi richiede da 60 a 90 minuti e costa circa 40-60 dollari." },
        { q: "Serve il visto per Zanzibar?", a: "La maggior parte dei visitatori ha bisogno di un visto turistico, che si può comprare all'arrivo o online. Le guide indicano da 50 a 69 dollari a seconda della nazionalità." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "nairobi",
    itSlug: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    tagline: "Fauna ai margini della città e migrazione nel Masai Mara, circa da luglio a ottobre",
    title: "Guida di viaggio a Nairobi e safari: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Nairobi e un safari in Kenya: parco nazionale, Masai Mara, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Nairobi è la porta d'ingresso principale per i safari in Kenya. Ha anche una fauna tutta sua, con un parco nazionale ai margini della città e diversi centri per gli animali nei sobborghi di Karen e Lang'ata.",
      "La maggior parte dei visitatori unisce qualche giorno a Nairobi a un viaggio nel Masai Mara. I prezzi dei safari cambiano molto con la stagione, quindi decidi prima le date.",
    ],
    attractions: [
      { name: "Parco Nazionale di Nairobi", text: "Un parco nazionale a circa 8-10 km dal centro, con leoni, rinoceronti e giraffe davanti allo skyline. È il parco nazionale più antico del Kenya e ha più di 400 specie di uccelli." },
      { name: "Giraffe Centre", text: "Un centro di riproduzione della giraffa di Rothschild, a rischio di estinzione, dove puoi dare da mangiare agli animali con la mano. Apre presto e il parcheggio spesso si riempie a tarda mattina." },
      { name: "Orfanotrofio degli elefanti David Sheldrick", text: "Si possono vedere da vicino i piccoli elefanti orfani. Controlla orari di apertura e regole di prenotazione prima di andare." },
      { name: "Museo Karen Blixen", text: "Un museo nel verde sobborgo di Karen, dove si trovano molti luoghi di interesse di Nairobi per i visitatori. Si abbina bene al Giraffe Centre in una mezza giornata." },
      { name: "Masai Mara", text: "La riserva più nota del Kenya per i grandi felini e la migrazione degli gnu. Di solito si visita con un viaggio di più giorni da Nairobi, in auto o con un piccolo aereo." },
    ],
    bestTime: [
      "Il Kenya è adatto alla fauna nei mesi asciutti. I tempi della migrazione nel Masai Mara non sono fissi, ma le mandrie ci sono circa da luglio a ottobre, e in quel periodo sono più probabili gli attraversamenti dei fiumi. Gli attraversamenti non sono mai garantiti, e le fonti differiscono sull'inizio esatto: alcune dicono giugno, altre metà luglio. Gennaio e febbraio sono caldi e asciutti, e gli animali si radunano nei punti più frequentati.",
      "Luglio e agosto sono i mesi più affollati e cari, soprattutto durante le vacanze scolastiche. Da settembre a inizio dicembre è più tranquillo e conveniente. Le piogge lunghe, circa da marzo a maggio, significano prezzi più bassi ma strade fangose, avvistamenti peggiori e alcuni lodge chiusi. Novembre e dicembre portano piogge più brevi.",
    ],
    tips: [
      "La maggior parte dei visitatori ha bisogno di un eTA del Kenya approvato prima di partire, quindi fai domanda sul sito ufficiale del governo.",
      "Prenota presto i lodge del Masai Mara per luglio-ottobre.",
      "Non girare a piedi a Nairobi di notte, soprattutto nelle zone senza luce.",
      "Non organizzare il viaggio attorno a un attraversamento del fiume. Consideralo un bonus.",
    ],
    faq: [
      { q: "Quando c'è la migrazione degli gnu nel Masai Mara?", a: "Circa da luglio a ottobre, con attraversamenti dei fiumi in quel periodo. I tempi cambiano con le piogge, e le fonti differiscono su inizio e fine esatti." },
      { q: "Quando costa meno un safari in Kenya?", a: "Le piogge lunghe, circa da marzo a maggio, sono le più economiche ma vedere gli animali è più difficile. Da settembre a inizio dicembre è un buon periodo per il rapporto qualità prezzo." },
      { q: "Serve il visto per il Kenya?", a: "La maggior parte dei visitatori ha bisogno di un eTA approvato prima di partire, richiesto online. Controlla il sito ufficiale dell'eTA per il tuo passaporto." },
      { q: "Quanti giorni servono?", a: "Due giorni per Nairobi e da tre a quattro per il Masai Mara sono un minimo ragionevole." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto internazionale Jomo Kenyatta (NBO) è a circa 15-18 km dal centro. Uber e Bolt sono l'opzione più semplice, a circa 700-1.500 scellini per Westlands o il centro e 1.000-1.500 per Karen. I taxi ufficiali dell'aeroporto costano di più, circa 1.500-3.000 scellini, e la linea di autobus 34 costa circa 100 scellini ma è lenta e affollata. Il traffico sulla Mombasa Road è intenso nelle ore di punta.",
        "Il treno SGR per Mombasa parte da Nairobi Terminus, a circa 30 km dall'aeroporto, che è una stazione diversa dalla Nairobi Central Railway Station. Gli operatori di safari possono usare l'aeroporto Wilson invece del JKIA, quindi chiedi quale aeroporto usa il tuo volo.",
      ],
      whereToStay: [
        { area: "Westlands", text: "Ristoranti, vita notturna e negozi, e una base semplice e adatta a tutto per un primo soggiorno." },
        { area: "Kilimani e Kileleshwa", text: "Caffè e ostelli nei sobborghi occidentali, a breve distanza in Uber da tutto." },
        { area: "Karen e Langata", text: "Sobborghi verdi vicini al Parco Nazionale di Nairobi, al Giraffe Centre e al Museo Karen Blixen, ma lontani dalla vita notturna." },
        { area: "Gigiri", text: "La zona diplomatica e delle Nazioni Unite, tranquilla e sicura." },
      ],
      costs: [
        "Hostelworld osserva che le tariffe dei parchi per i safari sono di solito la spesa singola maggiore. Un rapporto indica la tariffa per un adulto non residente al Parco Nazionale di Nairobi a circa 80 dollari al giorno secondo il tariffario rivisto da ottobre 2025. Il Masai Mara è gestito dalla contea di Narok, che fissa i propri prezzi, quindi controllali a parte.",
        "La maggior parte dei visitatori ha bisogno di un eTA, circa 30 dollari americani, richiesto online prima del viaggio. Usa Uber o Bolt invece dei taxi di strada, con un trasferimento dall'aeroporto prenotato in anticipo che costa circa 25-60 dollari.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Nairobi al centro?", a: "Uber o Bolt è il modo più semplice e costa circa 700-1.500 scellini, con 25-50 minuti di viaggio. Evita le ore di punta sulla Mombasa Road." },
        { q: "Serve un eTA per viaggiare in Kenya?", a: "La maggior parte dei visitatori fa domanda online per un eTA prima di volare. Una guida del 2026 indica la tariffa a circa 30 dollari americani, quindi controlla il sito ufficiale per la tua nazionalità." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "cancun",
    itSlug: "cancun",
    name: "Cancún",
    country: "Messico",
    tagline: "Spiagge dei Caraibi e rovine maya, meglio da dicembre ad aprile",
    title: "Guida di viaggio a Cancún: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Cancún: spiagge, Isla Mujeres, Chichén Itzá, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Cancún è una città balneare sulla costa caraibica del Messico. Ha una lunga fila di hotel, acqua turchese e calma e un aeroporto comodo, ed è una buona base per gite in giornata verso isole e antichi siti maya.",
      "La città ha due volti. La zona degli hotel è costruita intorno alla spiaggia, mentre il centro è dove la gente del posto vive, mangia e fa acquisti, ed è di solito più economico.",
    ],
    attractions: [
      { name: "Le spiagge della zona hotel", text: "Una lunga striscia di sabbia con resort, ristoranti e beach club. La maggior parte delle spiagge in Messico è pubblica, quindi puoi camminarci anche se non soggiorni lì." },
      { name: "Isla Mujeres", text: "Una piccola isola a breve distanza in barca da Cancún. È un posto rilassato per un bagno, un giro in golf cart e un pranzo sull'acqua." },
      { name: "Chichén Itzá", text: "Il famoso sito della piramide maya è una lunga gita in giornata verso l'interno. Parti presto e valuta un tour guidato per evitare le complicazioni dei trasporti." },
      { name: "Tulum e la costa della Riviera Maya", text: "A sud di Cancún la costa ha altre rovine maya, spiagge e cenote (pozze naturali dove nuotare). Noleggia un'auto o unisciti a un tour." },
      { name: "Il centro di Cancún", text: "Parchi, mercati e piccoli ristoranti lontano dai resort. Un buon posto per mangiare cibo locale senza i prezzi dei resort." },
    ],
    bestTime: [
      "La maggior parte delle guide indica il clima migliore tra dicembre e aprile. È caldo e asciutto, e il mare è piacevole. Anche maggio è spesso descritto come un buon mese, con meno gente e prezzi più bassi.",
      "Da dicembre ad aprile è anche il periodo più affollato e caro, soprattutto intorno a Natale, alle vacanze di primavera e alla settimana di Pasqua. Circa settembre e ottobre sono i mesi più economici. Sono anche il picco della stagione degli uragani, che ufficialmente va da giugno a novembre. In estate le alghe sargassum possono arrivare sulle spiagge, anche se i resort di solito le puliscono ogni giorno.",
    ],
    tips: [
      "Prenota presto per il periodo da dicembre ad aprile e per la settimana di Pasqua.",
      "Se viaggi da giugno a novembre, controlla le previsioni prima di partire e valuta opzioni di prenotazione flessibili.",
      "Soggiorna in centro per prezzi più bassi e usa autobus o taxi per raggiungere la spiaggia.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Cancún?", a: "Circa da dicembre ad aprile, quando fa caldo ed è asciutto. È anche il periodo più caro, quindi prenota presto." },
      { q: "Cancún costa meno in autunno?", a: "Di solito sì. Settembre e ottobre sono bassa stagione, ma sono anche il picco della stagione degli uragani, quindi tieni i piani flessibili." },
      { q: "La stagione degli uragani a Cancún è pericolosa?", a: "La stagione va ufficialmente da giugno a novembre, con il rischio più alto a settembre e ottobre. La maggior parte dei giorni va bene, ma controlla le previsioni prima e durante il viaggio." },
      { q: "Quanti giorni servono per visitare Cancún?", a: "Da quattro a cinque giorni lasciano il tempo per la spiaggia più una o due gite in giornata, come Isla Mujeres o Chichén Itzá." },
    ],
    details: {
      gettingAround: [
        "Dall'aeroporto di Cancún (CUN) il modo più economico è l'autobus ADO, circa 140-170 pesos (circa 7-10 dollari americani) a seconda della guida e della fermata. Le guide non concordano su dove finisce: una dice la stazione ADO del centro, un'altra un terminal della zona hotel al km 4. Gli autobus partono ogni 30-60 minuti, anche se un rapporto dice che la linea per la zona hotel passa ogni due ore.",
        "Un taxi ufficiale dell'aeroporto per la zona hotel costa circa 700-900 pesos (40-45 dollari) in una guida del 2026. Le navette condivise costano circa 18 dollari a persona e i trasferimenti privati da circa 30 dollari. Concorda il prezzo e la valuta prima di salire su qualsiasi taxi.",
        "Tra il centro e la zona hotel gli autobus locali R1 e R2 costano circa 12 pesos. Uber funziona a Cancún. Le barche per Isla Mujeres partono da Puerto Juárez e da banchine nella zona hotel.",
      ],
      whereToStay: [
        { area: "Zona hotel", text: "Una lunga striscia di resort sul mare. La migliore per un viaggio dedicato alla spiaggia, con le parti nord e centrali preferite se le alghe sono un problema." },
        { area: "Centro (Centro)", text: "Hotel e ostelli più economici e cibo locale intorno al Parque de las Palapas e alla stazione ADO, con autobus per la spiaggia." },
        { area: "Isla Mujeres", text: "Una piccola isola a 20 minuti di traghetto da Cancún, popolare per una gita in giornata o per un soggiorno più tranquillo." },
        { area: "Playa del Carmen", text: "Più a sud, raggiungibile con l'autobus ADO in circa un'ora, con un centro cittadino vivace." },
      ],
      costs: [
        "Una guida del 2026 indica il traghetto di andata e ritorno per Isla Mujeres a circa 33 dollari americani e un taxi tra la zona hotel e il centro a circa 26 dollari. Gli autobus locali costano meno di 1 dollaro.",
        "I prezzi variano molto tra le zone turistiche e le strade locali. Da dicembre ad aprile c'è il clima migliore, e maggio o da fine ottobre a novembre sono descritti come più convenienti.",
      ],
      extraFaq: [
        { q: "Il sargassum è un problema a Cancún?", a: "Può esserlo, soprattutto in estate, e varia per spiaggia e per anno. Le guide suggeriscono la zona hotel nord, Isla Mujeres o Cozumel per avere più probabilità, e di controllare i rapporti sulle spiagge prima di prenotare." },
        { q: "C'è Uber a Cancún?", a: "Sì, Uber funziona in città, ma i ritiri all'aeroporto possono essere incostanti. Molti visitatori usano il banco ufficiale dei taxi dell'aeroporto o un trasferimento prenotato per la prima corsa." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "lisbon",
    itSlug: "lisbona",
    name: "Lisbona",
    country: "Portogallo",
    tagline: "Colline, tram e vista sul fiume, clima mite tutto l'anno",
    title: "Guida di viaggio a Lisbona: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Lisbona: tram, Belém, Alfama, Sintra, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Lisbona è una capitale collinare e da girare a piedi sul fiume Tago, nota per i tram gialli, le facciate di piastrelle e una scena gastronomica rilassata. È una delle capitali dell'Europa occidentale più accessibili.",
    ],
    attractions: [
      { name: "Torre di Belém e Monastero dos Jerónimos", text: "Due dei monumenti più noti, uno accanto all'altro sul fiume. Vai la mattina." },
      { name: "Tram 28 e Alfama", text: "Il vecchio tram sale tra le strette strade di Alfama. È affollato, quindi molti preferiscono girare la zona a piedi." },
      { name: "Castello di São Jorge", text: "Un castello in cima a una collina con ampie viste sulla città e sul fiume." },
      { name: "Pastéis de nata", text: "Assaggia i dolcetti alla crema nella pasticceria di Belém o in qualsiasi caffè di quartiere." },
      { name: "LX Factory", text: "Una ex zona industriale trasformata in negozi, caffè e librerie." },
      { name: "Gita a Sintra", text: "Palazzi e giardini sulle colline a circa 30 km, raggiungibili in treno." },
    ],
    bestTime: [
      "La primavera (da marzo a maggio) e l'inizio dell'autunno (settembre e ottobre) sono i periodi più confortevoli, con clima mite e meno folla che in piena estate.",
      "L'inverno è mite ma piovoso, ed è uno dei periodi più economici per voli e hotel, circa da dicembre a marzo. L'estate è calda e affollata.",
    ],
    tips: [
      "Porta scarpe comode: le strade sono ripide e lastricate.",
      "Usa metropolitana e tram, e fai attenzione ai borseggiatori sulle linee affollate.",
      "Prenota in anticipo i biglietti dei palazzi di Sintra nei mesi affollati.",
      "Confronta i voli da più aeroporti se abiti lontano da un hub.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Lisbona?", a: "La primavera (da marzo a maggio) e l'inizio dell'autunno (settembre e ottobre) hanno un clima mite e meno folla." },
      { q: "Lisbona costa poco in inverno?", a: "Spesso sì. Circa da dicembre a marzo è bassa stagione per voli e hotel, anche se può piovere." },
      { q: "Quanti giorni servono per visitare Lisbona?", a: "Tre giorni per la città, e uno in più per Sintra." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Lisbona dista solo circa 7 km dal centro ed è sulla linea rossa della metropolitana. Il tragitto verso il centro dura circa 20-35 minuti. Una corsa singola in metropolitana costa circa 1,90 euro più 0,50 euro per la carta ricaricabile Navegante, che ha sostituito la vecchia carta Viva Viagem. Caricare credito sulla carta rende le corse un po' più economiche, a circa 1,70 euro.",
        "L'Aerobus non esiste più, anche se le vecchie guide lo citano ancora. Gli autobus Carris 744 e 783 servono anche l'aeroporto alle normali tariffe cittadine, e un taxi costa di solito circa 10-15 euro. Un pass di 24 ore per Carris e metropolitana costa 7,25 euro.",
        "Lisbona è collinare. Baixa è la zona più pianeggiante, mentre Alfama e Bairro Alto comportano salite serie, e tram e funicolari aiutano con le pendenze.",
      ],
      whereToStay: [
        { area: "Baixa e Chiado", text: "Il cuore pianeggiante e centrale della città con la metropolitana Baixa-Chiado, e la scelta abituale per chi viene la prima volta." },
        { area: "Alfama", text: "La vecchia Lisbona e la casa del fado, con strade strette e in salita." },
        { area: "Bairro Alto e Cais do Sodré", text: "Le zone della vita notturna. Il Bairro Alto può essere rumoroso fino a tarda notte." },
        { area: "Príncipe Real", text: "Negozi boutique e ristoranti, più tranquilla del Bairro Alto e a breve distanza a piedi." },
        { area: "Saldanha, Estrela e Campo de Ourique", text: "Una guida dice che offrono un rapporto qualità prezzo nettamente migliore di Baixa o Chiado per una qualità simile." },
      ],
      costs: [
        "Le stime variano. Una guida del 2026 indica il budget giornaliero a circa 75 euro per chi viaggia da solo con poco budget e fino a 240 euro per una fascia media confortevole. Gli hotel centrali di fascia media sono indicati a circa 120-220 euro a notte, e un letto in dormitorio in ostello da circa 20-40 euro.",
        "Lisbona aggiunge una tassa di soggiorno comunale a notte oltre al prezzo della camera, quindi includila nel totale. D'estate le camere costano nettamente di più che a febbraio o nelle stagioni intermedie.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Lisbona al centro?", a: "Prendi la linea rossa della metropolitana dall'aeroporto. Arriva alle stazioni centrali in circa 20-35 minuti per circa 1,90 euro più 0,50 euro per la carta Navegante. Un taxi costa di solito circa 10-15 euro." },
        { q: "C'è un Aerobus dall'aeroporto di Lisbona?", a: "No, è stato cancellato definitivamente nel 2022. Usa la metropolitana, un autobus Carris o un taxi." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "sydney",
    itSlug: "sydney",
    name: "Sydney",
    country: "Australia",
    tagline: "Porto, spiagge e passeggiate sulla costa, meglio in primavera e in autunno",
    title: "Guida di viaggio a Sydney: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Sydney: Opera House, spiagge, passeggiate sulla costa, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Sydney è costruita intorno a un enorme porto. Trovi monumenti famosi, traghetti, spiagge cittadine e passeggiate sulla costa in un solo posto, e quasi tutto si raggiunge facilmente senza auto.",
      "L'Australia è lontana dalla maggior parte del mondo, quindi il volo è la spesa grande. Scegli le date con cura e prenota presto se vuoi arrivare nelle settimane delle vacanze estive.",
    ],
    attractions: [
      { name: "Sydney Opera House", text: "L'edificio più famoso della città. Gira intorno gratis, oppure prenota uno spettacolo o un tour per vedere l'interno." },
      { name: "Sydney Harbour Bridge", text: "Si può attraversare a piedi o con una salita guidata. Le viste sull'Opera House e sul porto sono buone dal ponte e da The Rocks." },
      { name: "Passeggiata costiera da Bondi a Coogee", text: "Un sentiero sulla scogliera lungo il mare, davanti a diverse spiagge e piscine naturali. Porta un cappello e acqua, e prevedi di fare un bagno lungo la strada." },
      { name: "The Rocks", text: "La parte più antica della città, con vecchie strade, pub, mercati e musei vicino al porto. È una buona prima passeggiata." },
      { name: "Passeggiata da Spit Bridge a Manly", text: "Un sentiero tra bush e porto nel Sydney Harbour National Park. Finisci a Manly per una spiaggia e un pasto." },
    ],
    bestTime: [
      "Le stagioni sono invertite rispetto all'Europa e al Nord America. Le fonti concordano che la primavera (da settembre a novembre) e l'autunno (da marzo a maggio) danno giornate miti e piacevoli per camminare. L'estate (da dicembre a febbraio) è calda e ottima per la spiaggia.",
      "Dicembre e gennaio sono i mesi più affollati e cari. Da giugno ad agosto è il periodo più tranquillo e di solito più economico, con giornate più fresche ma spesso soleggiate. Vivid Sydney, il festival delle luci, dura alcune settimane intorno a maggio e giugno, quindi le date cambiano di anno in anno.",
    ],
    tips: [
      "Confronta i voli per alcune date. L'inverno e le stagioni intermedie sono spesso più economici delle vacanze estive.",
      "Prenota presto gli hotel per Natale, Capodanno e gennaio.",
      "Usa traghetti e treni in città, perché parcheggiare è difficile.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare. La maggior parte dei visitatori ha bisogno di un visto o di un'autorizzazione di viaggio elettronica.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Sydney?", a: "Circa da settembre a novembre o da marzo a maggio, quando il clima è mite. L'estate è meglio se vuoi soprattutto la spiaggia." },
      { q: "Quando costa meno Sydney?", a: "Di solito da giugno ad agosto, che è la stagione tranquilla. I prezzi più alti sono a dicembre e gennaio." },
      { q: "Si può fare il bagno a Sydney in inverno?", a: "Le temperature del mare restano abbastanza miti per gran parte dell'anno, ma i bagni invernali sono freddi. La maggior parte dei visitatori nuota dalla tarda primavera all'inizio dell'autunno." },
      { q: "Quanti giorni servono per visitare Sydney?", a: "Quattro giorni bastano per il porto, una passeggiata sulla spiaggia e una giornata sull'acqua. Aggiungi una gita in giornata se hai più tempo." },
    ],
    details: {
      gettingAround: [
        "Sydney usa il sistema Opal. Appoggia la carta all'inizio e alla fine del viaggio con una carta Opal o una carta bancaria contactless su treni, metropolitana, autobus, traghetti e metropolitana leggera. Nel 2026 il tetto giornaliero per un adulto è di 19,30 dollari australiani da lunedì a giovedì e 9,65 da venerdì a domenica, con un tetto settimanale di 50.",
        "Il treno dell'aeroporto è il modo più veloce per il centro, ma le stazioni dell'aeroporto applicano un costo di accesso non coperto dai tetti. Le guide indicano il viaggio a circa 21-22 dollari. Camminare o prendere un autobus da Mascot fa risparmiare gran parte di quel costo.",
        "I traghetti da Circular Quay, come quello per Manly, contano per lo stesso tetto. I fine settimana sono il momento migliore per andare più lontano, perché il tetto è la metà di quello dei giorni feriali.",
      ],
      whereToStay: [
        { area: "CBD e The Rocks", text: "Centrali per chi viene la prima volta, vicine a Circular Quay, all'Opera House e all'Harbour Bridge." },
        { area: "Bondi e Coogee", text: "Quartieri di mare per surf e passeggiate sulla costa, con collegamento in autobus o treno e autobus alla città." },
        { area: "Vicino a Central e Kings Cross", text: "Buoni collegamenti e vita notturna, spesso più economiche del CBD." },
        { area: "Newtown", text: "Una zona dall'atmosfera locale per soggiorni più lunghi, con caffè e bar." },
      ],
      costs: [
        "Gli spostamenti incidono poco sul budget grazie al tetto Opal. Le migliori attrazioni naturali di Sydney, tra cui il porto e le spiagge, sono gratuite, mentre alloggio e ristoranti sono dove si accumulano i costi.",
        "Un diario di spesa del 2026 riporta una spesa di trasporto del fine settimana di circa 9 dollari al giorno. Il costo della stazione dell'aeroporto è l'extra principale.",
      ],
      extraFaq: [
        { q: "Serve una carta Opal a Sydney?", a: "Alla maggior parte degli adulti no. Puoi appoggiare una carta bancaria contactless o lo smartphone e ottenere gli stessi tetti giornalieri e settimanali. Usa lo stesso metodo per tutto il viaggio." },
        { q: "Perché il treno dell'aeroporto di Sydney è più caro?", a: "Le stazioni dell'aeroporto sono gestite da privati e applicano un costo di accesso alla stazione oltre alla tariffa normale. Non è coperto dai tetti Opal." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "melbourne",
    itSlug: "melbourne",
    name: "Melbourne",
    country: "Australia",
    tagline: "Vicoli, caffè e arte, meglio in autunno e in primavera",
    title: "Guida di viaggio a Melbourne: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Melbourne: vicoli, mercati, arte, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Melbourne è una città per camminare, mangiare e fare cultura. Ha vicoli con street art, grandi mercati, gallerie, parchi e sport tutto l'anno.",
      "Il tempo cambia in fretta, tanto che la gente scherza sulle quattro stagioni in un giorno. Porta più strati di vestiti in qualsiasi periodo.",
    ],
    attractions: [
      { name: "I vicoli", text: "Il centro ha molti piccoli vicoli con street art, caffè e bar. Gira senza un programma e fermati dove c'è più gente." },
      { name: "Queen Victoria Market", text: "Un grande mercato di cibo e merci. In alcuni periodi dell'anno ha anche un mercato notturno, quindi controlla le date." },
      { name: "National Gallery of Victoria", text: "Il principale museo d'arte, con grandi mostre nei mesi più freschi. Controlla cosa c'è prima di andare." },
      { name: "Royal Botanic Gardens", text: "Un grande spazio verde vicino al centro. È un buon posto per riposare, soprattutto in primavera e in autunno." },
      { name: "Spiaggia di St Kilda", text: "La spiaggia della città, raggiungibile in tram. Funziona meglio nelle calde giornate d'estate, ed è buona anche per una passeggiata al tramonto." },
    ],
    bestTime: [
      "Le stagioni sono invertite rispetto all'emisfero nord. Le fonti indicano soprattutto la primavera (da settembre a novembre) e l'autunno (da marzo a maggio) come le più confortevoli. L'inizio dell'autunno è spesso descritto come il clima migliore dell'anno.",
      "Da dicembre a febbraio è il periodo più affollato e caro, anche per le vacanze scolastiche e grandi eventi come l'Australian Open a gennaio. Da giugno ad agosto è la stagione tranquilla e più economica, con mattine fredde e un clima adatto ai musei. In estate controlla gli avvisi di incendi boschivi.",
    ],
    tips: [
      "Porta più strati e una giacca leggera antipioggia per qualsiasi mese.",
      "Prenota presto gli hotel se le tue date coincidono con l'Australian Open a gennaio o con il Gran Premio a marzo.",
      "Usa i tram nel centro.",
      "Una gita in giornata sulla Great Ocean Road è possibile, ma è lunga, quindi parti presto o fermati una notte.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Melbourne?", a: "Circa da marzo ad aprile o da settembre a novembre, quando il clima è mite. Gennaio e febbraio sono più caldi e affollati." },
      { q: "Melbourne costa meno in inverno?", a: "Di solito sì. Da giugno ad agosto è la stagione tranquilla, e voli e hotel sono spesso più bassi." },
      { q: "A Melbourne piove molto?", a: "Il tempo è variabile tutto l'anno. La primavera può essere piovosa e ventosa, quindi porta un impermeabile." },
    ],
    details: {
      gettingAround: [
        "I tram nel centro e a Docklands sono gratuiti dentro la Free Tram Zone, e non serve appoggiare la carta. Se il viaggio inizia o finisce fuori dalla zona, devi appoggiare una carta myki.",
        "Myki copre treni, tram e autobus. Il tetto giornaliero è di circa 11 dollari australiani nei giorni feriali e di circa 7,60-8 nei fine settimana, a seconda della fonte, e la carta costa circa 6 dollari. Il City Circle Tram, linea 35, è gratuito e fa un giro intorno al centro.",
        "Dall'aeroporto di Melbourne lo SkyBus per la stazione Southern Cross costava 25,90 dollari di sola andata nel 2026 e funziona dalle 4 all'1. Lo SkyBus non è coperto dal tetto myki.",
      ],
      whereToStay: [
        { area: "CBD", text: "Vicoli, gallerie commerciali e la Free Tram Zone, quindi quasi tutti i luoghi della città si raggiungono a piedi." },
        { area: "Fitzroy e Collingwood", text: "Bar, musica dal vivo e caffè appena a nord del centro, raggiungibili in tram." },
        { area: "St Kilda", text: "Una zona di mare con una scena da backpacker, fuori dalla Free Tram Zone." },
        { area: "Southbank e Docklands", text: "Zone sul fiume e sul porto con hotel moderni, dentro o accanto alla Free Tram Zone." },
      ],
      costs: [
        "Una guida per backpacker suggerisce circa 85 dollari australiani al giorno con un budget ristretto e circa 150 per uno confortevole. I letti in dormitorio partono da circa 30 dollari su Hostelworld.",
        "La National Gallery of Victoria ha l'ingresso generale gratuito, il che aiuta a tenere basso il costo di un viaggio economico.",
      ],
      extraFaq: [
        { q: "Serve una carta myki a Melbourne?", a: "Solo se esci dalla Free Tram Zone. Dentro il CBD e Docklands i tram sono gratuiti e non serve una carta, ma ti serve una myki per treni, autobus e tram oltre quell'area." },
        { q: "Quanto costa lo SkyBus dall'aeroporto di Melbourne?", a: "Nel 2026 costava 25,90 dollari australiani di sola andata, con l'autobus che arriva alla stazione Southern Cross. Controlla le tariffe attuali sul sito dell'operatore." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "los-angeles",
    itSlug: "los-angeles",
    name: "Los Angeles",
    country: "Stati Uniti",
    tagline: "Spiagge, storia del cinema e sole, ottima in primavera e in autunno",
    title: "Guida di viaggio a Los Angeles: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Los Angeles: spiagge, Hollywood, Griffith Observatory, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Los Angeles è una città enorme e sparsa di spiagge, colline, studi cinematografici, musei e cucina di ogni parte del mondo. Non ha un solo centro, quindi conviene scegliere due o tre zone e non cercare di vedere tutto.",
      "Spostarsi richiede organizzazione. Le distanze sono lunghe e il traffico può essere intenso, quindi pensa a dove dormire prima di prenotare.",
    ],
    attractions: [
      { name: "Santa Monica e Venice", text: "Città di mare con un molo, un lungo percorso sul lungomare e vita di strada. Facili da unire in una giornata." },
      { name: "Hollywood", text: "La Walk of Fame e i punti panoramici della famosa scritta sono affollati e turistici ma fanno parte della storia di LA. Nelle vicinanze si possono fare i tour degli studi cinematografici." },
      { name: "Griffith Observatory", text: "Un osservatorio in cima a una collina con viste sulla città e verso la scritta di Hollywood. È un buon posto dove stare al tramonto." },
      { name: "Getty Center", text: "Un museo d'arte su una collina con giardini e ampie viste sulla città. Controlla le regole di ingresso attuali prima di andare." },
      { name: "Escursioni e fiori selvatici sulle colline", text: "I sentieri intorno alla città offrono viste sulla costa e sullo skyline. La primavera è un periodo molto amato per le colline verdi e i fiori." },
    ],
    bestTime: [
      "La primavera (da marzo a maggio) e l'inizio dell'autunno (settembre e ottobre) sono spesso indicati come i periodi migliori. Le temperature sono calde senza essere estreme, e spiagge ed escursioni sono entrambe piacevoli. Le mattine sulla costa a maggio e giugno sono spesso grigie e nebbiose (il cosiddetto June Gloom) e di solito si schiariscono nel pomeriggio.",
      "L'estate è il periodo più affollato e caro, e luglio è spesso il mese più costoso. I prezzi salgono anche da metà dicembre a inizio gennaio. Le fonti differiscono sui mesi più economici, ma circa gennaio, febbraio e l'autunno fuori dalle settimane festive sono spesso più convenienti. La pioggia non è frequente, ma l'inverno è quando è più probabile.",
    ],
    tips: [
      "Alloggia vicino a dove pensi di passare la maggior parte delle giornate, perché attraversare la città può richiedere molto tempo.",
      "I soggiorni a metà settimana di solito costano meno di quelli nel fine settimana.",
      "Prevedi di usare un'auto, un servizio di rideshare o un mix dei due; i trasporti pubblici coprono meno zone che in molte altre città.",
      "Controlla le regole di ingresso negli Stati Uniti per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Los Angeles?", a: "Circa da marzo a maggio e da settembre a ottobre, quando fa caldo ma non troppo e la folla è minore che in estate." },
      { q: "Che cos'è il June Gloom?", a: "Mattine grigie e nebbiose vicino alla costa a fine primavera e inizio estate. Di solito si schiariscono nel pomeriggio." },
      { q: "Serve un'auto a Los Angeles?", a: "Rende più facili alcuni spostamenti, perché la città è molto estesa. Molti visitatori alternano rideshare e un'auto a noleggio per alcuni giorni." },
    ],
    details: {
      gettingAround: [
        "LAX ora è collegato alla rete ferroviaria Metro tramite il LAX/Metro Transit Center. Una navetta gratuita parte dai terminal, poi si prende la linea C o K, con una tariffa Metro di 1,75 dollari americani che include due ore di trasferimenti. L'autobus FlyAway per Union Station è un'altra opzione, indicato a 9,75 dollari in una guida e a 12,75 in un'altra.",
        "I taxi da LAX applicano una tariffa fissa di 54,50 dollari fino a Downtown, più un supplemento aeroportuale di circa 4 dollari. Hollywood e Santa Monica sono a tassametro. Il rideshare è indicato a circa 35-55 dollari per Downtown o Hollywood e 25-40 per Santa Monica, più una tariffa di ritiro.",
        "Le tariffe Metro hanno un tetto di 5 dollari al giorno o 18 dollari a settimana con una carta TAP. La linea B arriva a Hollywood e la linea E al centro di Santa Monica, ma LA è molto estesa e molti visitatori usano comunque il rideshare o un'auto.",
      ],
      whereToStay: [
        { area: "Hollywood", text: "Vicina alla Walk of Fame e alla linea B della Metro, e una base comune per una prima visita senza auto." },
        { area: "Santa Monica", text: "Sul mare, con il molo e la linea E della Metro per Downtown." },
        { area: "Downtown LA", text: "Centrale per le linee della Metro e Union Station, con musei e food hall." },
        { area: "Beverly Hills e West Hollywood", text: "Hotel, ristoranti e vita notturna di livello più alto, e prezzi maggiori." },
      ],
      costs: [
        "Una guida del 2026 indica ostelli e hotel economici a circa 70-105 dollari americani a notte, hotel confortevoli a 3-4 stelle a 160-220 e il lusso a 350-670 o più. Le tariffe sono più alte in estate e nei fine settimana degli eventi.",
        "Il parcheggio negli hotel e nelle attrazioni può pesare se noleggi un'auto, quindi confronta quel costo con il rideshare per il tuo programma.",
      ],
      extraFaq: [
        { q: "Posso visitare Los Angeles senza auto?", a: "Sì, con dei limiti. La metropolitana e gli autobus raggiungono LAX, Hollywood, Downtown e Santa Monica, ma la città si estende per molte miglia, quindi scegli la base in base ai luoghi che ti interessano di più." },
        { q: "Come si va da LAX a Hollywood?", a: "In rideshare o taxi da porta a porta, oppure con la navetta gratuita di LAX fino al Metro Transit Center e le linee ferroviarie Metro. Con i bagagli taxi o rideshare sono più semplici." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "las-vegas",
    itSlug: "las-vegas",
    name: "Las Vegas",
    country: "Stati Uniti",
    tagline: "Spettacoli, resort e gite nel deserto, meglio in primavera e in autunno",
    title: "Guida di viaggio a Las Vegas: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Las Vegas: Strip, spettacoli, Red Rock Canyon, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Las Vegas è una città nel deserto nota per i grandi hotel resort, i casinò, gli spettacoli dal vivo e i ristoranti. Oltre la Strip c'è anche una zona più antica in centro e alcuni ottimi luoghi all'aperto a breve distanza in auto.",
      "Metti in conto il caldo e le camminate. Le distanze sulla Strip sembrano brevi sulla mappa ma sono più lunghe a piedi, e le giornate d'estate sono molto calde.",
    ],
    attractions: [
      { name: "La Strip", text: "La strada principale di giganteschi hotel a tema, negozi e spettacoli. Si vede meglio a piedi la sera, quando fa più fresco." },
      { name: "Downtown e Fremont Street", text: "Una parte più antica della città con una strada coperta, luci e locali più piccoli. Ha un'atmosfera diversa dalla Strip." },
      { name: "Spettacoli dal vivo", text: "Musica, comicità e spettacoli teatrali ogni sera. Confronta i prezzi dei biglietti e prenota in anticipo quelli più richiesti." },
      { name: "Red Rock Canyon", text: "A breve distanza in auto dalla Strip, con escursioni nel deserto e strade panoramiche. Primavera e autunno sono le stagioni più confortevoli." },
      { name: "Valley of Fire State Park", text: "Un parco statale di roccia rossa, a circa un'ora di auto dalla città. Porta acqua e parti presto." },
    ],
    bestTime: [
      "Primavera e autunno sono i periodi più confortevoli, circa da marzo a maggio e da ottobre a novembre, con giornate calde e sere più fresche. Ottobre è spesso indicato come uno dei mesi migliori.",
      "L'estate è molto calda, con massime spesso sopra i 40°C, ma i prezzi di voli e hotel possono essere bassi. Gennaio e febbraio sono tranquilli e spesso convenienti, anche se le notti sono fredde. Primavera e autunno possono essere affollati, e grandi eventi, Capodanno e fine settimana festivi fanno salire i prezzi.",
    ],
    tips: [
      "Controlla il prezzo finale dell'hotel. Molti hotel aggiungono una resort fee giornaliera oltre alla tariffa della camera.",
      "Controlla il calendario degli eventi prima di prenotare, perché grandi congressi ed eventi fanno salire i prezzi.",
      "In estate fai le attività all'aperto presto o a fine giornata e bevi molta acqua.",
      "I fine settimana di solito costano più dei giorni feriali.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Las Vegas?", a: "Circa da marzo a maggio e da ottobre a novembre, quando il clima è caldo ma confortevole." },
      { q: "Las Vegas costa meno in estate?", a: "Spesso sì, ma il caldo è intenso. Molti visitatori passano gran parte della giornata al chiuso o in piscina." },
      { q: "Che cosa sono le resort fee?", a: "Un costo giornaliero aggiunto da molti hotel di Las Vegas oltre al prezzo della camera. Controlla se è incluso nel totale prima di prenotare." },
    ],
    details: {
      gettingAround: [
        "Dall'aeroporto Harry Reid (LAS) i taxi usano tariffe a zone, e una fonte del 2026 indica circa 21-30 dollari americani per la Strip. Uber e Lyft costano di solito circa 15-35 dollari per quasi tutta la giornata ma possono superare i 55 durante i congressi e nei fine settimana più affollati. Gli hotel del centro come il Circa sono fuori dalle zone della Strip e usano il tassametro.",
        "L'opzione più economica è l'autobus RTC. La linea 109 o la Red Line ti porta a un terminal di interscambio dove cambi sul Deuce, un autobus a due piani attivo 24 ore su 24 che percorre la Strip fino a Downtown. Un pass di 2 ore per la Strip era indicato a 6 dollari e uno di 24 ore a circa 8 dollari.",
        "La Strip è più lunga di quanto sembri, quindi la maggior parte dei visitatori alterna camminate con il Deuce, il rideshare o le navette degli hotel. Un'auto a noleggio spesso significa pagare ogni giorno il parcheggio del resort.",
      ],
      whereToStay: [
        { area: "La Strip", text: "Grandi resort con casinò, spettacoli e ristoranti, al centro dell'azione." },
        { area: "Downtown (Fremont Street)", text: "Casinò più antichi e camere più economiche, con il Deuce e l'autobus CX che la collegano all'aeroporto." },
        { area: "Fuori dalla Strip", text: "Le camere vicino al Convention Center o all'aeroporto sono spesso più economiche che sulla Strip." },
        { area: "Vicino all'aeroporto", text: "Gli hotel vicini all'aeroporto vanno bene per voli molto presto o molto tardi, ma sono lontani dai casinò." },
      ],
      costs: [
        "Una guida indica budget giornalieri da circa 75 dollari americani per chi viaggia con poco budget a oltre 900 per il lusso. Le resort fee si pagano a notte oltre alla tariffa della camera, e una guida dice che possono arrivare a 50 dollari al giorno, quindi controlla il prezzo finale.",
        "Aggiungi la mancia per i ristoranti. Un pass RTC di 24 ore costa circa 8 dollari, un modo economico di coprire la Strip.",
      ],
      extraFaq: [
        { q: "Le resort fee sono incluse nel prezzo a Las Vegas?", a: "Spesso no. Si pagano a notte oltre alla tariffa della camera e possono comparire solo all'ultimo passaggio, quindi confronta il prezzo completo con le fee tra gli hotel prima di prenotare." },
        { q: "Qual è il modo più economico per andare dall'aeroporto alla Strip?", a: "L'autobus pubblico RTC, con un cambio sul Deuce. Costa pochi dollari ma richiede più tempo ed è scomodo con i bagagli grandi, quindi molti scelgono un taxi o un rideshare." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "bali",
    itSlug: "bali",
    name: "Bali",
    country: "Indonesia",
    tagline: "Templi, risaie e spiagge da surf, più asciutta da maggio a settembre",
    title: "Guida di viaggio a Bali: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Bali: templi, risaie, spiagge, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Bali è un'isola indonesiana con vulcani, risaie, templi indù e una lunga costa di spiagge da surf e da tramonto. Puoi passare una settimana in una zona sola o spostarti tra le colline fresche e la costa.",
      "Dove alloggi cambia molto il viaggio. Ubud è calma e verde, Canggu e Seminyak sono per surf e caffè, e il sud ha le spiagge più affollate.",
    ],
    attractions: [
      { name: "Ubud e le risaie", text: "Ubud è il centro culturale dell'isola, con templi, musei, mercati e terrazze verdi vicine. È più fresca della costa e funziona bene anche nei giorni di pioggia." },
      { name: "I templi di Uluwatu e Tanah Lot", text: "Sono entrambi templi sul mare su bordi di roccia scenografici, e sono molto frequentati al tramonto. Arriva presto per avere un buon posto." },
      { name: "Monte Batur", text: "Un vulcano che molti visitatori salgono prima dell'alba per vedere il sorgere del sole. La maggior parte delle persone va con una guida locale." },
      { name: "Nusa Penida", text: "Una piccola isola a breve distanza in barca da quella principale, nota per le scogliere ripide e l'acqua limpida. Di solito è più tranquilla della costa sud." },
      { name: "Le spiagge di Canggu e Seminyak", text: "La costa ovest ha onde da surf, beach club e molti caffè. È animata, quindi scegli un'altra zona se vuoi tranquillità." },
    ],
    bestTime: [
      "Bali ha una stagione secca e una stagione umida. La stagione secca va circa da aprile o maggio a settembre o ottobre, con giornate di sole adatte a spiagge, escursioni, immersioni e surf. Maggio, giugno e settembre sono spesso indicati come un buon equilibrio tra tempo asciutto e meno gente.",
      "Luglio e agosto sono i mesi più affollati e cari, e anche Natale e Capodanno sono molto frequentati. La stagione umida, circa da novembre a marzo, è la più economica, con piogge forti ma spesso brevi. Il Nyepi, il Giorno del Silenzio, cade di solito intorno a marzo e quasi tutto chiude per un giorno, quindi controlla la data prima di prenotare.",
    ],
    tips: [
      "Confronta i voli per alcune date; i mesi economici possono far risparmiare molto.",
      "Scegli prima la zona base, perché il traffico rende lenti gli spostamenti.",
      "I visitatori stranieri pagano una tassa turistica una tantum per viaggio. Controlla il sito ufficiale Love Bali per le regole attuali.",
      "Copri spalle e ginocchia nei templi e preparati a indossare un sarong.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Bali?", a: "Circa da maggio a settembre, nella stagione secca. Maggio, giugno e settembre hanno di solito un buon clima e meno gente di luglio e agosto." },
      { q: "Quando costa meno Bali?", a: "Nella stagione umida, circa da novembre a marzo, tranne le settimane di Natale e Capodanno. Aspettati più pioggia." },
      { q: "C'è una tassa turistica a Bali?", a: "Sì. I visitatori stranieri pagano una tassa una tantum per viaggio. Controlla il sito ufficiale Love Bali per l'importo e le modalità di pagamento." },
      { q: "Quanti giorni servono per visitare Bali?", a: "Circa una settimana basta per due zone, per esempio Ubud più la costa. Aggiungi giorni per Nusa Penida o altre isole." },
    ],
    details: {
      gettingAround: [
        "L'unico aeroporto commerciale di Bali è Ngurah Rai (DPS). È più vicino a Kuta, Seminyak e Jimbaran che alla capitale Denpasar. Cerca il banco ufficiale dei taxi dell'aeroporto e le zone Grab e Gojek, invece di accettare offerte dai conducenti dentro il terminal.",
        "I taxi ufficiali al banco e le app costano circa 100.000-150.000 rupie per Kuta o Seminyak e 150.000-250.000 per Canggu in una guida del 2026, mentre un'altra indica intervalli più ampi per le stesse tratte. Seminyak è a soli 9-11 km circa, ma il tragitto può durare da 20 a 45 minuti con il traffico. Ubud è molto più lontana.",
        "I trasporti pubblici sono limitati. La maggior parte dei visitatori usa Grab o Gojek, taxi, un autista privato per la giornata o uno scooter a noleggio se ha esperienza e la patente giusta.",
      ],
      whereToStay: [
        { area: "Seminyak", text: "Beach club, ristoranti e negozi, popolare per una prima visita." },
        { area: "Ubud", text: "Risaie, templi, yoga e benessere, nell'entroterra e lontana dalla spiaggia." },
        { area: "Canggu", text: "Una zona di surf e caffè, popolare tra chi lavora da remoto." },
        { area: "Sanur", text: "Una località di mare più calma che funziona bene per soggiorni più lunghi e tranquilli." },
        { area: "Uluwatu", text: "Scogliere e surf sulla penisola meridionale, affollata al tramonto." },
      ],
      costs: [
        "Ogni turista straniero paga una tassa turistica una tantum di 150.000 rupie (circa 10 dollari americani) a persona, bambini compresi, da pagare una sola volta sul sito ufficiale Love Bali prima o all'arrivo. È separata da qualsiasi costo del visto.",
        "Una guida del 2026 indica gli hotel a circa 30-65 dollari a notte nelle zone popolari e il cibo a circa 10-20 dollari al giorno. Le guesthouse economiche a Canggu e Ubud possono costare molto meno. Restare qualche giorno in una sola zona tiene bassi i costi di trasporto.",
      ],
      extraFaq: [
        { q: "Devo pagare una tassa turistica a Bali?", a: "Sì. I visitatori stranieri pagano una tassa turistica una tantum di 150.000 rupie, circa 10 dollari americani, a persona. Si paga online sul portale ufficiale Love Bali e si mostra il voucher con QR all'arrivo." },
        { q: "Come si va dall'aeroporto di Bali a Seminyak o Canggu?", a: "Usa il banco ufficiale dei taxi dell'aeroporto o le zone di ritiro Grab e Gojek. Aspettati circa 100.000-150.000 rupie per Seminyak e un po' di più per Canggu, con tempi che dipendono dal traffico." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "fiji",
    itSlug: "figi",
    name: "Figi",
    at: "alle",
    country: "Figi",
    tagline: "Spiagge e barriere sulle isole, più asciutte da maggio a ottobre",
    title: "Guida di viaggio alle Figi: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio alle Figi: isole, spiagge, barriere coralline, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "La maggior parte dei viaggi alle Figi parte da Nadi, sull'isola principale di Viti Levu. Da lì puoi soggiornare vicino a Nadi oppure prendere una barca per i gruppi di isole al largo.",
      "Le Figi sono soprattutto mare. Spiagge, snorkeling, immersioni e il passaggio da un'isola all'altra sono i motivi principali per andarci.",
    ],
    attractions: [
      { name: "Isole Mamanuca", text: "Un gruppo di isole vicino a Nadi, facile da raggiungere in barca. Vanno bene per soggiorni brevi e gite in giornata." },
      { name: "Isole Yasawa", text: "Una catena di isole più lunga a nord-ovest. Sono più tranquille e il viaggio in barca dura di più." },
      { name: "Spiaggia di Natadola", text: "Una lunga spiaggia sulla costa di Viti Levu, raggiungibile in auto da Nadi. È adatta a una giornata in riva al mare." },
      { name: "Dune di sabbia di Sigatoka", text: "Dune sulla costa sud di Viti Levu con sentieri da percorrere a piedi. Sono una buona pausa dalla spiaggia." },
      { name: "Great Astrolabe Reef", text: "Una grande barriera al largo di Kadavu, nota per le immersioni. È un viaggio per chi fa immersioni, non per un soggiorno breve." },
    ],
    bestTime: [
      "Le Figi hanno due stagioni invece di quattro. La stagione secca va circa da maggio a ottobre, con meno pioggia e minore umidità. Le fonti la descrivono come il periodo migliore per viaggi di mare e di isole.",
      "La stagione umida va circa da novembre ad aprile, con caldo, umidità e forti acquazzoni. In questo periodo sono possibili cicloni, soprattutto a metà stagione. I prezzi più alti cadono di solito nei mesi asciutti e a Natale e Capodanno, mentre la stagione umida è spesso più economica. Le fonti differiscono sulle date esatte, quindi controlla le previsioni prima di prenotare.",
    ],
    tips: [
      "Prenota in anticipo le barche per le isole e gli hotel nella stagione secca.",
      "Nella stagione umida compra biglietti flessibili e un'assicurazione di viaggio che copra le tempeste.",
      "La costa occidentale, con Nadi e le Mamanuca, è in genere più asciutta di quella orientale.",
      "Controlla le regole sul visto per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare le Figi?", a: "Circa da maggio a ottobre, nella stagione secca. Anche aprile e novembre possono andare bene, con meno visitatori." },
      { q: "Le Figi costano meno nella stagione umida?", a: "Di solito sì, fuori dalle settimane di Natale e Capodanno. Il rovescio della medaglia è più pioggia e il rischio di cicloni." },
      { q: "Devo soggiornare vicino a Nadi?", a: "No. Nadi ha l'aeroporto principale, e da lì molti proseguono per le isole Mamanuca o Yasawa." },
    ],
    details: {
      gettingAround: [
        "La maggior parte dei visitatori arriva all'aeroporto internazionale di Nadi, sul lato occidentale di Viti Levu. L'isola di Denarau dista circa 20 minuti in auto, la Coral Coast da 2 a 2,5 ore e Suva circa 3,5 ore. I taxi sono facili da trovare a Nadi, e si possono prenotare in anticipo trasferimenti privati o condivisi.",
        "Il Westbus giallo è il modo più economico tra Nadi e Denarau, e un servizio hop-on hop-off Bula Bus collega i resort di Denarau con il porto turistico.",
        "I traghetti per le isole partono da Port Denarau. Le isole Mamanuca distano circa 45-60 minuti e le Yasawa richiedono da 2 a 5 ore, oppure un idrovolante. Awesome Adventures vende un Bula Combo Pass valido da 5 a 15 giorni. Calcola almeno 4-5 ore tra l'arrivo di un traghetto e un volo internazionale.",
      ],
      whereToStay: [
        { area: "Isola di Denarau", text: "Un'isola di resort vicina all'aeroporto e al terminal dei traghetti." },
        { area: "Coral Coast", text: "Spiagge e barriere sulla costa sud, popolari tra le famiglie." },
        { area: "Isole Mamanuca", text: "Resort su isole vicine raggiungibili con un breve traghetto da Port Denarau." },
        { area: "Isole Yasawa", text: "Isole remote con un'ampia gamma di soluzioni, dai dormitori economici ai bure." },
      ],
      costs: [
        "Le guide non concordano sui prezzi. Una indica 50-70 dollari americani al giorno con poco budget e 100-150 in fascia media, mentre un'altra indica una giornata di fascia media a circa 202 dollari. Ostelli economici e hotel economy costano circa 30-50 dollari a notte.",
        "Soggiornare sull'isola principale e visitare le isole in gite in giornata può costare meno dei soggiorni notturni nei resort, ma i costi di traghetti e trasferimenti si sommano.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Nadi alle isole?", a: "Raggiungi Port Denarau in auto, poi prendi un traghetto per le isole Mamanuca o Yasawa. Alcune compagnie di traghetti organizzano pullman dall'aeroporto, e gli idrovolanti sono un'altra opzione." },
        { q: "Dove dormire in un primo viaggio alle Figi?", a: "Molti visitatori alla prima visita dividono il tempo tra Denarau o la Coral Coast e un gruppo di isole. Denarau è vicina ai traghetti, mentre le isole offrono spiagge più tranquille." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "auckland",
    itSlug: "auckland",
    name: "Auckland",
    country: "Nuova Zelanda",
    tagline: "Vulcani, traghetti per le isole e spiagge, caldo da dicembre a marzo",
    title: "Guida di viaggio a Auckland: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Auckland: Sky Tower, vulcani, Waiheke, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Auckland sta tra due porti. Ha colline vulcaniche, spiagge, isole del vino a un breve viaggio in traghetto e una scena gastronomica vivace.",
      "È anche il principale aeroporto della Nuova Zelanda, quindi molti viaggi iniziano o finiscono qui. Anche se hai una sola notte, c'è abbastanza da fare per riempire una giornata.",
    ],
    attractions: [
      { name: "Sky Tower", text: "Una torre alta in centro con viste sulla città e sui porti. Vai in una giornata limpida." },
      { name: "Maungawhau Mount Eden", text: "Una collina vulcanica che si può salire a piedi per una vasta vista sulla città. È veloce e gratuita." },
      { name: "Isola di Waiheke", text: "Un breve viaggio in traghetto dalla città, nota per vigneti e spiagge. Va bene per una gita in giornata o per una notte." },
      { name: "Spiaggia di Piha", text: "Una spiaggia di sabbia nera da surf sulla costa occidentale. Fai il bagno solo nell'area segnalata dalle bandiere, perché le onde sono forti." },
      { name: "Auckland War Memorial Museum", text: "Un grande museo nell'Auckland Domain con collezioni maori e del Pacifico. È una buona scelta per una giornata di pioggia." },
    ],
    bestTime: [
      "Le stagioni sono invertite rispetto all'Europa e al Nord America. L'estate (da dicembre a febbraio) è calda e umida, e va bene per spiagge, vela e gite alle isole. L'autunno (da marzo a maggio) è più mite, con meno folla dopo le vacanze scolastiche.",
      "L'estate è la stagione popolare, quindi voli e hotel costano di più allora, soprattutto intorno a Natale e a gennaio. L'inverno (da giugno ad agosto) è più fresco e piovoso, quindi è un buon periodo per musei, cibo e vino. Gli acquazzoni possono arrivare in qualsiasi periodo dell'anno.",
    ],
    tips: [
      "Porta una giacca leggera antipioggia in ogni stagione.",
      "Prenota in anticipo i traghetti per Waiheke e gli hotel in estate.",
      "Confronta i voli per date in autunno o in primavera, che spesso costano meno di gennaio.",
      "Controlla le regole NZeTA per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Auckland?", a: "Circa da dicembre ad aprile per il clima caldo e le spiagge. Le fonti dicono che qualsiasi stagione può andare bene se la pianifichi." },
      { q: "A Auckland piove spesso?", a: "Gli acquazzoni sono comuni tutto l'anno e il tempo può cambiare in fretta. Prevedi un'alternativa al chiuso per ogni giornata all'aperto." },
      { q: "Quanti giorni servono per visitare Auckland?", a: "Due o tre giorni bastano per la città, una passeggiata su un vulcano e una giornata a Waiheke." },
    ],
    details: {
      gettingAround: [
        "Le guide non concordano sull'autobus dell'aeroporto. Due fonti del 2026 dicono che l'espresso SkyBus non circola più ed è stato sostituito da SkyDrive a circa 20 dollari neozelandesi, con circa 35 minuti fino alla città, mentre articoli più vecchi citano ancora lo SkyBus. Controlla quale servizio è attivo prima di organizzarti.",
        "L'opzione più economica è l'autobus AirportLink fino alla stazione di Puhinui, poi il treno fino in città. Una fonte indica una tariffa di 6,50 dollari per 3 zone con una carta AT HOP o una carta contactless. Il rideshare è indicato a circa 45-70 dollari fino al CBD.",
        "Autobus, treni e traghetti del porto interno accettano carte contactless o una carta AT HOP, che costa 5 dollari. Il traghetto per l'isola di Waiheke non ha sconti con AT HOP.",
      ],
      whereToStay: [
        { area: "CBD e Viaduct", text: "Centrali per il terminal dei traghetti, Queen Street e la Sky Tower." },
        { area: "Ponsonby", text: "Un quartiere popolare per caffè e ristoranti, a breve distanza in autobus dal centro." },
        { area: "Parnell", text: "Una zona verde vicino al museo e al Domain, con un'atmosfera più calma." },
        { area: "Vicino all'aeroporto", text: "Da valutare per un volo molto presto o un arrivo tardi." },
      ],
      costs: [
        "La maggior parte dei visitatori dei paesi senza visto ha bisogno di un NZeTA, che una fonte indica a 17 dollari tramite l'app o 23 online. Dall'ottobre 2024 si applica anche una tassa turistica di 100 dollari neozelandesi, quindi i costi di ingresso combinati sono circa 117-123 dollari.",
        "Una guida del 2026 indica per chi viaggia con poco budget circa 135 dollari al giorno e per la fascia media circa 450. Un'altra indica una giornata tipica a circa 170 dollari. Mangiare fuori a ogni pasto è il modo più rapido per spendere troppo.",
      ],
      extraFaq: [
        { q: "Serve un NZeTA per Auckland?", a: "La maggior parte dei viaggiatori senza visto ne ha bisogno. È una breve autorizzazione di viaggio elettronica, richiesta prima di volare e pagata insieme alla tassa turistica. Controlla il sito ufficiale dell'immigrazione neozelandese per il tuo passaporto." },
        { q: "Lo SkyBus circola ancora all'aeroporto di Auckland?", a: "Le fonti non concordano, e due guide del 2026 dicono che si è fermato ed è stato sostituito da SkyDrive. Controlla il sito dell'aeroporto per il servizio attuale prima di contarci." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "queenstown",
    itSlug: "queenstown",
    name: "Queenstown",
    country: "Nuova Zelanda",
    tagline: "Laghi, montagne e sci, affollata in inverno e in estate",
    title: "Guida di viaggio a Queenstown: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Queenstown: laghi, sci, Milford Sound, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Queenstown è una piccola città su un lago, con montagne tutto intorno. È nota per le attività d'avventura, le piste da sci, il vino e le passeggiate.",
      "Ha due stagioni affollate, estate e inverno, quindi i mesi tranquilli nel mezzo possono offrire un rapporto qualità prezzo molto migliore.",
    ],
    attractions: [
      { name: "Lago Wakatipu e il lungolago", text: "Il lago è il cuore della città. Passeggia sul lungolago, fai una crociera o rilassati nei Queenstown Gardens." },
      { name: "Piste da sci", text: "Coronet Peak, The Remarkables, Cardrona e Treble Cone sono le principali aree sciistiche. Controlla le date di apertura, che cambiano ogni anno." },
      { name: "Ben Lomond e la gondola Skyline", text: "Prendi la gondola per le viste, oppure sali a piedi sul Ben Lomond quando la neve è sparita. Controlla le condizioni prima di una lunga camminata." },
      { name: "Arrowtown", text: "Un'antica città di cercatori d'oro vicino a Queenstown. È particolarmente popolare in autunno, quando gli alberi cambiano colore." },
      { name: "Cantine della Gibbston Valley", text: "Una zona del vino nota per il Pinot Nero, a breve distanza in auto dalla città. I tour sono facili da prenotare se non vuoi guidare." },
    ],
    bestTime: [
      "Le stagioni sono invertite rispetto all'emisfero nord. L'inverno (da giugno ad agosto) è la stagione dello sci, con la neve migliore intorno a luglio e agosto. L'estate (da dicembre a febbraio) ha giornate lunghe e calde per camminare, andare in bicicletta e godersi il lago.",
      "Le settimane più affollate sono quelle tra Natale e Capodanno e le vacanze scolastiche di luglio. Primavera e autunno sono più tranquilli, e alcune fonti indicano ottobre e novembre come buoni per le offerte dopo la fine della stagione dello sci. Il tempo in montagna cambia in fretta, quindi controlla le condizioni prima di uscire.",
    ],
    tips: [
      "Prenota gli hotel con grande anticipo per luglio e per le settimane tra Natale e Capodanno.",
      "Vestiti a strati, anche in estate, perché il tempo in montagna cambia in fretta.",
      "Milford Sound è una lunga gita in giornata. Prenota presto e controlla le notizie su strade e meteo.",
      "Controlla le regole NZeTA per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Quando c'è la stagione dello sci a Queenstown?", a: "Circa da metà giugno a inizio ottobre, con la neve migliore a luglio e agosto. Le date esatte differiscono per area sciistica e per anno." },
      { q: "Quando costa meno Queenstown?", a: "Di solito nei mesi più tranquilli di primavera e autunno, come ottobre e novembre. Inverno ed estate sono le stagioni affollate." },
      { q: "Vale la pena visitare Queenstown d'estate?", a: "Sì. L'estate ha giornate lunghe e clima caldo per laghi, passeggiate e biciclette." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Queenstown è a Frankton, a circa 8 km dal centro. L'autobus Orbus linea 1 collega l'aeroporto, lo snodo di Frankton e la città. Con una Bee Card la tariffa è di circa 2-2,50 dollari neozelandesi, mentre la tariffa in contanti dall'aeroporto è di circa 10. Un taxi o Uber è indicato a circa 40-60 dollari.",
        "Una Bee Card costa circa 5 dollari e funziona su altre reti di autobus neozelandesi. Una guida dice che spesso si ripaga con un solo viaggio di andata e ritorno.",
        "Milford Sound è una lunga gita in giornata. Il pullman e la crociera RealNZ richiedono circa 5 ore per tratta in pullman più una crociera di 1,5-2 ore, con partenze dalle 6:45 circa. Alcuni visitatori noleggiano un'auto per Glenorchy e le valli intorno.",
      ],
      whereToStay: [
        { area: "Centro città", text: "A piedi da ristoranti, lago e punti di ritiro dei tour, con più scelta e i prezzi più alti." },
        { area: "Frankton", text: "Vicina all'aeroporto e allo snodo degli autobus, con un'atmosfera più tranquilla." },
        { area: "Arrowtown", text: "Un villaggio storico fuori città, tranquillo ma serve un autobus o un'auto." },
        { area: "Glenorchy", text: "Un piccolo insediamento in fondo al lago, per paesaggi ed escursioni, con servizi limitati." },
      ],
      costs: [
        "Queenstown è cara. Una guida del 2026 indica un budget giornaliero da circa 116 dollari neozelandesi per chi viaggia con poco budget fino a oltre 1.200 per il lusso, a seconda di quante attività prenoti.",
        "La gita in giornata a Milford Sound da Queenstown parte da circa 292 dollari con RealNZ, e un'altra guida dice che le gite economiche costano circa 200-280 dollari.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Queenstown al centro?", a: "Prendi l'autobus Orbus linea 1 per l'opzione più economica con una Bee Card, oppure un taxi o Uber per una corsa da porta a porta. L'aeroporto è a circa 8 km dalla città." },
        { q: "Milford Sound vale la pena come gita in giornata da Queenstown?", a: "Le guide dicono di sì, anche con la pioggia, ma è una giornata molto lunga con diverse ore di pullman per tratta. Molti visitatori si fermano a Te Anau oppure tornano con un volo panoramico." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "mexico-city",
    itSlug: "citta-del-messico",
    name: "Città del Messico",
    country: "Messico",
    tagline: "Musei, siti antichi e ottimo cibo, meglio in primavera e in autunno",
    title: "Guida di viaggio a Città del Messico: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Città del Messico: musei, Teotihuacan, cibo, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Città del Messico è una delle città più grandi del mondo, con un centro storico, grandi parchi, musei importanti e una famosa scena gastronomica. È costruita sull'antica capitale azteca, e quella storia si vede ancora oggi in città.",
      "La città sta in alto, a più di 2.000 metri sul livello del mare. Alcuni visitatori si sentono stanchi o con il fiato corto il primo giorno, quindi all'inizio vai con calma.",
    ],
    attractions: [
      { name: "Zócalo e il centro storico", text: "L'enorme piazza principale è circondata dalla cattedrale e dal Palazzo Nazionale. Vicino c'è il Templo Mayor, i resti di un tempio azteco." },
      { name: "Parco di Chapultepec", text: "Un grande parco verde con un castello sulla collina e diversi musei importanti, tra cui il Museo Nazionale di Antropologia." },
      { name: "Coyoacán", text: "Un quartiere tranquillo e verde con un mercato, piazze e caffè. Qui c'è anche il Museo Frida Kahlo, quindi prenota i biglietti in anticipo." },
      { name: "Xochimilco", text: "Barche colorate su antichi canali. Concorda prezzo e durata prima di salire a bordo." },
      { name: "Teotihuacan", text: "Piramidi antiche giganti fuori città, raggiungibili con una gita di mezza giornata o di un giorno intero. Vai presto per evitare la folla e il caldo." },
    ],
    bestTime: [
      "Molte guide indicano marzo-maggio come il periodo più piacevole, con tempo asciutto e giornate calde. Anche da settembre a novembre è popolare, e a novembre ci sono le celebrazioni del Giorno dei Morti, con altari e fiori in tutta la città.",
      "La stagione delle piogge va circa da giugno a inizio settembre, con acquazzoni spesso nel pomeriggio. L'estate e il periodo da dicembre a febbraio sono spesso più economici, e i mesi invernali sono i più freschi e asciutti. La primavera e il periodo del Giorno dei Morti sono di solito i più affollati.",
    ],
    tips: [
      "Il primo giorno vai con calma per via dell'altitudine e bevi molta acqua.",
      "Nella stagione delle piogge programma i luoghi all'aperto al mattino.",
      "Molti ristoranti chiudono per le pause di Natale e Capodanno, quindi controlla prima.",
      "Prenota presto i musei più richiesti e le gite per il Giorno dei Morti.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Città del Messico?", a: "Circa da marzo a maggio per il tempo asciutto, e ottobre e novembre per la cultura e il Giorno dei Morti. Aspettati più folla in quei periodi." },
      { q: "A Città del Messico fa freddo in inverno?", a: "Le giornate sono di solito miti, ma mattine e sere possono essere fresche. Porta uno strato caldo per il periodo da dicembre a febbraio." },
      { q: "Città del Messico costa meno nella stagione delle piogge?", a: "Alcuni hotel offrono prezzi più bassi da giugno ad agosto, e anche il periodo da dicembre a febbraio è spesso più economico." },
    ],
    details: {
      gettingAround: [
        "Uber è l'opzione semplice dall'aeroporto. Una guida indica 250-400 pesos (circa 15-24 dollari americani) dall'aeroporto a Roma o Condesa a seconda del traffico, e un autore di Lonely Planet ha pagato 199 pesos a tarda notte. I taxi autorizzati dell'aeroporto costano un po' di più. Evita i taxi senza segni distintivi.",
        "La metropolitana costa 5 pesos a corsa e il Metrobus 6 pesos, quindi una giornata di trasporti pubblici costa solo pochi pesos. Entrambi richiedono una carta, e la metropolitana è affollata nelle ore di punta se hai i bagagli.",
        "A Roma e Condesa si può camminare, con Uber per le tratte più lunghe. Il Centro Histórico si gira a piedi e con la metropolitana.",
      ],
      whereToStay: [
        { area: "Roma Norte", text: "Molti caffè e ristoranti e comode passeggiate serali, una base popolare per la prima volta." },
        { area: "Condesa", text: "Più verde e più tranquilla, accanto a Roma." },
        { area: "Centro Histórico", text: "Vicino allo Zócalo e ai luoghi storici, ideale per camminare e per la metropolitana." },
        { area: "Polanco", text: "Una zona di livello alto con grandi hotel e musei, dove la maggior parte delle persone usa Uber." },
        { area: "Coyoacán", text: "Un quartiere meridionale più tranquillo, noto per la Casa Azul di Frida Kahlo." },
      ],
      costs: [
        "Una guida del 2026 indica per chi viaggia con poco budget circa 40-60 dollari americani al giorno con dormitori in ostello a 18-25 dollari, e per la fascia media circa 100-140 dollari. Un'altra indica il costo medio giornaliero in pesos a circa 1.050 per un viaggio economico.",
        "La città è a circa 2.240 metri, quindi il primo giorno vai piano. I biglietti della Casa Azul si esauriscono e si consiglia di prenotare con settimane di anticipo.",
      ],
      extraFaq: [
        { q: "L'altitudine è un problema a Città del Messico?", a: "La città è a circa 2.240 metri, e alcune persone si sentono stanche o con il fiato corto il primo giorno. Le guide suggeriscono un primo giorno lento, molta acqua e programmi leggeri finché non ti abitui." },
        { q: "Devo prenotare in anticipo la Casa Azul di Frida Kahlo?", a: "Sì. Le guide dicono che si esaurisce e consigliano di prenotare con settimane di anticipo, e una dice che non ci sono vendite alla porta." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "buenos-aires",
    itSlug: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    tagline: "Tango, caffè e grandi viali, splendida in primavera e in autunno",
    title: "Guida di viaggio a Buenos Aires: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Buenos Aires: tango, Recoleta, La Boca, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Buenos Aires è una grande città da girare a piedi, con ampi viali, vecchi caffè, teatri e librerie. Cibo, calcio e tango fanno parte della vita di tutti i giorni.",
      "Il clima è mite e la città funziona in qualsiasi stagione. Ricorda che le stagioni sono invertite: l'estate va da dicembre a febbraio e l'inverno da giugno ad agosto.",
    ],
    attractions: [
      { name: "Cimitero della Recoleta", text: "Un cimitero di tombe di famiglia riccamente decorate che sembra una piccola città di pietra. Si trova accanto al centro culturale della Recoleta e a una zona di caffè molto animata." },
      { name: "Teatro Colón", text: "Il famoso teatro dell'opera della città. Si possono vedere sia gli spettacoli sia visitarlo, quindi controlla cosa c'è per le tue date." },
      { name: "La Boca e Caminito", text: "Un museo di strada colorato a La Boca, vicino allo stadio del Boca Juniors. Resta sulle strade turistiche affollate e abbi le normali attenzioni di città con le tue cose." },
      { name: "El Ateneo Grand Splendid", text: "Una libreria dentro un ex teatro. È una tappa facile in una passeggiata per la città." },
      { name: "Tango e milonghe", text: "Puoi vedere uno spettacolo, seguire una lezione o andare in una milonga, una sala da ballo dove ballano gli abitanti del posto. Il campionato mondiale di tango si tiene ad agosto." },
    ],
    bestTime: [
      "Autunno (da marzo a maggio) e primavera (da settembre a novembre) sono le stagioni più confortevoli. L'autunno è mite, intorno ai 22 gradi secondo una guida, con meno folla. La primavera ha giornate più lunghe e alberi in fiore, tra cui i jacaranda a novembre. In queste stagioni la pioggia è di solito leggera, quindi porta un piccolo ombrello.",
      "L'estate (da dicembre a febbraio) è calda e umida con temporali, ed è l'alta stagione con prezzi più alti, soprattutto intorno a Natale e Capodanno. L'inverno (da giugno ad agosto) è fresco e spesso asciutto, ed è il periodo più tranquillo. Voli e camere possono costare meno allora, con un piccolo aumento a luglio e agosto.",
    ],
    tips: [
      "Confronta i voli per alcune date; una settimana prima o dopo può cambiare il prezzo.",
      "Porta degli strati per le sere d'inverno, che possono essere fredde.",
      "Prenota presto gli hotel per le settimane di Natale e Capodanno.",
      "Controlla le regole di ingresso e di visto per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Buenos Aires?", a: "Autunno (da marzo a maggio) e primavera (da settembre a novembre) sono i più confortevoli. L'ente del turismo descrive la città come una buona meta in qualsiasi periodo dell'anno." },
      { q: "A Buenos Aires fa freddo in inverno?", a: "È fresco più che gelido, circa da 7 a 16 gradi secondo una guida. Non nevica di solito, ma gli strati caldi aiutano la sera." },
      { q: "Quando costa meno andarci?", a: "L'inverno, da giugno ad agosto, è di solito il periodo più tranquillo ed economico. L'estate, soprattutto Natale e Capodanno, è il più caro." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto di Ezeiza dista poco più di 30 km dal centro. Un remis o Uber prenotato costa circa 25-30 dollari americani per Recoleta o Palermo in una guida, mentre un'altra dice che taxi e remis costano 40-50 dollari. La navetta Manuel Tienda León costa circa 15-20 dollari, e l'autobus urbano linea 8 è il più economico ma lento. L'Aeroparque dista solo circa 15 minuti dalla città.",
        "Una carta SUBE funziona su Subte, autobus e treni suburbani. La carta costa circa 1.500 pesos, e una carta registrata ha tariffe più basse. Da dicembre 2024 il Subte accetta anche Visa e Mastercard contactless, anche se gli autobus dipendono ancora dalla SUBE o da linee che accettano il contactless.",
        "Uber e Cabify funzionano, e molti visitatori li usano a tarda sera.",
      ],
      whereToStay: [
        { area: "Palermo", text: "Strade alberate, ristoranti, locali di birra artigianale e hotel boutique, con la linea D del Subte." },
        { area: "Recoleta", text: "Una zona elegante vicino al cimitero e ai musei, scelta comune per una prima visita." },
        { area: "San Telmo", text: "Vecchie strade acciottolate, tango e mercati, popolare tra chi viaggia con poco budget." },
        { area: "Microcentro", text: "Centrale per l'Obelisco e i trasporti, affollata di giorno e tranquilla di notte." },
      ],
      costs: [
        "Una guida del 2026 indica un budget giornaliero da circa 36 dollari americani per chi viaggia con poco budget fino a 540 per il lusso. I letti in dormitorio a Palermo o San Telmo costano circa 16-21 dollari.",
        "I turisti internazionali pagano il cimitero della Recoleta con carta a circa 15 dollari, e una visita guidata del Teatro Colón costa circa 26 dollari, secondo la stessa guida. I prezzi argentini cambiano in fretta, quindi controlla gli importi attuali in pesos.",
      ],
      extraFaq: [
        { q: "Serve una carta SUBE a Buenos Aires?", a: "Aiuta. Gli autobus la richiedono, e il Subte ora accetta anche le carte bancarie contactless. Una carta SUBE registrata ha tariffe più basse, il che conta in un soggiorno più lungo." },
        { q: "Come si va dall'aeroporto di Ezeiza alla città?", a: "In remis, taxi o Uber per il tragitto più semplice, oppure con la navetta Tienda León o con il lento autobus linea 8. L'aeroporto dista più di 30 km dal centro, quindi calcola circa 45 minuti." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "santiago",
    itSlug: "santiago-del-cile",
    name: "Santiago del Cile",
    country: "Cile",
    tagline: "Una città accanto alle Ande, con vino e neve vicini",
    title: "Guida di viaggio a Santiago del Cile: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Santiago del Cile: Ande, Valparaíso, vino, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Santiago è la capitale del Cile, in una valle con le Ande che si alzano dietro. Ha un centro storico, parchi sulle colline, quartieri vivaci e un facile accesso a montagne, zone del vino e costa.",
      "È una buona base per viaggi brevi. Le stagioni sono invertite rispetto all'emisfero nord, quindi l'estate va da dicembre a febbraio e l'inverno da giugno ad agosto.",
    ],
    attractions: [
      { name: "Plaza de Armas e La Moneda", text: "La piazza principale è il cuore della città dal 1541, con la cattedrale accanto. Il palazzo presidenziale, La Moneda, è raggiungibile a piedi." },
      { name: "Cerro San Cristóbal", text: "Il più grande spazio verde della città e il miglior punto di vista su Santiago. Una funicolare o una funivia sale in cima." },
      { name: "Lastarria e Bellavista", text: "Lastarria è nota per caffè e ristoranti. Bellavista è la zona della vita notturna e ha La Chascona, la casa del poeta Pablo Neruda." },
      { name: "Valparaíso", text: "A circa 1,5 ore di auto, questo porto sulle colline ha un centro storico patrimonio UNESCO, colline colorate e un'altra casa di Neruda, La Sebastiana." },
      { name: "Le Ande e le valli del vino", text: "Il Cajón del Maipo, a circa un'ora, è una zona di montagna per le passeggiate. Le cantine della Valle del Maipo sono a circa un'ora. Le stazioni sciistiche come Valle Nevado e Portillo aprono in inverno." },
    ],
    bestTime: [
      "La primavera (da settembre a novembre) e l'autunno (da marzo a maggio) sono in genere i mesi migliori, con temperature confortevoli. A marzo inizia la vendemmia nelle valli centrali, con feste del vino. A settembre molte attività chiudono per la settimana della festa nazionale.",
      "L'estate è calda, circa 27-29 gradi secondo una guida. Febbraio è il principale mese di vacanza in Cile, e alcuni abitanti lasciano la città a gennaio e febbraio. In generale da novembre a febbraio è il periodo più caro per viaggiare. L'inverno, da giugno ad agosto, è fresco ed è la stagione dello sci nelle montagne vicine. Luglio è affollato, e gli alloggi diventano più economici ad agosto, quando finiscono le vacanze scolastiche.",
    ],
    tips: [
      "Controlla le date intorno alle feste nazionali di settembre, quando molti posti chiudono.",
      "Prenota presto le gite per sciare e gli alloggi invernali, soprattutto per luglio.",
      "Fai una gita in giornata verso la costa o una valle del vino invece di cambiare hotel.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Santiago del Cile?", a: "Da settembre a novembre e da marzo a maggio sono i più confortevoli. L'estate è calda, e l'inverno è per sciare nelle vicinanze." },
      { q: "Quando c'è la stagione dello sci vicino a Santiago?", a: "Circa da giugno ad agosto. Le stazioni come Valle Nevado e Portillo sono a est della città." },
      { q: "Santiago costa meno in certi periodi?", a: "Le stagioni intermedie di solito vanno meglio per il budget. Da novembre a febbraio è il periodo più caro, e gli alloggi diventano più economici ad agosto, dopo le vacanze scolastiche." },
    ],
    details: {
      gettingAround: [
        "L'opzione più economica dall'aeroporto è un autobus Centropuerto o Turbus, circa 2.400 pesos cileni di sola andata, con partenze ogni 10-15 minuti. Le guide non concordano su dove termina, indicando Los Héroes o Pajaritos sulla linea 1 della metropolitana. L'autobus 555 per Pajaritos alla normale tariffa cittadina è un'altra via. Un taxi o Uber è indicato a circa 25 dollari americani.",
        "Serve una carta Bip!, che costa circa 1.550 pesos, per la metropolitana e gli autobus. Le tariffe della metropolitana sono circa 735-895 pesos a seconda dell'ora del giorno, e l'autobus ha una tariffa fissa di 795. Gli autobus non accettano contanti. Una guida dice che le carte contactless funzionano in metropolitana da febbraio 2026.",
        "Fai attenzione ai falsi tassisti all'aeroporto. Usa i banchi ufficiali o un'app.",
      ],
      whereToStay: [
        { area: "Providencia", text: "Sicura, da girare a piedi e ben collegata sulla linea 1 della metropolitana, con molti hotel di fascia media." },
        { area: "Lastarria", text: "Musei, caffè e una base orientata alla cultura vicino al centro." },
        { area: "Bellavista", text: "Vita notturna e street art ai piedi del Cerro San Cristóbal." },
        { area: "Las Condes", text: "Un quartiere d'affari con hotel più grandi e negozi." },
      ],
      costs: [
        "Una guida del 2026 indica budget giornalieri da circa 98 dollari americani per chi viaggia da solo con poco budget a 750 per il lusso. Le tariffe della metropolitana sono circa 1 dollaro e l'autobus dell'aeroporto circa 3 dollari.",
        "Valparaíso è una gita in giornata di circa 2 ore, con autobus dalla stazione Universidad de Santiago.",
      ],
      extraFaq: [
        { q: "Come si va dall'aeroporto di Santiago al centro?", a: "Prendi un autobus Centropuerto o Turbus fino alla metropolitana, oppure un taxi o Uber. L'aeroporto dista circa 15-20 km dal centro. Evita i tassisti non ufficiali." },
        { q: "Serve una carta Bip! a Santiago?", a: "Sì per gli autobus, perché non accettano contanti. Una carta Bip! funziona anche in metropolitana e costa circa 1.550 pesos. Caricala in qualsiasi stazione della metropolitana." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "rio-de-janeiro",
    itSlug: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brasile",
    tagline: "Spiagge, montagne e Carnevale, meglio in primavera e in autunno",
    title: "Guida di viaggio a Rio de Janeiro: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Rio de Janeiro: Cristo Redentore, Copacabana, Carnevale, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Rio de Janeiro mette la vita di una grande città accanto a spiagge urbane e ripide montagne verdi. Puoi fare il bagno al mattino, salire su una funivia nel pomeriggio e vedere il sole tramontare sull'acqua.",
      "Rio è nell'emisfero sud, quindi l'estate va da dicembre a febbraio. È anche il periodo più caldo, più affollato e più caro.",
    ],
    attractions: [
      { name: "Cristo Redentore", text: "La statua sta in cima al monte Corcovado e domina tutta la città. Vai in una giornata limpida, perché le nuvole possono nascondere la vista. Controlla le opzioni attuali di biglietti e accesso prima di andare." },
      { name: "Pão de Açúcar", text: "Una funivia ti porta su per le viste su spiagge, città e mare. Molti ci vanno a fine giornata per vedere la luce cambiare." },
      { name: "Copacabana", text: "Una lunga spiaggia urbana con un ampio lungomare. È il luogo dei grandi eventi pubblici, compresi i fuochi di Capodanno sul mare." },
      { name: "Ipanema", text: "Una spiaggia nota per l'atmosfera rilassata. La gente gioca a calcio sulla spiaggia e si raduna per guardare il tramonto." },
      { name: "Isole e città vicine", text: "Paraty, Ilha Grande e Petrópolis sono le scelte abituali per una gita in giornata o un breve soggiorno fuori città." },
    ],
    bestTime: [
      "La primavera (da settembre a novembre) e l'autunno (aprile e maggio) sono buoni periodi per la maggior parte delle persone. Le giornate sono più miti, la folla è minore e i prezzi sono più bassi. Da giugno ad agosto è la parte più asciutta dell'anno, ma può fare fresco e il mare è spesso troppo mosso o freddo per nuotare. Novembre tende a riportare la pioggia.",
      "Da dicembre a febbraio è il periodo più affollato e caro, con caldo, umidità e forti acquazzoni pomeridiani. Il Carnevale è di solito a febbraio, a volte a inizio marzo, e le date cambiano ogni anno. Anche la settimana di Pasqua è affollata. Andarci una o due settimane prima o dopo il Carnevale può costare meno. Le fonti differiscono su quali siano esattamente i mesi intermedi più economici, quindi confronta le date quando cerchi.",
    ],
    tips: [
      "Prenota voli e hotel con molti mesi di anticipo per il Carnevale e per Capodanno.",
      "In estate programma le visite al mattino e lascia flessibili i pomeriggi per la pioggia.",
      "Controlla il meteo prima di salire sul Corcovado o sul Pão de Açúcar, perché le nuvole rovinano la vista.",
      "Controlla le regole sul visto per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Rio de Janeiro?", a: "La primavera (da settembre a novembre) e l'autunno (aprile e maggio) sono scelte popolari: clima più mite, meno gente e prezzi più bassi. Chi ama la spiaggia spesso preferisce i mesi più caldi nonostante la folla." },
      { q: "Quando c'è il Carnevale a Rio?", a: "Di solito a febbraio, e a volte a inizio marzo. Le date seguono il calendario religioso, quindi controllale per il tuo anno. Le feste di strada iniziano molto prima dei giorni delle grandi sfilate." },
      { q: "Rio costa meno fuori dall'estate?", a: "In generale sì. Da dicembre a febbraio e durante il Carnevale è il periodo più caro. I mesi intermedi come aprile, maggio e ottobre di solito costano meno, tranne la settimana di Pasqua." },
      { q: "Quanti giorni servono per visitare Rio?", a: "Da tre a quattro giorni bastano per i luoghi principali e una giornata di spiaggia. Aggiungi tempo per le gite in giornata a Paraty o Ilha Grande." },
    ],
    details: {
      gettingAround: [
        "Dall'aeroporto di Galeão (GIG) Uber per Copacabana è indicato a circa 10-18 dollari americani (circa 58-70 reais), con 30-60 minuti di viaggio. I radiotaxi a tariffa fissa costano di più, a circa 104 reais in una guida. L'opzione BRT più metropolitana è economica ma scomoda con i bagagli.",
        "La metropolitana ha due linee principali che non raggiungono tutte le zone turistiche. Un gruppo che divide un Uber spesso paga meno a testa che con la metropolitana per attraversare la città. Una guida consiglia Uber invece dei taxi di strada la sera nella Zona Sud.",
        "Il Cristo Redentore si raggiunge con il treno del Corcovado o con un furgone ufficiale. Prenota online, perché una guida dice che nei fine settimana le code senza prenotazione possono arrivare a tre ore.",
      ],
      whereToStay: [
        { area: "Copacabana", text: "Una lunga spiaggia con accesso alla metropolitana, buon rapporto qualità prezzo e il Pão de Açúcar vicino." },
        { area: "Ipanema e Leblon", text: "Zone eleganti sul mare con ristoranti e negozi, a prezzi più alti." },
        { area: "Santa Teresa", text: "Un quartiere artistico sulla collina con un tram storico, tranquillo di notte." },
        { area: "Botafogo", text: "Un quartiere locale vicino alla baia con accesso alla metropolitana e una scena gastronomica in crescita." },
      ],
      costs: [
        "Le guide indicano per chi viaggia con poco budget circa 40-60 dollari americani al giorno e per la fascia media circa 100-150. I buffet a peso sono un pranzo economico, e le spiagge sono gratuite.",
        "I biglietti per il Cristo Redentore sono indicati a circa 27 dollari in una guida e a più di 186 reais in un'altra, quindi controlla il prezzo attuale quando prenoti.",
      ],
      extraFaq: [
        { q: "Rio è sicura per i turisti?", a: "I quartieri della Zona Sud di Copacabana, Ipanema e Botafogo sono descritti come sicuri per i visitatori con le normali attenzioni. Le guide consigliano Uber invece dei taxi di strada la sera e di tenere d'occhio le proprie cose." },
        { q: "Come si va dall'aeroporto di Rio a Copacabana?", a: "Uber da Galeão è la scelta comune, a circa 10-18 dollari. I radiotaxi costano di più, e il BRT con la metropolitana è economico ma difficile con i bagagli." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "cartagena",
    itSlug: "cartagena",
    name: "Cartagena",
    country: "Colombia",
    tagline: "Una città vecchia fortificata sui Caraibi, più asciutta da dicembre a marzo",
    title: "Guida di viaggio a Cartagena in Colombia: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Cartagena in Colombia: città vecchia, isole del Rosario, quando andare e una ricerca di voli e hotel. Guida pratica dall'Italia.",
    intro: [
      "Cartagena è una città portuale colombiana sulla costa caraibica. La città vecchia è circondata da spesse mura di pietra, con strade coloniali colorate, piazze e chiese all'interno.",
      "Fa caldo tutto l'anno. La scelta principale è tra i mesi più asciutti e affollati e quelli più piovosi e più economici.",
    ],
    attractions: [
      { name: "La città fortificata", text: "Le antiche mura si estendono per circa 4 km, e la città vecchia all'interno è stata inserita nella lista del patrimonio mondiale UNESCO nel 1987. Percorrila al mattino, quando fa più fresco." },
      { name: "Castillo San Felipe de Barajas", text: "Una fortezza in cima a una collina iniziata nel 1656, con tunnel e punti panoramici. È un buon posto per vedere la città intorno al tramonto." },
      { name: "Getsemaní", text: "Un quartiere noto per i murales di strada, le piazze vivaci e i bar serali." },
      { name: "Isole del Rosario", text: "Un parco nazionale a circa 45 km dalla città, raggiungibile solo in barca. Le gite in giornata offrono barriere coralline, acqua limpida e spiagge." },
      { name: "Convento de la Popa", text: "Un convento in cima alla collina più alta della città con viste sulla baia. Una guida consiglia di andarci in taxi o con un tour, non a piedi, per via di rapine segnalate." },
    ],
    bestTime: [
      "La costa ha una stagione secca più netta del resto della Colombia. Le guide indicano circa da dicembre a marzo come il periodo migliore, con luglio e agosto anch'essi piacevoli. Le giornate sono calde e il mare è calmo per le gite in barca.",
      "Da dicembre a febbraio è l'alta stagione, e anche la Settimana Santa prima di Pasqua è affollata, quindi i prezzi sono più alti. I mesi piovosi vanno circa da aprile a giugno e da settembre a novembre, con settembre e ottobre spesso i più umidi. Questi mesi sono di solito più economici e tranquilli, e la pioggia tende ad arrivare con acquazzoni brevi e intensi, spesso nel tardo pomeriggio. Le massime restano intorno ai 30 gradi tutto l'anno.",
    ],
    tips: [
      "Cammina la mattina presto o la sera e riposa nelle ore centrali.",
      "Prenota presto gli hotel per dicembre, gennaio e la Settimana Santa.",
      "Usa un taxi o un tour guidato per i luoghi in cima alle colline.",
      "Controlla le regole di ingresso per il tuo passaporto prima di prenotare.",
    ],
    faq: [
      { q: "Qual è il periodo migliore per visitare Cartagena?", a: "Circa da dicembre a marzo è il periodo più asciutto. Luglio e agosto sono piacevoli per molti visitatori." },
      { q: "Cartagena costa meno nella stagione delle piogge?", a: "Di solito sì. I mesi più umidi, soprattutto settembre e ottobre, tendono ad avere le tariffe alberghiere più basse. Aspettati acquazzoni brevi e intensi." },
      { q: "Quanti giorni servono per visitare Cartagena?", a: "Da due a tre giorni bastano per la città vecchia e la fortezza. Aggiungi un giorno per una gita in barca alle isole del Rosario." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto (CTG) dista solo circa 6 km e 15 minuti dalla città vecchia. Non c'è un autobus dell'aeroporto. I taxi hanno tariffe fisse, e un chiosco vicino alla dogana stampa la tariffa corretta. Le guide indicano importi diversi: circa 16.000-20.000 pesos colombiani in una, 17.800 in un'altra e 25.000-45.000 in una terza, quindi controlla il chiosco.",
        "La città vecchia e Getsemaní si esplorano meglio a piedi. I taxi in città raramente hanno il tassametro, quindi concorda prima la tariffa. Le corse a tarda sera costano di più.",
        "L'autobus Transcaribe costa circa 2.300 pesos a corsa ed è molto più economico di un taxi da Bocagrande al centro.",
      ],
      whereToStay: [
        { area: "Città vecchia (Centro Histórico)", text: "Strade coloniali, hotel boutique e cene romantiche dentro le mura della città." },
        { area: "Getsemaní", text: "Street art, bar locali e soggiorni più economici, popolare tra chi viaggia con poco budget." },
        { area: "Bocagrande", text: "Hotel a torre e una spiaggia cittadina, popolare tra le famiglie." },
        { area: "San Diego", text: "Un quartiere coloniale più tranquillo appena a nord del centro, dentro le mura." },
      ],
      costs: [
        "Una guida dice che si può cavarsela con 30-40 dollari americani al giorno con un dormitorio a Getsemaní intorno a 10, e 60-70 al giorno con un ostello più bello. Un'altra indica la spesa di fascia media a 65-80 dollari al giorno, alloggio escluso.",
        "Le gite in barca alle isole del Rosario, a circa 45 minuti, sono l'extra più grande. Le guide dicono di non prenotare una gita in barca ogni giorno.",
      ],
      extraFaq: [
        { q: "Quanto fa caldo a Cartagena?", a: "Circa 30 gradi o più tutto l'anno, quindi aria condizionata e una piscina contano quando scegli un hotel." },
        { q: "Qual è il mese più asciutto a Cartagena?", a: "Febbraio o inizio marzo è descritto come il più asciutto, con meno folla rispetto al picco delle vacanze di dicembre." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "cusco",
    itSlug: "cusco-machu-picchu",
    name: "Cusco e Machu Picchu",
    country: "Perù",
    tagline: "Storia inca sulle Ande, più asciutta da maggio a ottobre",
    title: "Guida di viaggio a Cusco e Machu Picchu: cosa vedere, quando andare, voli e hotel",
    description: "Organizza un viaggio a Cusco e Machu Picchu: biglietti, altitudine, quando andare e una ricerca di voli e hotel. Guida pratica per chi parte dall'Italia.",
    intro: [
      "Cusco era una capitale inca ed è la base abituale per Machu Picchu. Le sue vecchie strade, i mercati e le valli vicine meritano tempo di per sé, non solo come tappa del viaggio.",
      "Due cose richiedono organizzazione: i biglietti e l'altitudine. L'ingresso a Machu Picchu è limitato e legato a un biglietto, e Cusco è abbastanza alta perché molti visitatori la sentano.",
    ],
    attractions: [
      { name: "Machu Picchu", text: "La cittadella inca sta a circa 2.430 metri, più in basso di Cusco. L'ingresso richiede un biglietto per un circuito stabilito, comprato dal portale ufficiale del Ministero della Cultura, tuboleto.cultura.pe." },
      { name: "Centro storico di Cusco", text: "Passeggia per le vecchie strade e piazze dell'ex capitale inca. Vai con calma i primi giorni per via dell'altitudine." },
      { name: "Valle Sacra", text: "Città come Pisac, Urubamba e Ollantaytambo si trovano più in basso di Cusco. Molti visitatori ci soggiornano per primi per abituarsi all'altitudine." },
      { name: "Cammino Inca", text: "Il classico trekking di più giorni raggiunge circa 4.200 metri nel punto più alto e richiede una guida. Chiude a febbraio." },
      { name: "Inti Raymi", text: "Una festa inca che si tiene il 24 giugno. Se pensi di andarci, prenota il viaggio con largo anticipo." },
    ],
    bestTime: [
      "La stagione secca va circa da maggio a ottobre, con giornate di sole e cielo limpido. È anche l'alta stagione, quindi prenota presto voli, hotel e biglietti di Machu Picchu. Le notti sono fredde in quota, soprattutto da maggio a settembre. Alcune guide indicano la stagione secca da aprile a settembre, quindi considera i margini come approssimativi.",
      "La stagione umida va circa da novembre ad aprile, con gennaio e febbraio i più piovosi. È più verde e tranquilla, e voli e hotel costano di solito meno. Il Cammino Inca chiude a febbraio, anche se Machu Picchu resta aperto. Il numero di visitatori sale di nuovo verso Pasqua.",
    ],
    tips: [
      "Machu Picchu ha limiti giornalieri di visitatori: 4.500 nella maggior parte dei giorni e fino a 5.600 in certe date di punta nel 2026. Prenota in anticipo, soprattutto da giugno a ottobre.",
      "Il tuo biglietto è per un circuito e un orario di ingresso. Arriva in orario, perché l'ingresso in ritardo può essere rifiutato.",
      "Cusco è a circa 3.400 metri. Prevedi due o tre giorni lì o nella Valle Sacra prima di camminate impegnative, bevi acqua e vai piano con l'alcol.",
      "Regole e prezzi cambiano. Controlla il sito ufficiale poco prima del viaggio, anche per sapere se serve una guida.",
    ],
    faq: [
      { q: "Quanto è alta Cusco?", a: "Circa 3.400 metri sul livello del mare. Machu Picchu è più in basso, a circa 2.430 metri. I sintomi del mal di montagna includono mal di testa, stanchezza e vertigini. Chiedi consiglio a un medico se hai problemi di cuore o di polmoni." },
      { q: "Serve un biglietto per Machu Picchu?", a: "Sì. L'ingresso è limitato ogni giorno e i biglietti coprono un circuito e un orario di ingresso specifici. Il venditore ufficiale è il portale del Ministero della Cultura, tuboleto.cultura.pe." },
      { q: "Qual è il periodo migliore per andarci?", a: "Circa da maggio a ottobre è la stagione secca. È il clima migliore e il periodo più affollato. Da novembre ad aprile è più piovoso, tranquillo ed economico." },
      { q: "Quanti giorni servono?", a: "Prevedi circa tre giorni a Cusco e nella valle per abituarti, più un giorno per Machu Picchu. Un viaggio più lungo permette la Valle Sacra e le gite in giornata." },
    ],
    details: {
      gettingAround: [
        "L'aeroporto sta a circa 3.310 metri, quindi non provare a camminare con i bagagli. Una guida indica 15-30 soles peruviani con un'app o un taxi di strada fino al centro e 40-70 soles a un banco ufficiale dell'aeroporto. I taxi non hanno tassametro, quindi concorda prima il prezzo.",
        "Il centro storico si gira a piedi, ma San Blas è in salita e faticosa in altitudine. Alcuni autisti esitano a entrare nei vicoli più ripidi con la pioggia o di notte.",
        "Per Machu Picchu serve il passaporto per comprare il biglietto, e i treni partono per lo più da Ollantaytambo. Una fonte indica 50-100 dollari americani di sola andata per il treno, a seconda della classe e della stagione.",
      ],
      whereToStay: [
        { area: "Centro storico", text: "Vicino alla Plaza de Armas, ai ristoranti e agli uffici dei tour, e la base più comoda." },
        { area: "San Blas", text: "Un quartiere bohémien sulla collina con gallerie e caffè, più tranquillo di notte ma ripido." },
        { area: "Wanchaq e Avenida El Sol", text: "Hotel di fascia media vicino ai terminal degli autobus e al viale principale." },
        { area: "San Cristóbal", text: "Una zona tranquilla sulla collina sopra la Plaza de Armas, con viste e una salita ripida." },
      ],
      costs: [
        "Una guida indica 40-60 dollari americani al giorno per i backpacker e 80-120 per chi viaggia in fascia media. Il Boleto Turístico costa 130 soles e non copre Machu Picchu né le saline di Maras.",
        "Una guida dice che Machu Picchu ammette circa 4.044 visitatori al giorno in fasce orarie, quindi prenota presto. Treno e ingresso rendono il viaggio la voce di costo più grande.",
      ],
      extraFaq: [
        { q: "Quanti giorni passare a Cusco prima di Machu Picchu?", a: "Le guide suggeriscono due giorni o più a Cusco per abituarsi all'altitudine prima di andare nella Valle Sacra o a Machu Picchu, tenendo leggeri i primi giorni." },
        { q: "Il Boleto Turístico include Machu Picchu?", a: "No. Copre altri siti nella zona di Cusco, costa 130 soles e non include Machu Picchu né le saline di Maras, che richiedono biglietti separati." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "antarctic-peninsula",
    itSlug: "penisola-antartica",
    name: "Penisola Antartica",
    at: "alla",
    country: "Antartide",
    tagline: "Ghiaccio, pinguini e balene, aperta ai visitatori da novembre a marzo",
    title: "Guida di viaggio alla Penisola Antartica: cosa vedere, quando andare e come arrivare",
    description: "Organizza un viaggio in Antartide: crociere da Ushuaia, pinguini, balene, quando andare e come arrivare. Guida pratica per chi parte dall'Italia.",
    gatewayNote: "Non ci sono voli di linea per l'Antartide. I viaggi sono crociere (o pacchetti fly-cruise), e la maggior parte parte da Ushuaia, in Argentina, quindi la ricerca in questa pagina serve per arrivare a Ushuaia.",
    intro: [
      "La Penisola Antartica è il lungo braccio di terra che punta verso il Sud America. È la parte dell'Antartide che la maggior parte dei visitatori vede, perché è la più vicina. La costa ha ghiacciai, iceberg, montagne ripide e grandi colonie di pinguini.",
      "Non si può arrivare con una normale compagnia aerea. La maggior parte delle persone si imbarca su una crociera di spedizione da Ushuaia, che attraversa il Passaggio di Drake in circa due giorni per tratta. Alcuni operatori vendono viaggi fly-cruise che partono in volo da Punta Arenas, in Cile, verso l'isola King George e saltano una traversata. Scegli un operatore che appartenga all'IAATO, l'associazione di settore che fissa le regole per i visitatori.",
    ],
    attractions: [
      { name: "Uscite in Zodiac tra gli iceberg", text: "Piccoli gommoni ti portano vicino a ghiacciai e ghiaccio galleggiante. È il modo migliore per vedere le dimensioni e il colore del ghiaccio." },
      { name: "Colonie di pinguini", text: "Pinguini di Papua, sottogola e di Adelia nidificano lungo la costa. I visitatori devono restare ad almeno 5 metri dagli uccelli a terra e lasciar passare prima i pinguini." },
      { name: "Avvistamento di balene", text: "Megattere e balenottere minke si nutrono nei canali nella parte finale della stagione. Molte navi vedono anche foche sul ghiaccio." },
      { name: "Paradise Bay e Port Lockroy", text: "Due delle tappe più visitate della Penisola. Una è nota per i ghiacciai, l'altra per la vecchia base britannica e l'ufficio postale." },
      { name: "Kayak e campeggio", text: "Alcuni operatori offrono pagaiate o una notte sulla neve a pagamento. I posti sono limitati, quindi chiedi al momento della prenotazione." },
    ],
    bestTime: [
      "I visitatori arrivano solo nell'estate antartica, circa da novembre a marzo. In inverno il mare gela e le giornate sono cortissime, quindi le navi non partono.",
      "Le fonti concordano sullo schema generale. Novembre è la parte più fredda e nevosa della stagione, i pinguini iniziano a nidificare e il ghiaccio appare al massimo del suo effetto. Dicembre e gennaio hanno una luce quasi senza fine e i piccoli nascono, soprattutto da fine dicembre. Febbraio e marzo sono di solito i migliori per le balene, e i piccoli dei pinguini crescono in fretta. Le date esatte cambiano da un anno all'altro.",
    ],
    tips: [
      "Prenota presto. Le cabine sulle navi migliori si riempiono molti mesi prima, quindi un anno di anticipo è un consiglio comune.",
      "Controlla che l'operatore sia membro IAATO e chiedi cosa è incluso, per esempio stivali, giacche e sbarchi.",
      "Pensa di arrivare a Ushuaia uno o due giorni prima. Il maltempo o un volo perso non devono farti perdere la nave.",
      "Il Passaggio di Drake può essere agitato. Chiedi al tuo medico un consiglio contro il mal di mare.",
    ],
    faq: [
      { q: "Si può volare in Antartide?", a: "Non con una compagnia di linea. Ci sono pacchetti fly-cruise che volano da Punta Arenas, in Cile, all'isola King George, poi proseguono in nave. La maggior parte dei visitatori parte in nave da Ushuaia." },
      { q: "Quando c'è la stagione antartica?", a: "Circa da novembre a marzo. Alcuni operatori iniziano a fine ottobre, e la stagione finisce a marzo." },
      { q: "Quanto dura il Passaggio di Drake?", a: "Circa due giorni per tratta in nave, secondo gli operatori. Un fly-cruise evita una o entrambe le traversate." },
      { q: "Quale mese è il migliore?", a: "Dipende da cosa vuoi. Novembre è per ghiaccio e neve, dicembre e gennaio per i piccoli dei pinguini e le giornate lunghe, febbraio e marzo per le balene." },
    ],
    details: {
      gettingAround: [
        "Non ci sono voli commerciali per l'Antartide. La maggior parte dei visitatori parte in nave da Ushuaia, in Argentina, e attraversa il Passaggio di Drake, che richiede circa due giorni per tratta, e la traversata è inclusa nel prezzo della crociera. Un viaggio di esempio di 12 giorni indica Buenos Aires il giorno 1, il volo per Ushuaia e l'imbarco il giorno 2, due giorni di Drake, cinque giorni tra le isole Shetland Meridionali e la Penisola e due giorni di ritorno.",
        "I viaggi fly-cruise saltano una o entrambe le traversate del Drake. Un volo charter da Punta Arenas, in Cile, raggiunge l'isola King George in circa due ore, e lì si sale sulla nave. Questi viaggi sono più brevi, di solito da 8 a 10 giorni, e dipendono dalle finestre di bel tempo, quindi il volo può essere ritardato o cancellato.",
        "Una volta lì, ci si sposta con la nave e con i gommoni Zodiac. Il capo spedizione sceglie gli sbarchi ogni giorno in base a meteo e ghiaccio, quindi l'itinerario è un programma, non una promessa.",
      ],
      whereToStay: [
        { area: "Sulla nave", text: "Si dorme a bordo per tutto il viaggio. Gli annunci mostrano classi di cabina dalla interna e vista mare fino al balcone e alla suite, e i pasti sono inclusi." },
        { area: "Ushuaia", text: "Il principale porto di partenza. La maggior parte delle persone passa qui una notte prima dell'imbarco, perché un volo in ritardo può farti perdere la partenza." },
        { area: "Punta Arenas", text: "La base per i viaggi fly-cruise, da dove parte il volo charter per l'isola King George." },
        { area: "Buenos Aires", text: "Molti itinerari iniziano qui, con il volo per Ushuaia incluso nel pacchetto." },
      ],
      costs: [
        "L'Antartide è cara perché tutto è raggruppato in un unico viaggio. Gli annunci visti a fine 2026 vanno da circa 9.600 dollari americani a persona per una nave classica di 12 giorni a oltre 12.000 dollari per una cabina con vista mare di un fly-cruise di 8 giorni, con le cabine con balcone e le suite più care.",
        "Una guida del 2026 dice che volare sul Drake aggiunge circa 1.500-3.000 dollari a persona per il volo charter. Esistono sconti last minute per i posti invenduti entro circa 90 giorni dalla partenza, ma sono rari, e i voli per Ushuaia non diventano più economici di conseguenza.",
      ],
      extraFaq: [
        { q: "Posso volare in Antartide con una normale compagnia aerea?", a: "No. Non ci sono voli commerciali. L'opzione più vicina è un volo charter da Punta Arenas all'isola King George, di circa due ore, venduto come parte di un pacchetto fly-cruise." },
        { q: "Il Passaggio di Drake è incluso nel prezzo?", a: "Su una nave che parte da Ushuaia sì. La traversata fa parte del viaggio, quindi è già nel prezzo della crociera. I voli internazionali per Ushuaia o Buenos Aires di solito sono a parte." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "deception-island",
    itSlug: "deception-island-shetland-meridionali",
    name: "Deception Island",
    country: "Antartide",
    tagline: "Un vulcano allagato in cui si può entrare in nave, più le isole accanto alla Penisola",
    title: "Guida di viaggio a Deception Island e Shetland Meridionali: cosa vedere, quando andare e come arrivare",
    description: "Organizza un viaggio a Deception Island e alle Shetland Meridionali: caldera, Whalers Bay, quando andare e come arrivare. Guida pratica dall'Italia.",
    gatewayNote: "Non ci sono voli di linea per l'Antartide. I viaggi sono crociere (o pacchetti fly-cruise), e la maggior parte parte da Ushuaia, in Argentina, quindi la ricerca in questa pagina serve per arrivare a Ushuaia.",
    intro: [
      "Le isole Shetland Meridionali si trovano a nord della Penisola Antartica, quindi di solito sono la prima terra antartica che una crociera raggiunge. Deception Island è la più nota. È un'isola a forma di anello, il cratere allagato di un vulcano attivo.",
      "Spesso le navi possono entrare nel cratere attraverso uno stretto passaggio chiamato Neptune's Bellows. All'interno si può sbarcare tra le rovine di antiche stazioni baleniere o camminare su spiagge vulcaniche nere. Non ci sono voli di linea per le isole. La maggior parte dei viaggi parte in nave da Ushuaia, e alcuni viaggi fly-cruise atterrano sull'isola King George, nello stesso gruppo di isole.",
    ],
    attractions: [
      { name: "Entrare in nave nella caldera", text: "Entrare attraverso Neptune's Bellows è uno dei momenti più belli. Il cratere è largo circa 15 km, e il meteo decide se una nave può entrare." },
      { name: "Whalers Bay", text: "Una spiaggia con i resti arrugginiti di una stazione baleniera e di una successiva base britannica. Puoi camminare intorno al sito, ma i vecchi edifici sono chiusi ai visitatori." },
      { name: "Spiagge vulcaniche calde", text: "Il calore del vulcano scalda in alcuni punti l'acqua e la sabbia. Alcuni viaggi offrono qui un rapido bagno, un popolare tuffo polare." },
      { name: "Escursione a Telefon Bay", text: "Una camminata sulla cenere vulcanica fino al bordo di un cratere formatosi con un'eruzione negli anni Sessanta. Le guide ti dicono fin dove ci si può avvicinare." },
      { name: "Pinguini sottogola a Baily Head", text: "Una colonia molto grande di pinguini sottogola vive sul lato esterno dell'isola. Gli sbarchi lì spesso non sono possibili a causa di onde e risacca, quindi consideralo un bonus." },
    ],
    bestTime: [
      "Come nel resto dell'Antartide, la stagione per i visitatori va circa da novembre a marzo. Deception Island di solito si visita con crociere sulla Penisola e sulle Shetland Meridionali in quei mesi, ma le tappe esatte dipendono da meteo e ghiaccio.",
      "All'inizio della stagione la neve copre ancora i pendii, il che è adatto alle foto delle colonie di pinguini. Più avanti nella stagione c'è più terra scoperta, i piccoli sono più grandi e le balene sono più probabili. Gli sbarchi non si possono promettere in anticipo, quindi preparati a un cambio di programma.",
    ],
    tips: [
      "Chiedi all'operatore se Deception Island è nel percorso previsto. È comune, ma non è in ogni viaggio.",
      "Porta un costume se vuoi provare il tuffo polare, e un asciugamano ad asciugatura rapida.",
      "Vento e onde decidono gli sbarchi. Tieni flessibili i tuoi programmi.",
      "Non entrare negli antichi edifici baleniere. Sono pericolosi e protetti.",
    ],
    faq: [
      { q: "Deception Island è un vulcano?", a: "Sì. È il cratere allagato di un vulcano attivo. Gli operatori dicono che le ultime eruzioni sono state intorno al 1969-1970." },
      { q: "Si può fare il bagno a Deception Island?", a: "Alcuni viaggi offrono un breve tuffo sulla spiaggia, dove l'acqua è più calda vicino al calore vulcanico. È comunque freddissima, quindi entra solo con una guida." },
      { q: "Quando posso visitarla?", a: "Durante l'estate antartica, circa da novembre a marzo, con crociere che comprendono le isole Shetland Meridionali." },
    ],
    details: {
      gettingAround: [
        "Deception Island è nelle isole Shetland Meridionali, che le navi raggiungono dopo il Passaggio di Drake da Ushuaia, circa due giorni. Non si può prenotare da sola. È una tappa di un viaggio più lungo sulla Penisola.",
        "Operatori diversi la collocano in momenti diversi. Un itinerario tipico la visita sulla via del ritorno, subito prima di riattraversare il Drake, e un altro la abbina a Half Moon Island al giorno 10 di un viaggio lungo. Controlla il programma giorno per giorno del viaggio che stai guardando.",
        "L'isola è una caldera allagata a forma di ferro di cavallo, e sbarchi e uscite in Zodiac dipendono dal meteo e dalle decisioni del capo spedizione del giorno.",
      ],
      whereToStay: [
        { area: "Sulla nave", text: "Sull'isola non ci sono hotel. Si alloggia in una cabina sulla nave di spedizione che la include nel percorso." },
        { area: "Ushuaia", text: "Il porto da cui di solito si parte. Prevedi una notte qui prima di imbarcarti." },
        { area: "Punta Arenas", text: "Da dove iniziano i viaggi fly-cruise, con un volo charter per l'isola King George per raggiungere la nave." },
        { area: "Buenos Aires", text: "Un punto di partenza comune dei pacchetti, con il volo per Ushuaia incluso." },
      ],
      costs: [
        "Deception Island non ha un biglietto separato negli annunci che abbiamo controllato. Il costo è quello del viaggio, quindi guarda i prezzi dell'intero viaggio sulla Penisola Antartica e non di questa sola tappa.",
        "Come riferimento, un viaggio in nave classica di 12 giorni da Ushuaia era indicato da circa 9.600 dollari americani a persona nel 2026, e i viaggi fly-cruise più brevi costano di più.",
      ],
      extraFaq: [
        { q: "Deception Island è un viaggio a parte?", a: "No. È una tappa di un viaggio da Ushuaia o di un fly-cruise, di solito insieme ad altri sbarchi alle Shetland Meridionali o sulla Penisola. Scegli un viaggio che la includa." },
        { q: "Perché Deception Island ha la forma di un ferro di cavallo?", a: "È un'isola vulcanica la cui caldera si è riempita di acqua di mare, il che le dà la forma aperta a ferro di cavallo in cui entrano le navi." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "paradise-bay",
    itSlug: "paradise-bay",
    name: "Paradise Bay",
    country: "Antartide",
    tagline: "Ghiacciai, acqua ferma e ghiaccio galleggiante sulla costa della Penisola",
    title: "Guida di viaggio a Paradise Bay: cosa vedere, quando andare e come arrivare",
    description: "Organizza un viaggio a Paradise Bay in Antartide: ghiacciai, Zodiac, quando andare e come arrivare. Guida pratica per chi parte dall'Italia.",
    gatewayNote: "Non ci sono voli di linea per l'Antartide. I viaggi sono crociere (o pacchetti fly-cruise), e la maggior parte parte da Ushuaia, in Argentina, quindi la ricerca in questa pagina serve per arrivare a Ushuaia.",
    intro: [
      "Paradise Bay, chiamata anche Paradise Harbour, è una baia riparata sulla Penisola Antartica, appena a nord del Canale Lemaire. I ghiacciai scendono fino all'acqua e gli iceberg scivolano lungo la riva. In una giornata calma l'acqua è uno specchio.",
      "È una tappa di molte crociere sulla Penisola, ma nessuna compagnia aerea ci vola. I viaggi di solito partono in nave da Ushuaia. Il modo principale di vedere la baia è in Zodiac, e alcuni viaggi aggiungono uno sbarco o attività come il kayak.",
    ],
    attractions: [
      { name: "Uscita in Zodiac lungo i ghiacciai", text: "Un lento giro in gommone lungo le pareti di ghiaccio è l'attività principale. Potresti vedere anche balene, pinguini di Papua e foche granchiere." },
      { name: "Stazione Almirante Brown", text: "Una stazione di ricerca argentina, in parte ricostruita come base estiva dopo un incendio nel 1984. I visitatori a volte possono sbarcare vicino per una breve salita e una vista ampia." },
      { name: "Stazione González Videla", text: "Una stazione cilena a Waterboat Point, sul bordo settentrionale della baia. Una piccola capanna, in parte fatta con una barca rovesciata, è un monumento storico." },
      { name: "Kayak nella baia", text: "Nei viaggi che lo offrono, i pagaiatori si muovono tra il ghiaccio a livello dell'acqua. Di solito costa extra e ha posti limitati." },
      { name: "Campeggio sulla neve", text: "Alcuni operatori permettono a un piccolo gruppo di passare una notte a terra a Paradise Harbour. È facoltativo e dipende dal meteo." },
    ],
    bestTime: [
      "Paradise Bay si visita nella normale stagione antartica, circa da novembre a marzo. I viaggi indicati per essa dagli operatori vanno per lo più da fine novembre a febbraio.",
      "A novembre e a inizio dicembre c'è più neve e ghiaccio. A gennaio e febbraio le giornate sono più calde, l'acqua è più aperta e le balene si vedono più spesso. Meteo e ghiaccio decidono ogni visita, quindi nulla è certo.",
    ],
    tips: [
      "Porta una buona fotocamera con un teleobiettivo e tienila asciutta nello Zodiac.",
      "Se vuoi il kayak o il campeggio, chiedilo al momento della prenotazione. I posti sono pochi.",
      "Indossa pantaloni impermeabili per le uscite in Zodiac. Spruzzi e vento freddo sono comuni.",
      "Resta ad almeno 5 metri dai pinguini a terra.",
    ],
    faq: [
      { q: "Dov'è Paradise Bay?", a: "Sul lato occidentale della Penisola Antartica, appena a nord del Canale Lemaire." },
      { q: "Si può volare a Paradise Bay?", a: "No. Ci si arriva in nave, di solito da Ushuaia. I pacchetti fly-cruise atterrano più a nord e poi proseguono in nave." },
      { q: "Cosa si può fare?", a: "Soprattutto un'uscita in Zodiac tra ghiacciai e ghiaccio. Alcuni viaggi offrono kayak, campeggio o uno sbarco in una stazione di ricerca." },
    ],
    details: {
      gettingAround: [
        "Paradise Bay è sulla Penisola Antartica e si raggiunge con un viaggio di spedizione da Ushuaia, dopo circa due giorni di Passaggio di Drake. Non si vende da sola. Compare negli itinerari che coprono la Penisola e spesso si trova vicino a Port Lockroy.",
        "I viaggi fly-cruise da Punta Arenas all'isola King George saltano il Drake e salgono sulla nave lì, il che fa risparmiare tempo ma costa di più.",
        "Le visite si fanno di solito con la nave e con gommoni Zodiac, e un rapporto di spedizione di National Geographic nota che il tempo cambia non solo di giorno in giorno ma di ora in ora, quindi i programmi cambiano.",
      ],
      whereToStay: [
        { area: "Sulla nave", text: "La tua cabina a bordo della nave di spedizione è dove alloggi per tutto il viaggio." },
        { area: "Ushuaia", text: "Il principale porto per i viaggi sulla Penisola. Arriva almeno un giorno prima." },
        { area: "Punta Arenas", text: "La base per i viaggi fly-cruise verso l'isola King George." },
        { area: "Buenos Aires", text: "Da dove iniziano molti pacchetti, prima del volo per Ushuaia." },
      ],
      costs: [
        "Non c'è un prezzo separato per Paradise Bay. È inclusa nel viaggio, e gli annunci del 2026 per i viaggi sulla Penisola partono da circa 9.600 dollari americani a persona per una nave classica di 12 giorni.",
        "Il tipo di cabina cambia molto il prezzo. Gli annunci mostrano le categorie interna, vista mare, balcone e suite, e un balcone su un breve fly-cruise può costare ben oltre 16.000 dollari.",
      ],
      extraFaq: [
        { q: "Tutte le crociere antartiche si fermano a Paradise Bay?", a: "No. Gli itinerari variano per nave e operatore, e il capo spedizione decide le tappe di ogni giorno in base a meteo e ghiaccio. Chiedi all'operatore quali siti della Penisola un viaggio di solito comprende." },
        { q: "Come si arriva a Paradise Bay?", a: "Ci si imbarca su una crociera sulla Penisola, più spesso da Ushuaia, oppure su un fly-cruise che parte dall'isola King George. Non c'è modo di raggiungerla in modo indipendente." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "port-lockroy",
    itSlug: "port-lockroy",
    name: "Port Lockroy",
    country: "Antartide",
    tagline: "Una base britannica storica con un ufficio postale e pinguini come vicini",
    title: "Guida di viaggio a Port Lockroy: cosa vedere, quando andare e come arrivare",
    description: "Organizza un viaggio a Port Lockroy in Antartide: museo, ufficio postale, pinguini, quando andare e come arrivare. Guida pratica per chi parte dall'Italia.",
    gatewayNote: "Non ci sono voli di linea per l'Antartide. I viaggi sono crociere (o pacchetti fly-cruise), e la maggior parte parte da Ushuaia, in Argentina, quindi la ricerca in questa pagina serve per arrivare a Ushuaia.",
    intro: [
      "Port Lockroy si trova sull'isola Goudier, al largo del lato occidentale della Penisola Antartica. Nacque come base britannica nel 1944, fu presidiata fino al 1962 e restaurata nel 1996. Oggi è un museo, un negozio e un ufficio postale, gestito dall'UK Antarctic Heritage Trust.",
      "I pinguini di Papua nidificano intorno all'edificio, e l'isola è condivisa: una parte per i pinguini, una per i visitatori. Non ci sono voli per Port Lockroy. È una tappa comune delle crociere sulla Penisola che partono da Ushuaia.",
    ],
    attractions: [
      { name: "Museo di Bransfield House", text: "L'edificio principale mostra come vivevano e lavoravano gli scienziati nelle prime basi antartiche. È piccolo, quindi entra solo un numero limitato di visitatori alla volta." },
      { name: "Il Penguin Post Office", text: "È descritto come l'ufficio postale più a sud del mondo. Da qui si possono spedire cartoline. Il personale gestisce circa 70.000 cartoline all'anno." },
      { name: "Colonia di pinguini di Papua", text: "Più di mille pinguini di Papua vivono intorno al sito. Resta nell'area segnata per i visitatori e lasciali passare." },
      { name: "Negozio", text: "I soldi del negozio vanno alla cura di questo e di altri siti storici in Antartide." },
      { name: "Jougla Point", text: "Gli operatori spesso abbinano Port Lockroy a uno sbarco o a un'uscita in Zodiac nelle vicinanze, per evitare le code per l'edificio." },
    ],
    bestTime: [
      "Il sito è aperto quando c'è la squadra dell'estate antartica, circa da novembre a marzo. Alcuni dei primi piccoli nascono già a fine dicembre.",
      "Per i piccoli dei pinguini punta a gennaio e febbraio. A novembre i pinguini stanno nidificando e c'è più neve. Controlla con il tuo operatore, perché la stagione 2026/27 comprende grandi lavori di riparazione a Bransfield House, che potrebbero influire su ciò che i visitatori possono vedere.",
    ],
    tips: [
      "Porta alcune cartoline e gli indirizzi già scritti. Chiedi all'operatore di francobolli e pagamento.",
      "Aspettati una breve coda per il museo e l'ufficio postale.",
      "Resta sul lato dell'isola riservato ai visitatori e tieni 5 metri di distanza dai pinguini.",
      "Chiedi se l'edificio è aperto ai visitatori nel tuo viaggio in questa stagione.",
    ],
    faq: [
      { q: "Port Lockroy è un vero ufficio postale?", a: "Sì. È gestito dall'UK Antarctic Heritage Trust come ufficio postale funzionante, e i visitatori possono spedire cartoline da lì." },
      { q: "Quanti visitatori riceve?", a: "Fino a circa 18.000 visitatori in una stagione, secondo l'UK Antarctic Heritage Trust." },
      { q: "Posso soggiornarci?", a: "No. Ci vive solo la piccola squadra del personale. I visitatori scendono a terra da una nave per una breve visita." },
    ],
    details: {
      gettingAround: [
        "Port Lockroy è sull'isola Goudier, appena al largo della terraferma antartica, e si raggiunge con una nave di spedizione da Ushuaia dopo circa due giorni di Passaggio di Drake. Le navi spesso arrivano attraverso il Canale Neumayer.",
        "È un'ex stazione di ricerca britannica oggi museo e ufficio postale, quindi molte crociere la considerano uno dei momenti più belli. Un operatore la presenta dicendo che potresti avere la possibilità di visitarla, il che corrisponde alla realtà: meteo e ghiaccio decidono ogni giorno.",
        "I viaggi fly-cruise da Punta Arenas all'isola King George saltano il Drake e salgono sulla nave lì.",
      ],
      whereToStay: [
        { area: "Sulla nave", text: "Alla stazione non c'è alloggio. Si dorme nella propria cabina a bordo della nave di spedizione." },
        { area: "Ushuaia", text: "Il porto da cui di solito si parte, dove conviene prevedere una notte prima dell'imbarco." },
        { area: "Punta Arenas", text: "La base per i pacchetti fly-cruise con un volo charter per l'isola King George." },
        { area: "Buenos Aires", text: "Molti pacchetti iniziano qui e comprendono il volo per Ushuaia." },
      ],
      costs: [
        "Il costo è quello del viaggio, perché Port Lockroy è una tappa di un itinerario sulla Penisola. Gli annunci del 2026 partono da circa 9.600 dollari americani a persona per una nave di 12 giorni da Ushuaia.",
        "Extra come bevande, mance ed escursioni di solito si pagano a parte. Chiedi al tuo operatore cosa è incluso prima di prenotare.",
      ],
      extraFaq: [
        { q: "Cosa c'è a Port Lockroy?", a: "Un'ex stazione di ricerca britannica, oggi museo e ufficio postale, sull'isola Goudier. È anche un posto per vedere i pinguini di Papua, e per alcune crociere è il primo sbarco." },
        { q: "Posso visitare Port Lockroy con qualsiasi crociera antartica?", a: "Non con tutte. Dipende dall'itinerario, dal meteo e dal ghiaccio, e il capo spedizione decide ogni giorno. Chiedi all'operatore se è una tappa regolare del tuo viaggio." },
      ],
    },
    checked: "2026-11-22",
  },
  {
    slug: "weddell-sea",
    itSlug: "mare-di-weddell",
    name: "Mare di Weddell",
    at: "al",
    country: "Antartide",
    tagline: "Giganteschi iceberg tabulari e la possibilità di vedere i pinguini imperatore",
    title: "Guida di viaggio al Mare di Weddell: cosa vedere, quando andare e come arrivare",
    description: "Organizza un viaggio al Mare di Weddell in Antartide: pinguini imperatore, iceberg tabulari, quando andare e come arrivare. Guida pratica dall'Italia.",
    gatewayNote: "Non ci sono voli di linea per l'Antartide. I viaggi sono crociere (o pacchetti fly-cruise), e la maggior parte parte da Ushuaia, in Argentina, quindi la ricerca in questa pagina serve per arrivare a Ushuaia.",
    intro: [
      "Il Mare di Weddell è sul lato orientale della Penisola Antartica. È più freddo e più ghiacciato del lato occidentale, e ci vanno meno navi. Il mare è noto per i giganteschi iceberg a cima piatta e per i pinguini imperatore, difficili da vedere altrove in una crociera normale.",
      "Non ci sono voli. La maggior parte dei viaggi nel Mare di Weddell parte in nave da Ushuaia, e alcuni iniziano con un volo da Punta Arenas. Questi viaggi sono di solito più lunghi di una classica crociera sulla Penisola, e il ghiaccio può cambiare il programma in qualsiasi momento.",
    ],
    attractions: [
      { name: "Pinguini imperatore a Snow Hill Island", text: "Una colonia di circa 4.000 coppie riproduttive vive a sud di Snow Hill Island. Raggiungerla non è mai garantito, e alcuni operatori usano un elicottero seguito da una camminata sul ghiaccio." },
      { name: "Iceberg tabulari", text: "Questi enormi iceberg piatti si staccano dalle piattaforme di ghiaccio. Navigare tra di essi è uno dei motivi principali per scegliere il Mare di Weddell." },
      { name: "Pinguini di Adelia a Paulet Island", text: "Una delle più grandi colonie di pinguini di Adelia, stimata intorno a 100.000 coppie. È legata anche alla stessa antica spedizione svedese, il cui gruppo di soccorso trascorse qui un inverno." },
      { name: "La storia di Snow Hill", text: "Una spedizione svedese rimase bloccata su Snow Hill Island nel 1902 e vi trascorse l'inverno." },
      { name: "Balene e foche", text: "In questi viaggi si possono vedere orche, megattere e balenottere minke, e foche leopardo, granchiere e di Weddell." },
    ],
    bestTime: [
      "I viaggi che puntano ai pinguini imperatore di Snow Hill si fanno solo a novembre e a inizio dicembre, quando il ghiaccio è ancora abbastanza spesso per i pinguini e per gli elicotteri. Anche allora, dicono gli operatori, il successo è tutt'altro che certo, quindi consideralo una possibilità.",
      "La maggior parte delle altre crociere nel Mare di Weddell si fa circa da gennaio a marzo, quando il ghiaccio si rompe abbastanza per le navi. Allora si vedono iceberg e pinguini di Adelia, ma non ci si aspettano gli imperatori. Le navi dei viaggi sulla Penisola possono visitare anche il lato del Weddell se il ghiaccio lo permette, ma non si può promettere.",
    ],
    tips: [
      "Chiedi quanti giorni sono riservati al ghiaccio e se la nave ha degli elicotteri.",
      "Decidi prima cosa conta di più. I pinguini imperatore richiedono un viaggio a inizio stagione e un atteggiamento flessibile.",
      "Aspettati un viaggio più lungo e spesso più caro di una classica crociera sulla Penisola.",
      "Arriva a Ushuaia uno o due giorni prima, in caso di ritardi.",
    ],
    faq: [
      { q: "Si possono vedere i pinguini imperatore in Antartide?", a: "A volte. Speciali viaggi nel Mare di Weddell a novembre e a inizio dicembre puntano alla colonia di Snow Hill, ma ghiaccio e meteo possono impedire lo sbarco." },
      { q: "Quando si fanno le crociere nel Mare di Weddell?", a: "I viaggi per gli imperatori si fanno a novembre e a inizio dicembre. La maggior parte degli altri circa da gennaio a marzo." },
      { q: "Da dove partono i viaggi nel Mare di Weddell?", a: "La maggior parte da Ushuaia. Alcuni iniziano con un volo da Punta Arenas, in Cile." },
    ],
    details: {
      gettingAround: [
        "I viaggi nel Mare di Weddell sono spedizioni, per lo più di 14 giorni o più, in partenza da Ushuaia. Attraversano il Passaggio di Drake, navigano a est della Penisola e puntano alla colonia di pinguini imperatore vicino a Snow Hill Island, poi spesso finiscono sul lato della Penisola.",
        "Diversi operatori usano gli elicotteri per passare dalla nave a terra vicino a Snow Hill. Dopo l'atterraggio, un itinerario descrive una camminata di circa 45 minuti per raggiungere i pinguini.",
        "Raggiungere la colonia non è garantito. Un operatore dice che c'è meno del 50 per cento di probabilità di raggiungere la colonia di Snow Hill, perché dipende dal ghiaccio marino, e offre altre occasioni di vedere singoli imperatori sul bordo della banchisa.",
      ],
      whereToStay: [
        { area: "Sulla nave", text: "Si vive a bordo di una nave di spedizione rinforzata per il ghiaccio per tutto il viaggio, di solito 14 giorni o più." },
        { area: "Ushuaia", text: "Il porto di partenza abituale. Prevedi una notte qui prima dell'imbarco." },
        { area: "Buenos Aires", text: "Da dove iniziano molti pacchetti, prima del volo per Ushuaia." },
        { area: "Punta Arenas", text: "Usata dalle opzioni fly-cruise, con un volo per l'isola King George per raggiungere una nave." },
      ],
      costs: [
        "I viaggi nel Mare di Weddell costano più delle crociere standard sulla Penisola perché sono più lunghi e usano gli elicotteri. Gli annunci visti nel 2026 partono da circa 22.800 dollari americani per un viaggio di 14 giorni e arrivano a circa 32.300 per una versione di livello più alto.",
        "Il costo è a persona e di solito non comprende i voli internazionali per l'Argentina o il Cile.",
      ],
      extraFaq: [
        { q: "Qual è il momento migliore per vedere i pinguini imperatore a Snow Hill?", a: "All'inizio della stagione. Un rapporto di spedizione descrive una partenza anticipata, con uno sbarco in elicottero sul ghiaccio fisso il 5 novembre, fatto perché gli ospiti vedessero la colonia prima che i pinguini vadano in mare." },
        { q: "Quanto è grande la colonia di imperatori di Snow Hill?", a: "Le fonti non concordano. Un rapporto di viaggio indica circa 8.000 uccelli e un altro operatore dice circa 4.000 coppie riproduttive, quindi considera entrambi i numeri approssimativi." },
      ],
    },
    checked: "2026-11-22",
  },
];

/** The Italian hub is hidden from search engines until this many Italian pages exist. */
export const IT_HUB_MIN_PAGES = 5;

/** "a Roma", "alle Maldive". */
export function atIt(d: { name: string; at?: string }): string {
  return `${d.at ?? "a"} ${d.name}`;
}

export function findItDestination(itSlug: string): ItDestination | null {
  return IT_DESTINATIONS.find((d) => d.itSlug === itSlug) ?? null;
}

/** The Italian page for an English destination slug, if there is one. */
export function italianFor(slug: string): ItDestination | null {
  return IT_DESTINATIONS.find((d) => d.slug === slug) ?? null;
}
