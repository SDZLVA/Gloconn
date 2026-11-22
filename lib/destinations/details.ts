import type { FaqItem } from "@/lib/seo/jsonld";

/**
 * Milestone 79 — deeper content for destination pages: how to get from the airport and around,
 * where to stay by area, and what a trip costs. Kept apart from the region files so it can be
 * added batch by batch. A destination with no entry here simply shows no extra sections.
 *
 * Facts were researched on 2026-11-22 from official transport pages (RATP, Île-de-France Mobilités,
 * Trenitalia, Aeroporti di Roma, TfL, Heathrow, MTA) and guides (Time Out, Lonely Planet, Rough
 * Guides, Kiwi.com and others), then written in our own words. Prices change: where sources
 * disagree we say so instead of picking one. Re-check `checked` about every six months.
 */

export type StayArea = { area: string; text: string };

export type DestinationDetails = {
  /** Airport transfers and city transport, with fares. */
  gettingAround: string[];
  /** Neighbourhoods, each with who it suits. */
  whereToStay: StayArea[];
  /** What a trip costs: ranges, with sources' disagreement stated. */
  costs: string[];
  /** Extra questions (also sent to Google as FAQ markup). */
  extraFaq: FaqItem[];
  /** YYYY-MM-DD the facts were last checked. */
  checked: string;
};

const CHECKED = "2026-11-22";

