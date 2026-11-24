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
        "Una guida del 2026 indica per un visitatore tipo da 80 a 220 euro al giorno, da circa 80 euro per chi viaggia con poco budget a 150 180 euro per la fascia media. Dormire a Gràcia, Poble-sec, Sant Antoni o Poblenou invece che nel Barri Gòtic può ridurre i costi dell'alloggio di circa il 20-40 per cento.",
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