export const DETAILS: Record<string, DestinationDetails> = {
  paris: {
    gettingAround: [
      "From Charles de Gaulle (CDG) the RER B train reaches central Paris in about 35 to 50 minutes. Since January 2026 a single Paris Region to Airports ticket costs 14 euros (7 euros for children under 10). The same ticket covers metro line 14 from Orly (ORY), which reaches Châtelet in under 40 minutes.",
      "Taxis from CDG have fixed fares in 2026: 56 euros to the Right Bank and 65 euros to the Left Bank. The RoissyBus airport bus stopped running at the end of February 2026.",
      "Inside the city one metro, RER or train ticket costs 2.55 euros and a bus or tram ticket 2.05 euros in 2026. A Navigo Jour day pass for all zones is about 12 euros. Paper tickets are being phased out, so load tickets on a card or in the Bonjour RATP app.",
    ],
    whereToStay: [
      { area: "Le Marais (3rd and 4th)", text: "Central, with easy access to the Louvre and Notre-Dame. A common first choice for a first visit." },
      { area: "Latin Quarter (5th)", text: "A lively area on the Left Bank, just across the Seine from the Marais." },
      { area: "Saint-Germain-des-Prés (6th)", text: "Classic cafés and the artistic Left Bank feel. It suits you if the budget allows." },
      { area: "1st arrondissement", text: "The closest base to the Louvre and the Tuileries Garden, calm in the evenings." },
      { area: "Montmartre (18th)", text: "Hotels here tend to cost a little less than in other central areas, so it is a good value pick." },
    ],
    costs: [
      "Estimates differ. One 2026 guide puts budget travellers at about 95 to 120 euros a day and mid-range travellers at 150 to 220 euros, including a bed. A hostel dorm bed is around 28 to 45 euros a night.",
      "Add the tourist tax on hotels, which is charged per adult per night and ranges from under 1 euro to about 16 euros depending on the type of accommodation. A major attraction averages roughly 24 euros a ticket.",
    ],
    extraFaq: [
      { q: "How do I get from Paris Charles de Gaulle airport to the city centre?", a: "Take the RER B train. It takes about 35 to 50 minutes to central stations such as Gare du Nord and Châtelet, and a single airport ticket costs 14 euros in 2026." },
      { q: "How much does a metro ticket cost in Paris?", a: "A single metro, RER or train ticket costs 2.55 euros in 2026, and a bus or tram ticket costs 2.05 euros. Tickets to or from the airports are 14 euros." },
    ],
    checked: CHECKED,
  },
  rome: {
    gettingAround: [
      "The Leonardo Express is the non-stop train from Fiumicino airport (FCO) to Roma Termini. It takes 32 minutes, costs 14 euros, and runs about every 15 minutes from early morning until late evening. Regional FL1 trains link the airport with other Rome stations.",
      "A taxi from Fiumicino to the centre has an official flat rate of 55 euros.",
      "In the city a single ATAC ticket costs 1.50 euros and is valid for 100 minutes, with one metro ride and unlimited bus and tram changes. A 24-hour pass is 7 euros and a 48-hour pass 12.50 euros. The centre is compact: the Colosseum to the Vatican is about 4 km on foot.",
    ],
    whereToStay: [
      { area: "Centro Storico", text: "The historic centre, with the Pantheon, Piazza Navona and the Trevi Fountain within walking distance. The usual first-timer pick." },
      { area: "Monti", text: "A walkable neighbourhood beside the Colosseum with a village feel, often recommended to first-time visitors." },
      { area: "Trastevere", text: "Across the river, known for its atmosphere and nightlife." },
      { area: "Prati", text: "A quieter base near the Vatican." },
      { area: "Testaccio", text: "Good for food lovers who want a more local feel." },
    ],
    costs: [
      "Estimates differ. Lonely Planet suggests planning around 100 to 250 euros per person per day, while budget guides manage on roughly 60 to 100 euros with a hostel or simple B&B, street food and walking.",
      "Rome charges a city tax per person per night, which guides quote at roughly 3 to 10 euros depending on the hotel. Hotels are usually cheapest from late November to early March and dearest in July and August.",
    ],
    extraFaq: [
      { q: "How do I get from Rome Fiumicino airport to the city centre?", a: "The Leonardo Express runs non-stop to Roma Termini in 32 minutes for 14 euros. A taxi has a flat rate of 55 euros, and regional FL1 trains link the airport with other Rome stations." },
      { q: "How much is a bus or metro ticket in Rome?", a: "A single ticket costs 1.50 euros and is valid for 100 minutes, covering one metro ride plus unlimited bus and tram changes. A 24-hour pass costs 7 euros." },
    ],
    checked: CHECKED,
  },
  london: {
    gettingAround: [
      "From Heathrow, the Elizabeth line reaches central London in under 40 minutes. The one-way fare rose to 15.50 pounds in March 2026. The Heathrow Express is faster, 15 minutes non-stop to Paddington, with advance fares from about 10 pounds. The Piccadilly line is the cheapest rail option at around 6 pounds but takes 50 to 60 minutes.",
      "Inside the city, pay with the same contactless card or phone on every trip, or use an Oyster card. Fares are capped each day: for zones 1 and 2 the adult daily cap is 8.90 pounds in 2026 and the Monday to Sunday weekly cap is 44.70 pounds. A bus ride costs 1.75 pounds with a daily bus cap of 5.25 pounds.",
    ],
    whereToStay: [
      { area: "Covent Garden and Soho", text: "The most central choice, with theatres, restaurants and many sights within walking distance." },
      { area: "Westminster", text: "The historic and political heart of the city, with Big Ben, the Houses of Parliament and the Thames." },
      { area: "South Bank and Southwark", text: "A riverside base across the bridge from the centre, with the London Eye nearby and good walks along the Thames." },
      { area: "Bayswater and Hyde Park", text: "Next to Hyde Park and Kensington Gardens." },
      { area: "Shoreditch", text: "In the East End, known for its cultural energy, for a less traditional stay." },
    ],
    costs: [
      "London is one of the most expensive cities in Europe, and guides give very different daily figures. One 2026 range is about 75 to 260 pounds per person per day excluding flights, and the hotel is what moves the number most.",
      "Food can cost 15 to 20 pounds a day if you cook some meals, and 30 to 50 pounds with one or two mid-range meals out. Many major museums are free to enter, while well-known paid sights often cost 30 to 40 pounds or more per adult.",
    ],
    extraFaq: [
      { q: "How do I get from Heathrow airport to central London?", a: "The Elizabeth line takes under 40 minutes and costs 15.50 pounds one way from March 2026. The Heathrow Express takes 15 minutes to Paddington, and the Piccadilly line is the cheapest at about 6 pounds." },
      { q: "Do I need an Oyster card in London?", a: "No. A contactless bank card or phone gets the same fares and daily caps as an Oyster card. Use the same card for every journey so the cap applies." },
    ],
    checked: CHECKED,
  },
  "new-york": {
    gettingAround: [
      "From JFK the cheapest route is the AirTrain to the subway. The AirTrain fare is 8.75 dollars in 2026 and the subway is 3 dollars, about 11.75 dollars in total and 60 to 90 minutes. A yellow taxi from JFK to Manhattan has a flat fare of 70 dollars plus tolls and a tip.",
      "From Newark, the AirTrain and NJ Transit run to Penn Station in about 45 to 60 minutes for roughly 15 to 17 dollars. LaGuardia has no AirTrain. The Q70 bus to the subway is free, and metered taxis to Manhattan usually cost 45 to 75 dollars.",
      "In the city, tap a contactless card or phone on the OMNY reader. A subway or local bus ride is 3 dollars in 2026, with one free transfer within two hours, and rides are free after 12 paid trips in a week. The MetroCard was discontinued in January 2026.",
    ],
    whereToStay: [
      { area: "Midtown Manhattan", text: "The usual first-time base, with Times Square, theatres, many subway lines and easy links to the airports." },
      { area: "Greenwich Village and SoHo", text: "Greenwich Village was once the core of bohemian New York. SoHo is known for shopping and sits at the expensive end for hotels." },
      { area: "Upper West Side", text: "A neighbourhood that guides recommend for families." },
      { area: "Long Island City (Queens)", text: "Often better value than Manhattan, with subway links across the river." },
      { area: "Downtown Brooklyn and Williamsburg", text: "Good food and nightlife across the river, with Downtown Brooklyn often better value than Manhattan, and Williamsburg a hip choice." },
    ],
    costs: [
      "New York is expensive, and guides disagree. One 2026 estimate is about 140 dollars a day for a budget traveller and about 385 dollars mid-range per person, excluding flights, while some guides quote lower budget figures of 80 to 130 dollars.",
      "The hotel is the biggest cost. Long Island City and Downtown Brooklyn are often cheaper than Manhattan, but weigh the saving against the extra travel time.",
    ],
    extraFaq: [
      { q: "How do I get from JFK airport to Manhattan?", a: "The cheapest way is the AirTrain plus the subway, about 11.75 dollars and 60 to 90 minutes. A yellow taxi has a flat fare of 70 dollars plus tolls and a tip." },
      { q: "How much is the subway in New York?", a: "A ride costs 3 dollars in 2026, paid by tapping a contactless card or phone on the OMNY reader. You get one free transfer within two hours." },
    ],
    checked: CHECKED,
  },
  tokyo: {
    gettingAround: [
      "Haneda (HND) is the closest airport. The Tokyo Monorail and the Keikyu line both reach central Tokyo in roughly 13 to 20 minutes for under 550 yen. Narita (NRT) is in Chiba, about an hour from the centre by the fastest train.",
      "From Narita, the Keisei Skyliner takes about 40 minutes to Ueno and costs about 2,470 yen. The JR Narita Express costs from about 3,140 yen. Foreign passport holders can buy a Narita Express round trip for 5,200 yen. A fixed-rate taxi from Haneda to Chiyoda Ward is about 7,600 yen from April 2026, and more to Shibuya or Shinjuku.",
      "Load a Suica or Pasmo card, or the visitor-only Welcome Suica, and tap through every train, subway and bus gate. Stay within a short walk of a JR Yamanote Line station, because that loop links Shinjuku, Shibuya, Tokyo Station and Ueno.",
    ],
    whereToStay: [
      { area: "Shinjuku", text: "The most common first-time base, with trains, food, shopping and late-night options within walking distance." },
      { area: "Shibuya", text: "A younger, busier area for shopping and nightlife, close to Shibuya Crossing." },
      { area: "Tokyo Station and Marunouchi", text: "A practical choice if your trip includes the Shinkansen bullet train." },
      { area: "Asakusa and Ueno", text: "Usually the cheapest areas. Asakusa has an older, quieter feel around Senso-ji, and Ueno is handy for Narita." },
      { area: "Ginza", text: "A calmer, more upmarket base for shopping and dining." },
    ],
    costs: [
      "Guides give different figures. One 2026 guide puts hostels in Asakusa or Ueno from about 3,500 yen a night and hotels from about 8,000 yen. Another gives 6,000 to 10,000 yen for budget rooms and 14,000 to 25,000 yen for mid-range rooms in Asakusa.",
      "Public transport is cheap compared with the room, and a Tokyo Subway 24-hour ticket combined with the Skyliner costs 2,890 yen after the March 2026 fare change. Flight prices to Haneda can be a little higher than to Narita, but the shorter and cheaper trip into town often makes up for it.",
    ],
    extraFaq: [
      { q: "Should I fly into Haneda or Narita for Tokyo?", a: "Haneda is much closer, with trains reaching central Tokyo in about 13 to 20 minutes. Narita is about an hour away but has many international and budget flights, so compare the total of the flight and the transfer." },
      { q: "Where should I stay in Tokyo for the first time?", a: "Most guides suggest Shinjuku for the easiest all-round base, Shibuya for nightlife, and Asakusa or Ueno for lower prices. Stay close to a Yamanote Line station." },
    ],
    checked: CHECKED,
  },
  barcelona: {
    gettingAround: [
      "Barcelona airport (BCN) is about 15 km from the centre. The Aerobus runs between the airport and the city about every 5 to 10 minutes and takes around 35 minutes. A single ticket costs roughly 7 euros, and sources quote slightly different prices, so check the operator's site.",
      "The L9 Sud metro needs a special Airport ticket at about 5.90 euros in 2026. The ordinary single ticket and the T-casual card are not accepted at the airport metro stations. The R2 Nord train from Terminal 2 and bus 46 do accept the T-casual.",
      "In the city a T-casual with 10 journeys costs about 13 euros, which works out at about 1.30 euros a trip, and a single zone 1 ticket is about 2.90 euros. Most sights are in zone 1. Taxis from the airport start at about 21 euros including supplements and usually reach 30 to 45 euros for the centre.",
    ],
    whereToStay: [
      { area: "Gothic Quarter", text: "The usual first-time choice, with narrow medieval lanes, the Cathedral and La Rambla close by." },
      { area: "Eixample", text: "A grid of wide streets with Gaudí buildings and Passeig de Gràcia, and good metro coverage." },
      { area: "El Born", text: "Known for bars, boutiques and the Picasso Museum, a good choice for couples." },
      { area: "Gràcia", text: "A calmer, village-like neighbourhood that guides often suggest for families." },
      { area: "Barceloneta", text: "The closest area to the beach, though several guides warn it is touristy for dining." },
    ],
    costs: [
      "One 2026 guide puts a typical visitor at 80 to 220 euros a day, from about 80 euros for budget travellers to 150 to 180 euros mid-range. Staying in Gràcia, Poble-sec, Sant Antoni or Poblenou instead of the Gothic Quarter can cut accommodation costs by roughly 20 to 40 percent.",
      "Catalonia roughly doubled its tourist accommodation tax from 1 April 2026. It is charged per person per night on top of the room rate and depends on the type of stay. Guides list figures from about 8 to 15 euros per night for 4 and 5 star hotels, so check the amount for your booking.",
    ],
    extraFaq: [
      { q: "How do I get from Barcelona airport to the city centre?", a: "The Aerobus takes about 35 minutes to the centre for about 7 euros. The R2 Nord train and bus 46 accept a T-casual card, while the L9 metro needs a special Airport ticket at about 5.90 euros." },
      { q: "Can I use a T-casual card at Barcelona airport?", a: "Not on the L9 metro airport stations. It does work on the R2 Nord train and on bus 46, and it is the cheapest way to ride the city's metro, bus and tram." },
    ],
    checked: CHECKED,
  },
  dubai: {
    gettingAround: [
      "Dubai International (DXB) has Metro stations at Terminals 1 and 3, and the Red Line runs from the airport through Downtown to the Marina. Terminal 2, used by budget airlines such as flydubai and Air Arabia, is not on the Metro, so you need a taxi or ride-hailing app there.",
      "You need a nol card to ride. A Silver nol card costs 25 dirhams including 19 dirhams of credit, and a paper Red ticket costs 2 dirhams. Silver fares are 3 dirhams for one zone, 5 for two zones and 7.50 for three or more, so the airport to Downtown is about 7.50 dirhams. The metro runs from about 5am to midnight, later on Fridays and starting at 8am on Sundays.",
      "Airport taxis start at about 25 dirhams on the meter, and waiting time and Salik tolls are added. The same nol card also works on trams, buses and water transport.",
    ],
    whereToStay: [
      { area: "Downtown Dubai", text: "The first-time pick, beside the Burj Khalifa and Dubai Mall, with the metro nearby." },
      { area: "Dubai Marina and JBR", text: "The choice for beach, restaurants and nightlife. These areas get crowded on Thursday and Friday." },
      { area: "Deira and Bur Dubai", text: "The older districts on either side of the Creek, with the cheapest rooms and the souks, and good metro links." },
      { area: "Business Bay", text: "Close to Downtown, often at lower prices." },
      { area: "Palm Jumeirah and Jumeirah", text: "Luxury beach resorts. There is no metro station on the Palm itself." },
    ],
    costs: [
      "Guides disagree. One 2026 estimate gives a budget day of about 73 dollars and mid-range of about 339 dollars per person, while another gives mid-range as about 175 dollars. Hotel prices matter most: two and three star rooms in Deira and Bur Dubai are listed from about 150 to 350 dirhams a night, against several hundred or more in Downtown and the Marina.",
      "Published hotel rates often leave out extras. Dubai adds a Tourism Dirham fee of about 7 to 20 dirhams per room per night depending on the hotel class, and many hotels add service charges and a municipality fee. Public transport is cheap and Dubai is best visited between about November and March.",
    ],
    extraFaq: [
      { q: "How do I get from Dubai airport to the city by metro?", a: "Use the Red Line from Terminal 1 or 3 with a nol card. A fare to Downtown costs about 7.50 dirhams and takes about 30 minutes. Terminal 2 has no metro station." },
      { q: "Do I need a nol card in Dubai?", a: "Yes for the metro, tram and buses, because cash is not accepted at the gates. A Silver card costs 25 dirhams with 19 dirhams of credit, and you can buy it at airport metro stations." },
    ],
    checked: CHECKED,
  },
  bali: {
    gettingAround: [
      "Bali's only commercial airport is Ngurah Rai (DPS). It is closer to Kuta, Seminyak and Jimbaran than to the capital Denpasar. Look for the official airport taxi counter and the Grab and Gojek lounges rather than accepting offers from drivers inside the terminal.",
      "Official counter taxis and apps cost roughly 100,000 to 150,000 rupiah to Kuta or Seminyak and 150,000 to 250,000 to Canggu in one 2026 guide, while another gives wider ranges for the same trips. Seminyak is only about 9 to 11 km away but the trip can take 20 to 45 minutes in traffic. Ubud is much longer.",
      "Public transport is limited. Most visitors use Grab or Gojek, taxis, a private driver for the day, or a rented scooter if they are experienced and have the right licence.",
    ],
    whereToStay: [
      { area: "Seminyak", text: "Beach clubs, restaurants and shops, popular for a first visit." },
      { area: "Ubud", text: "Rice fields, temples, yoga and wellness, inland and away from the beach." },
      { area: "Canggu", text: "A surf and café area, popular with remote workers." },
      { area: "Sanur", text: "A calmer beach town that works well for longer, quieter stays." },
      { area: "Uluwatu", text: "Cliffs and surf on the southern peninsula, and busy at sunset." },
    ],
    costs: [
      "Every foreign tourist pays a one-time tourist levy of 150,000 rupiah (about 10 US dollars) per person, including children, paid once through the official Love Bali website before or on arrival. It is separate from any visa fee.",
      "One 2026 guide puts hotels at about 30 to 65 dollars a night in popular areas and food at about 10 to 20 dollars a day. Budget guesthouses in Canggu and Ubud can cost far less. Staying in one area for a few days keeps transport costs down.",
    ],
    extraFaq: [
      { q: "Do I have to pay a tourist tax in Bali?", a: "Yes. Foreign visitors pay a one-time Bali tourist levy of 150,000 rupiah, about 10 US dollars, per person. You pay online through the official Love Bali portal and show the QR voucher on arrival." },
      { q: "How do I get from Bali airport to Seminyak or Canggu?", a: "Use the official airport taxi counter or the Grab and Gojek pickup areas. Expect roughly 100,000 to 150,000 rupiah to Seminyak and a bit more to Canggu, with travel time depending on traffic." },
    ],
    checked: CHECKED,
  },
};

export function destinationDetails(slug: string): DestinationDetails | null {
  return DETAILS[slug] ?? null;
}
