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
  bangkok: {
    gettingAround: [
      "From Suvarnabhumi (BKK) the Airport Rail Link runs from the basement level to Phaya Thai in about 26 to 30 minutes for 45 baht, from 05:30 to midnight. Phaya Thai connects to the BTS Skytrain, and Makkasan connects to the MRT. A taxi or Grab to Sukhumvit or Silom usually takes 45 to 60 minutes, longer in rush hour, and airport taxis add a 50 baht surcharge plus road tolls.",
      "Bangkok's BTS and MRT are separate systems, so changing between them normally means paying a new fare. BTS fares run from 17 to about 65 baht, and MRT Blue Line fares run from 17 to 44 baht after a fare change on 3 July 2026. One guide reports a common rail fare of 17 to 45 baht from 1 January 2027, so check before you travel.",
    ],
    whereToStay: [
      { area: "Sukhumvit", text: "The most common first-time choice, with BTS access, shopping, food and nightlife, and hotels at many price levels." },
      { area: "Silom and Sathorn", text: "A central base between the Old City and Sukhumvit, close to Lumphini Park." },
      { area: "Old Town (Rattanakosin)", text: "Near the Grand Palace and Wat Pho. Khao San Road has the cheapest beds, and guides suggest staying near it rather than on it." },
      { area: "Riverside", text: "Quieter, with luxury hotels on the Chao Phraya River and boat access to the temples." },
      { area: "Siam", text: "The shopping district, which guides often suggest for families." },
    ],
    costs: [
      "Guides give different ranges. One 2026 comparison lists hostels at about 10 to 30 pounds a night and budget hotels at 30 to 70 pounds, with riverside luxury far higher. Khao San is the cheapest area and Sukhumvit has few options below three stars.",
      "The best time to visit is November to February, and Rough Guides recommends booking ahead then because some guesthouses only take cash deposits. Taxi fares to Pattaya, Ayutthaya and other day trips are quoted in the thousands of baht, so a train or tour can be cheaper.",
    ],
    extraFaq: [
      { q: "How do I get from Suvarnabhumi airport to central Bangkok?", a: "Take the Airport Rail Link from the basement level. It reaches Phaya Thai in about 26 to 30 minutes for 45 baht, and connects to the BTS and MRT. A taxi takes 45 to 60 minutes and adds a 50 baht airport surcharge plus tolls." },
      { q: "Where should I stay in Bangkok for the first time?", a: "Most guides name Sukhumvit as the easiest first base. Old Town suits temples, Silom is central, and Khao San has the cheapest beds." },
    ],
    checked: CHECKED,
  },
  istanbul: {
    gettingAround: [
      "Istanbul Airport (IST) is on the European side, about 40 to 45 km northwest of the old city. The cheapest route is the M11 metro to Gayrettepe, about 30 minutes, then the M2 line on. One 2026 guide gives the M11 as about 38 lira with an Istanbulkart and another gives city rides as about 35 lira, so expect roughly that and check the current price. The M11 does not run all night.",
      "Havaist buses leave from floor -2 on about 11 routes, including Taksim, Aksaray and Kadıköy, and no longer take cash. One guide lists Taksim at around 470 lira and a fixed-fare taxi at roughly 2,100 to 3,000 lira. Lira prices move fast with inflation, so treat these as a 2026 baseline. Sabiha Gökçen (SAW) on the Asian side is served by the M4 metro.",
      "Buy an Istanbulkart, which works on metros, trams, buses and ferries. The T1 tram runs through Sultanahmet and Eminönü, and ferries cross to Kadıköy and Üsküdar.",
    ],
    whereToStay: [
      { area: "Sultanahmet", text: "The Old City, with Hagia Sophia and the Blue Mosque within walking distance. Several guides pick it for first-timers." },
      { area: "Beyoğlu, Taksim and Galata", text: "Nightlife, meze, rooftop bars and the Galata Tower, reached by the T1 tram, the Tünel funicular and ferries." },
      { area: "Karaköy", text: "A stylish waterfront area and a useful transport hub, often named as a budget-friendly base." },
      { area: "Beşiktaş", text: "A lived-in Bosphorus neighbourhood that Rough Guides suggests for families." },
      { area: "Kadıköy", text: "On the Asian side, with local life, lower prices and a ferry ride instead of a tram." },
    ],
    costs: [
      "One 2026 guide puts mid-range travel at about 2,500 to 3,500 lira a day (roughly 60 to 85 dollars) and budget travel at 2,000 to 2,800 lira, including a bed. Another puts budget rooms at about 40 to 80 euros and good mid-range boutiques at 90 to 150 euros.",
      "A museum pass only pays off if you visit several paid sights quickly. One guide notes that the Istanbul Museum Pass does not cover Hagia Sophia or the Harem, so check what it includes before you buy. Prices climb in the spring and autumn peaks.",
    ],
    extraFaq: [
      { q: "How do I get from Istanbul Airport to Sultanahmet or Taksim?", a: "The Havaist bus is the easiest with luggage, and the M11 metro to Gayrettepe plus the M2 line is the cheapest. A taxi is quickest but costs far more. Allow 45 to 90 minutes depending on traffic." },
      { q: "Do I need an Istanbulkart?", a: "It is the easiest way to pay on metros, trams, buses and ferries, and Havaist buses no longer take cash. You can buy one from machines at the airport." },
    ],
    checked: CHECKED,
  },
  lisbon: {
    gettingAround: [
      "Lisbon airport is only about 7 km from the centre and sits on the red metro line. A trip to the centre takes roughly 20 to 35 minutes. A single metro ride is about 1.90 euros plus a 0.50 euro reusable Navegante card, which replaced the old Viva Viagem card. Loading credit onto the card makes rides slightly cheaper, at about 1.70 euros.",
      "The Aerobus no longer runs, although old guides still mention it. Carris buses 744 and 783 also serve the airport at normal city fares, and a taxi usually costs about 10 to 15 euros. A 24-hour Carris and Metro pass is 7.25 euros.",
      "Lisbon is hilly. Baixa is the flattest area, while Alfama and Bairro Alto involve serious climbing, and trams and funiculars help with the slopes.",
    ],
    whereToStay: [
      { area: "Baixa and Chiado", text: "The flat, central heart of the city with the Baixa-Chiado metro, and the usual first-time pick." },
      { area: "Alfama", text: "Old Lisbon and the home of fado, with narrow, hilly streets." },
      { area: "Bairro Alto and Cais do Sodré", text: "The nightlife areas. Bairro Alto can be noisy until the early hours." },
      { area: "Príncipe Real", text: "Boutique shops and restaurants, quieter than Bairro Alto and a short walk from it." },
      { area: "Saldanha, Estrela and Campo de Ourique", text: "One guide says these offer noticeably better value than Baixa or Chiado for similar quality." },
    ],
    costs: [
      "Estimates vary. One 2026 guide puts the daily budget at about 75 euros for a solo budget traveller and up to 240 euros for mid-range comfort. Central mid-range hotels are listed at roughly 120 to 220 euros a night, and a hostel dorm bed from about 20 to 40 euros.",
      "Lisbon adds a municipal tourist tax per night on top of the room rate, so include it in your total. Summer rooms cost noticeably more than in February or the shoulder months.",
    ],
    extraFaq: [
      { q: "How do I get from Lisbon airport to the city centre?", a: "Take the red metro line from the airport. It reaches central stations in about 20 to 35 minutes for about 1.90 euros plus a 0.50 euro Navegante card. A taxi usually costs about 10 to 15 euros." },
      { q: "Is there an Aerobus from Lisbon airport?", a: "No, it was permanently cancelled in 2022. Use the metro, a Carris bus or a taxi." },
    ],
    checked: CHECKED,
  },
  athens: {
    gettingAround: [
      "Athens airport (ATH) is about 33 km east of the centre. The metro takes about 40 minutes to Syntagma and costs 9 euros, and an airport ticket is separate from the standard city metro ticket. The X95 express bus to Syntagma costs 5.50 euros, runs all day and night and takes about an hour. You can tap a contactless card on the bus.",
      "Official airport taxis charge a flat 40 euros to central Athens from 05:00 to midnight and about 55 euros from midnight to 05:00, including tolls and standard luggage. Trips outside the centre are metered. One source lists a 3-day tourist ticket at 20 euros that includes a return airport trip.",
    ],
    whereToStay: [
      { area: "Plaka", text: "Atmospheric streets at the foot of the Acropolis. It is also one of the more expensive areas." },
      { area: "Koukaki", text: "A residential, leafy area about five minutes from the Acropolis Museum, with good cafés and the best value near the sights." },
      { area: "Monastiraki and Psyrri", text: "Markets, bars and food, with easy metro links." },
      { area: "Syntagma", text: "Central, close to the metro and the airport bus." },
      { area: "Exarchia", text: "More local and alternative, with lower prices. Check your route back after dark." },
    ],
    costs: [
      "Guides disagree. One 2026 budget guide gives a daily range of about 52 euros for a budget solo traveller to 420 euros for luxury, while another suggests about 150 to 200 euros a day for mid-range travel. One guide quotes a combined ticket for seven archaeological sites at about 30 euros.",
      "Greece adds a Climate Resilience Fee per room per night, from about 0.50 to 15 euros depending on the season and type of accommodation. July and August bring the biggest crowds, the highest prices and temperatures above 35 degrees Celsius.",
    ],
    extraFaq: [
      { q: "How do I get from Athens airport to the city centre?", a: "The metro takes about 40 minutes to Syntagma and costs 9 euros. The X95 bus costs 5.50 euros and runs all night. A taxi has a flat fare of 40 euros by day and about 55 euros at night." },
      { q: "Where should I stay in Athens for the first time?", a: "Plaka for atmosphere or Koukaki for a calmer base near the Acropolis. Monastiraki and Psyrri suit food and nightlife, and Syntagma is central for transport." },
    ],
    checked: CHECKED,
  },
  maldives: {
    gettingAround: [
      "Velana International Airport (MLE) is on its own island, Hulhulé, next to the capital Malé. A public ferry to Malé runs every 10 to 15 minutes for about 15 rufiyaa, roughly 1 dollar. From the airport you continue to your island by speedboat, seaplane, domestic flight or a public ferry.",
      "Seaplanes only fly in daylight, so a flight that lands after about 4pm usually means a night near the airport or a speedboat resort instead. Speedboat resorts near Malé save the cost of a seaplane, which guides put at 500 dollars or more. A shared speedboat from Malé to Maafushi is about 25 dollars and takes about 45 minutes.",
      "Public ferries between local islands cost a few dollars, run on limited timetables and do not serve private resorts. One guide notes there is no ferry service on Fridays.",
    ],
    whereToStay: [
      { area: "Resort islands", text: "One island per resort, with overwater villas, house reefs and full board. Transfer type (speedboat or seaplane) changes the total cost a lot." },
      { area: "Local islands and guesthouses", text: "Islands such as Maafushi have small guesthouses and local cafés, and are by far the cheapest way to stay." },
      { area: "Hulhumalé", text: "Next to the airport, handy for a first or last night or a short stopover." },
      { area: "Malé", text: "The crowded capital, mostly used for a day visit rather than a stay." },
    ],
    costs: [
      "Guides disagree. One puts guesthouse rooms on established local islands at about 50 to 150 dollars a night and a guesthouse traveller's day at 60 to 100 dollars. Another lists island guesthouses at 80 to 140 dollars a night on half board, mid-market resorts at 500 to 1,000 dollars and premium resorts from 1,500 dollars.",
      "Quoted prices often leave out taxes. Add a goods and services tax of 16 to 17 percent, a 10 percent service charge, and a green tax charged per person per night. Most guides list it at 6 dollars, and one says it doubled to 12 dollars from 1 October 2026, so check your booking. Many guides also list a departure tax that depends on cabin class.",
    ],
    extraFaq: [
      { q: "How do I get from Malé airport to my island in the Maldives?", a: "It depends on the island. Resorts near Malé use speedboats, farther ones use seaplanes or a domestic flight, and local islands use public or shared speedboats. Ask your hotel which it uses before you book your flight." },
      { q: "Can I reach a Maldives resort if my flight lands in the evening?", a: "Seaplanes do not fly after dark, so late arrivals often need a night in Malé or Hulhumalé, or a speedboat resort." },
    ],
    checked: CHECKED,
  },
  marrakech: {
    gettingAround: [
      "Menara airport (RAK) is about 6 km from the medina. Bus 19 runs every 30 minutes or so to Jemaa el-Fna and Gueliz for 30 dirhams one way and about 50 return. The last departures are usually between about 21:00 and 23:30, so check the posted times.",
      "Taxis have fixed-fare boards at the airport, and guides quote about 70 to 150 dirhams to the medina or Gueliz by day, depending on the source, with higher fares at night. Confirm the price before you board. Cars cannot enter the walled medina, so a riad is reached on foot or by a porter from the nearest gate.",
    ],
    whereToStay: [
      { area: "The medina", text: "A riad inside the walls gives atmosphere and easy walks to Jemaa el-Fna and the souks. Pre-book a pickup to find your door." },
      { area: "Gueliz", text: "The modern district with wide streets, bars and cafés, the train station nearby and easier taxi access." },
      { area: "Hivernage", text: "A quieter, more upmarket area next to Gueliz with hotels that taxis can reach directly." },
      { area: "Kasbah", text: "The southern part of the old town, calmer than the area around Jemaa el-Fna." },
    ],
    costs: [
      "One 2026 guide puts budget travel at about 330 to 930 dirhams a day (roughly 35 dollars) and mid-range at about 930 to 3,270 dirhams. Budget riads and hostels are listed at roughly 15 to 35 dollars a night.",
      "A city tourist tax of 15 to 30 dirhams per person per night, depending on the accommodation, is paid in cash at the end of your stay, so keep some dirhams for check-out. Book the timed Jardin Majorelle ticket ahead because the on-the-day queue is long.",
    ],
    extraFaq: [
      { q: "How do I get from Marrakech airport to the medina?", a: "Bus 19 costs 30 dirhams and takes about 30 minutes, and a taxi usually costs about 70 to 150 dirhams. You then walk to a riad, because cars cannot reach most medina doors." },
      { q: "Is there a tourist tax in Marrakech?", a: "Yes, a city tax of about 15 to 30 dirhams per person per night, depending on the accommodation, usually paid in cash when you check out." },
    ],
    checked: CHECKED,
  },
  "cape-town": {
    gettingAround: [
      "Cape Town International (CPT) is about 20 km from the City Bowl and the V&A Waterfront. Uber and Bolt are widely used and guides quote roughly 180 to 350 rand to the centre, with metered airport taxis higher. Sources disagree on MyCiTi: some describe an airport bus to the Civic Centre in about 30 minutes for roughly 80 to 120 rand, while one mid-2026 report says there is currently no direct airport service. Check before relying on it.",
      "Inside the city MyCiTi buses link the centre, the Waterfront, Sea Point and Camps Bay, but not the winelands. A day pass is listed at 60 to 90 rand. Uber from the centre to Camps Bay is roughly 60 to 120 rand, and renting a car is the easiest way to see the Cape Peninsula.",
    ],
    whereToStay: [
      { area: "V&A Waterfront", text: "Walkable, with restaurants and shops, and a common first-time base." },
      { area: "City Bowl and Gardens", text: "Central, close to Table Mountain's cable car and many restaurants." },
      { area: "Sea Point and Green Point", text: "A seafront promenade, with the Waterfront within walking distance." },
      { area: "Camps Bay", text: "A beachfront strip under the mountains. Windy in January and February." },
      { area: "Woodstock", text: "Street art, cafés and markets, with a more local feel." },
    ],
    costs: [
      "One guide puts hostel dorm beds at about 200 to 450 rand a night and backpacker days at 50 to 80 dollars. A Camps Bay beachfront villa can reach 8,000 rand a night or more, so the price gap is large.",
      "Wine tastings are listed at about 50 to 150 rand, and Uber is cheap compared with Europe. Car hire is about 750 rand a day before fuel and insurance. Cape Town has a high crime rate, so use ride-hailing at night.",
    ],
    extraFaq: [
      { q: "How do I get from Cape Town airport to the city centre?", a: "Uber or Bolt costs roughly 180 to 350 rand and takes about 25 to 45 minutes. Check whether the MyCiTi airport bus is running, because reports differ." },
      { q: "Where should I stay in Cape Town?", a: "The V&A Waterfront or Sea Point for an easy first stay, the City Bowl for central access, and Camps Bay for the beach." },
    ],
    checked: CHECKED,
  },
  cairo: {
    gettingAround: [
      "Cairo International (CAI) is about 22 km northeast of Downtown. Uber and Careem are widely recommended for the ride and cost roughly 3 to 4 pounds, taking 45 to 90 minutes depending on traffic. Official airport taxis are listed at about 200 to 350 Egyptian pounds, and unofficial offers cost more.",
      "Within the city, the metro is very cheap, with fares of only a few Egyptian pounds, and Line 2 reaches Giza. Uber is the practical choice for the pyramids and the Grand Egyptian Museum, which sit next to each other. Several guides advise a licensed guide for the Giza day.",
    ],
    whereToStay: [
      { area: "Downtown", text: "Faded belle époque streets, most of the hostels, the Egyptian Museum and two metro lines. Noisy but very central." },
      { area: "Zamalek", text: "An island in the Nile with greenery, galleries and cafés, and a calmer place at night." },
      { area: "Giza", text: "Near the pyramids, handy for an early start, but far from Downtown." },
      { area: "Mohandiseen and Dokki", text: "Local, cheaper neighbourhoods with Uber and metro access." },
    ],
    costs: [
      "Lonely Planet lists budget days at about 930 to 1,545 Egyptian pounds (30 to 50 dollars) and mid-range days at 1,545 to 4,640 pounds. Museum or site entry ranges from about 95 to 465 pounds.",
      "Lonely Planet says students under 30 with a valid student ID get 50 percent off at government-run sites. The Grand Egyptian Museum sells timed tickets online, and one 2026 guide says there are no on-site sales since November 2025, so book before you fly.",
    ],
    extraFaq: [
      { q: "How do I get from Cairo airport to the city centre?", a: "Uber or Careem is the easiest, at roughly 3 to 4 pounds sterling and 45 to 90 minutes. Official airport taxis cost about 200 to 350 Egyptian pounds." },
      { q: "Do I need to book Grand Egyptian Museum tickets in advance?", a: "Yes. One 2026 guide says the museum uses timed online tickets and no on-site sales since November 2025, so book before you travel." },
    ],
    checked: CHECKED,
  },
  zanzibar: {
    gettingAround: [
      "Zanzibar airport (ZNZ) is about 5 km from Stone Town, and a taxi usually costs about 10 to 25 dollars and takes 15 to 20 minutes. Transfers to Nungwi, Paje or other beach areas run roughly 35 to 70 dollars and take 30 to 90 minutes. Uber and Grab do not currently operate on the island.",
      "Local minibuses called dala-dalas are the cheapest way across the island, with fares of roughly 500 to 3,000 shillings. Stone Town to Nungwi takes about 90 minutes. For a trip between beaches many visitors hire a taxi for the day instead.",
    ],
    whereToStay: [
      { area: "Stone Town", text: "The UNESCO-listed old town with alleys, rooftop restaurants and restored merchant houses. Most visitors spend two or three nights here." },
      { area: "Nungwi and Kendwa", text: "The north tip, with the most popular beaches and a lively atmosphere." },
      { area: "Paje and Jambiani", text: "East coast beaches known for kitesurfing and a boutique feel." },
      { area: "Matemwe", text: "A quieter north-east base for diving and Mnemba Island trips." },
      { area: "Michamvi and Bwejuu", text: "Sleepy east coast villages with long quiet beaches." },
    ],
    costs: [
      "Guides vary. One puts the daily budget at about 99 dollars for a budget solo traveller and 215 dollars mid-range, while another estimates seven nights land only at 700 to 1,200 dollars budget and 1,400 to 2,600 dollars mid-range for two people sharing. Hostel beds in Stone Town cost about 12 to 14 dollars and mid-range hotels about 70 to 93 dollars.",
      "A tourist visa is sold on arrival, and guides quote 50 dollars for some nationalities and 69 dollars for others, so check yours. Menus at beach resorts are priced for tourists and cost far more than in Stone Town. Peak season is December to February.",
    ],
    extraFaq: [
      { q: "How do I get from Zanzibar airport to Stone Town or Nungwi?", a: "By taxi or pre-booked transfer. Stone Town is about 15 minutes and 10 to 25 dollars. Nungwi is 60 to 90 minutes and about 40 to 60 dollars." },
      { q: "Do I need a visa for Zanzibar?", a: "Most visitors need a tourist visa, which can be bought on arrival or online. Guides quote 50 to 69 dollars depending on nationality." },
    ],
    checked: CHECKED,
  },
  nairobi: {
    gettingAround: [
      "Jomo Kenyatta International (NBO) is about 15 to 18 km from the centre. Uber and Bolt are the easiest option, at roughly 700 to 1,500 shillings to Westlands or the centre and 1,000 to 1,500 to Karen. Official airport taxis cost more, about 1,500 to 3,000 shillings, and bus route 34 costs about 100 shillings but is slow and crowded. Traffic on Mombasa Road is heavy at rush hour.",
      "The SGR train to Mombasa leaves from Nairobi Terminus, about 30 km from the airport, and is a separate station from Nairobi Central Railway Station. Safari operators may use Wilson Airport instead of JKIA, so ask which airport your flight uses.",
    ],
    whereToStay: [
      { area: "Westlands", text: "Restaurants, nightlife and shopping, and an easy all-purpose base for a first stay." },
      { area: "Kilimani and Kileleshwa", text: "Cafés and hostels in the western suburbs, a short Uber from everything." },
      { area: "Karen and Langata", text: "Leafy suburbs near Nairobi National Park, the Giraffe Centre and Karen Blixen Museum, but far from nightlife." },
      { area: "Gigiri", text: "The diplomatic and UN area, quiet and secure." },
    ],
    costs: [
      "Hostelworld notes that safari park fees are usually the biggest single cost. One report puts the Nairobi National Park non-resident adult fee at about 80 dollars per day under the revised schedule from October 2025. The Masai Mara is run by Narok County, which sets its own prices, so check those separately.",
      "Most visitors need an eTA, about 30 US dollars, applied for online before travel. Use Uber or Bolt rather than street taxis, with a prearranged airport transfer costing roughly 25 to 60 dollars.",
    ],
    extraFaq: [
      { q: "How do I get from Nairobi airport to the city centre?", a: "Uber or Bolt is the easiest and costs roughly 700 to 1,500 shillings, taking 25 to 50 minutes. Avoid rush hour on Mombasa Road." },
      { q: "Do I need an eTA to travel to Kenya?", a: "Most visitors apply online for an eTA before flying. One 2026 guide gives the fee as about 30 US dollars, so check the official site for your nationality." },
    ],
    checked: CHECKED,
  },
  "antarctic-peninsula": {
    gettingAround: [
      "There are no commercial flights to Antarctica. Most visitors sail from Ushuaia in Argentina and cross the Drake Passage, which takes around two days each way, and the crossing is included in the cruise price. A sample 12 day voyage lists Buenos Aires on day 1, the flight to Ushuaia and boarding on day 2, two days of Drake, five days among the South Shetland Islands and the Peninsula, and two days back.",
      "Fly-cruise trips skip one or both Drake crossings. A charter flight from Punta Arenas in Chile reaches King George Island in about two hours, and you join the ship there. These trips are shorter, usually 8 to 10 days, and depend on weather windows, so the flight can be delayed or cancelled.",
      "Once there, you get around by ship and Zodiac boat. The expedition leader chooses landings each day based on weather and ice, so the itinerary is a plan, not a promise.",
    ],
    whereToStay: [
      { area: "On the ship", text: "You sleep aboard for the whole voyage. Listings show cabin classes from interior and oceanview up to balcony and suite, and meals are included." },
      { area: "Ushuaia", text: "The main departure port. Most people spend a night here before boarding, since a late flight can cost you the sailing." },
      { area: "Punta Arenas", text: "The base for fly-cruise trips, where the charter flight to King George Island leaves from." },
      { area: "Buenos Aires", text: "Many itineraries start here, with the flight to Ushuaia included in the package." },
    ],
    costs: [
      "Antarctica is expensive because everything is bundled into one voyage. Listings seen in late 2026 range from about 9,600 US dollars per person for a 12 day classic ship to over 12,000 dollars for an 8 day fly-cruise oceanview cabin, with balcony and suite cabins higher.",
      "One 2026 guide says flying the Drake adds roughly 1,500 to 3,000 dollars per person for the charter flight. Last minute discounts exist for unsold berths within about 90 days of sailing, but they are rare, and flights to Ushuaia do not get cheaper to match.",
    ],
    extraFaq: [
      { q: "Can I fly to Antarctica on a normal airline?", a: "No. There are no commercial flights. The nearest option is a charter flight from Punta Arenas to King George Island, about two hours, which is sold as part of a fly-cruise package." },
      { q: "Is the Drake Passage included in the price?", a: "On a ship that sails from Ushuaia, yes. The crossing is part of the voyage, so it is already in the cruise price. International flights to Ushuaia or Buenos Aires are usually separate." },
    ],
    checked: CHECKED,
  },
  "deception-island": {
    gettingAround: [
      "Deception Island is in the South Shetland Islands, which ships reach after the Drake Passage from Ushuaia, around two days. You cannot book it alone. It is a stop on a longer Peninsula voyage.",
      "Different operators place it at different points. One typical itinerary visits it on the way back, just before crossing the Drake again, and another pairs it with Half Moon Island on day 10 of a long trip. Check the day by day plan for the voyage you are looking at.",
      "The island is a flooded caldera with a horseshoe shape, and landings and Zodiac trips depend on weather and the expedition leader's decisions on the day.",
    ],
    whereToStay: [
      { area: "On the ship", text: "There are no hotels at the island. You stay in a cabin on the expedition ship that includes it in its route." },
      { area: "Ushuaia", text: "The usual port to start from. Plan a night here before boarding." },
      { area: "Punta Arenas", text: "Where fly-cruise trips start, with a charter flight to King George Island to meet the ship." },
      { area: "Buenos Aires", text: "A common start of packages, with the flight to Ushuaia included." },
    ],
    costs: [
      "Deception Island has no separate ticket in the listings we checked. The cost is the cost of the voyage, so look at prices for the whole Antarctic Peninsula trip rather than this one stop.",
      "As a guide, one 12 day classic ship voyage from Ushuaia was listed from about 9,600 US dollars per person in 2026, and shorter fly-cruise trips cost more.",
    ],
    extraFaq: [
      { q: "Is Deception Island a separate trip?", a: "No. It is a stop on a voyage from Ushuaia or a fly-cruise trip, usually along with other South Shetland or Peninsula landings. You choose a voyage that includes it." },
      { q: "Why is Deception Island shaped like a horseshoe?", a: "It is a volcanic island whose caldera has flooded with seawater, which gives it the open horseshoe shape that ships sail into." },
    ],
    checked: CHECKED,
  },
  "paradise-bay": {
    gettingAround: [
      "Paradise Bay is on the Antarctic Peninsula and is reached on an expedition voyage from Ushuaia, after about two days across the Drake Passage. It is not sold on its own. It appears in itineraries that cover the Peninsula and often sits near Port Lockroy.",
      "Fly-cruise trips from Punta Arenas to King George Island skip the Drake and join the ship there, which saves time but costs more.",
      "Visits are usually by ship and Zodiac boat, and a National Geographic expedition report notes that weather changes not just day to day but hour to hour, so plans shift.",
    ],
    whereToStay: [
      { area: "On the ship", text: "Your cabin aboard the expedition vessel is where you stay for the whole trip." },
      { area: "Ushuaia", text: "The main port for Peninsula voyages. Arrive at least a day early." },
      { area: "Punta Arenas", text: "The base for fly-cruise trips to King George Island." },
      { area: "Buenos Aires", text: "Where many packages begin, before the flight to Ushuaia." },
    ],
    costs: [
      "There is no separate price for Paradise Bay. It comes with the voyage, and 2026 listings for Peninsula trips run from about 9,600 US dollars per person for a 12 day classic ship upward.",
      "Cabin type changes the price a lot. Listings show interior, oceanview, balcony and suite categories, and a balcony on a short fly-cruise can cost well over 16,000 dollars.",
    ],
    extraFaq: [
      { q: "Do all Antarctic cruises stop at Paradise Bay?", a: "No. Itineraries vary by ship and operator, and the expedition leader decides each day's stops from weather and ice. Ask the operator which Peninsula sites a voyage usually covers." },
      { q: "How do I get to Paradise Bay?", a: "You join a Peninsula cruise, most often from Ushuaia, or a fly-cruise that starts at King George Island. There is no way to reach it independently." },
    ],
    checked: CHECKED,
  },
  "port-lockroy": {
    gettingAround: [
      "Port Lockroy is on Goudier Island, just off the Antarctic mainland, and you reach it on an expedition ship from Ushuaia after about two days across the Drake Passage. Ships often arrive through the Neumayer Channel.",
      "It is a former British research station that is now a museum and post office, so many cruises treat it as a highlight. One operator's wording is that you may get a chance to visit, which fits the reality that weather and ice decide each day.",
      "Fly-cruise trips from Punta Arenas to King George Island skip the Drake and join the ship there.",
    ],
    whereToStay: [
      { area: "On the ship", text: "There is no accommodation at the station. You sleep in your cabin aboard the expedition ship." },
      { area: "Ushuaia", text: "The usual starting port, where you should plan a night before boarding." },
      { area: "Punta Arenas", text: "The base for fly-cruise packages with a charter flight to King George Island." },
      { area: "Buenos Aires", text: "Many packages begin here and include the flight to Ushuaia." },
    ],
    costs: [
      "The cost is the cost of the voyage, since Port Lockroy is one stop on a Peninsula itinerary. 2026 listings run from about 9,600 US dollars per person for a 12 day ship from Ushuaia.",
      "Extras such as drinks, tips and excursions are usually paid on top. Ask your operator what is included before you book.",
    ],
    extraFaq: [
      { q: "What is at Port Lockroy?", a: "A former British research station, now a museum and post office, on Goudier Island. It is also a place to see gentoo penguins, and some cruises make it a first landing." },
      { q: "Can I visit Port Lockroy on any Antarctic cruise?", a: "Not on all of them. It depends on the itinerary, weather and ice, and the expedition leader decides each day. Ask the operator if it is a regular stop on your voyage." },
    ],
    checked: CHECKED,
  },
  "weddell-sea": {
    gettingAround: [
      "Weddell Sea trips are expeditions, mostly 14 days or longer, leaving from Ushuaia. They cross the Drake Passage, sail east of the Peninsula, and aim for the emperor penguin colony near Snow Hill Island, then often finish on the Peninsula side.",
      "Several operators use helicopters to move from ship to shore near Snow Hill. After landing, one itinerary describes a walk of around 45 minutes to reach the penguins.",
      "Reaching the colony is not guaranteed. One operator says there is less than a 50 percent chance of reaching the Snow Hill rookery, because it depends on sea ice, and it offers other chances to see individual emperors on the edge of the pack ice.",
    ],
    whereToStay: [
      { area: "On the ship", text: "You live aboard an ice-strengthened expedition ship for the whole trip, usually 14 days or more." },
      { area: "Ushuaia", text: "The usual departure port. Plan a night here before boarding." },
      { area: "Buenos Aires", text: "Where many packages begin, before the flight to Ushuaia." },
      { area: "Punta Arenas", text: "Used by fly-cruise options, with a flight to King George Island to join a ship." },
    ],
    costs: [
      "Weddell Sea trips cost more than standard Peninsula cruises because they are longer and use helicopters. Listings seen in 2026 start around 22,800 US dollars for a 14 day voyage and reach about 32,300 for a higher-end version.",
      "Cost is per person and usually does not include international flights to Argentina or Chile.",
    ],
    extraFaq: [
      { q: "When is the best time to see emperor penguins at Snow Hill?", a: "Early in the season. One expedition report describes an early sailing, with a helicopter landing on the fast ice on 5 November, made so guests could see the colony before the penguins leave for the sea." },
      { q: "How big is the Snow Hill emperor colony?", a: "Sources disagree. One travel report gives about 8,000 birds and another operator says around 4,000 breeding pairs, so treat both as rough." },
    ],
    checked: CHECKED,
  },
  cancun: {
    gettingAround: [
      "From Cancun airport (CUN) the cheapest way is the ADO bus, about 140 to 170 pesos (roughly 7 to 10 US dollars) depending on the guide and the stop. Guides disagree on where it ends: one says the downtown ADO station, another says a Hotel Zone terminal at Km 4. Buses run every 30 to 60 minutes, though one report says the Hotel Zone route runs every two hours.",
      "An official airport taxi to the Hotel Zone is about 700 to 900 pesos (40 to 45 dollars) in one 2026 guide. Shared shuttles are around 18 dollars per person and private transfers from about 30 dollars. Agree the price and the currency before you get in any taxi.",
      "Between downtown and the Hotel Zone the R1 and R2 local buses cost around 12 pesos. Uber works in Cancun. Boats to Isla Mujeres leave from Puerto Juarez, and from docks in the Hotel Zone.",
    ],
    whereToStay: [
      { area: "Hotel Zone", text: "A long strip of beachfront resorts. Best for a beach-first trip, with the north and central parts favoured when seaweed is a worry." },
      { area: "Downtown (Centro)", text: "Cheaper hotels, hostels and local food around Parque de las Palapas and the ADO station, with buses to the beach." },
      { area: "Isla Mujeres", text: "A small island 20 minutes by ferry from Cancun, popular for a day trip or a quieter stay." },
      { area: "Playa del Carmen", text: "Further south, reached by ADO bus in roughly an hour, with a lively town centre." },
    ],
    costs: [
      "One 2026 guide gives a round trip ferry to Isla Mujeres at about 33 US dollars and a taxi between the Hotel Zone and downtown at about 26 dollars. Local buses are under 1 dollar.",
      "Prices vary a lot between tourist zones and local streets. December to April has the best weather, and May or late October to November is described as better value.",
    ],
    extraFaq: [
      { q: "Is sargassum a problem in Cancun?", a: "It can be, mostly in summer, and it varies by beach and year. Guides suggest the north Hotel Zone, Isla Mujeres or Cozumel for better odds, and checking beach reports before you book." },
      { q: "Is there an Uber in Cancun?", a: "Yes, Uber works in the city, but airport pickups can be inconsistent. Many visitors use the official airport taxi counter or a pre-booked transfer for the first ride." },
    ],
    checked: CHECKED,
  },
  "los-angeles": {
    gettingAround: [
      "LAX now connects to the Metro rail network through the LAX/Metro Transit Center. A free shuttle runs from the terminals, then the C or K Line, with a Metro fare of 1.75 US dollars that includes two hours of transfers. The FlyAway bus to Union Station is another option, quoted at 9.75 dollars in one guide and 12.75 in another.",
      "Taxis from LAX charge a flat 54.50 dollars to Downtown, plus an airport surcharge of about 4 dollars. Hollywood and Santa Monica are on the meter. Rideshare is quoted at roughly 35 to 55 dollars to Downtown or Hollywood and 25 to 40 to Santa Monica, plus a pickup fee.",
      "Metro fares cap at 5 dollars a day or 18 dollars a week on a TAP card. The B Line reaches Hollywood and the E Line reaches Downtown Santa Monica, but LA is spread out and many visitors still use rideshare or a car.",
    ],
    whereToStay: [
      { area: "Hollywood", text: "Close to the Walk of Fame and the Metro B Line, and a common base for a first visit with no car." },
      { area: "Santa Monica", text: "Beachfront, with the pier and the Metro E Line to Downtown." },
      { area: "Downtown LA", text: "Central for Metro lines and Union Station, with museums and food halls." },
      { area: "Beverly Hills and West Hollywood", text: "More upscale hotels, restaurants and nightlife, and higher prices." },
    ],
    costs: [
      "One 2026 guide puts hostels and budget hotels at roughly 70 to 105 US dollars a night, comfortable 3 to 4 star hotels at 160 to 220, and luxury at 350 to 670 or more. Rates are highest in summer and on event weekends.",
      "Parking at hotels and attractions can add up if you rent a car, so compare that cost against rideshare for your plan.",
    ],
    extraFaq: [
      { q: "Can I visit Los Angeles without a car?", a: "Yes, with limits. Metro rail and buses reach LAX, Hollywood, Downtown and Santa Monica, but the city is spread over many miles, so plan your base around the places you want most." },
      { q: "How do I get from LAX to Hollywood?", a: "By rideshare or taxi for door to door, or by the free LAX shuttle to the Metro Transit Center and the Metro rail lines. A taxi or rideshare is simpler with luggage." },
    ],
    checked: CHECKED,
  },
  "mexico-city": {
    gettingAround: [
      "Uber is the simple airport option. One guide quotes 250 to 400 pesos (about 15 to 24 US dollars) from the airport to Roma or Condesa depending on traffic, and a Lonely Planet writer paid 199 pesos late at night. Authorised airport taxis cost somewhat more. Avoid unmarked taxis.",
      "The Metro costs 5 pesos a ride and the Metrobus 6 pesos, so a day of public transport is only a few pesos. Both need a card, and the Metro is crowded at rush hour with luggage.",
      "In Roma and Condesa you can walk, with Uber for longer hops. Centro Historico works with walking and the Metro.",
    ],
    whereToStay: [
      { area: "Roma Norte", text: "Many cafes and restaurants and easy evening walks, a popular first base." },
      { area: "Condesa", text: "Greener and quieter, next door to Roma." },
      { area: "Centro Historico", text: "Close to the Zocalo and historic sights, best for walking and the Metro." },
      { area: "Polanco", text: "An upscale area with big hotels and museums, where most people use Uber." },
      { area: "Coyoacan", text: "A calmer southern neighbourhood known for Frida Kahlo's Casa Azul." },
    ],
    costs: [
      "One 2026 guide gives budget travellers about 40 to 60 US dollars a day with hostel dorms at 18 to 25 dollars, and mid-range at about 100 to 140 dollars. Another puts the average daily cost in pesos at around 1,050 for a budget trip.",
      "The city is at about 2,240 metres, so take the first day slowly. Casa Azul tickets sell out and are advised weeks ahead.",
    ],
    extraFaq: [
      { q: "Is the altitude a problem in Mexico City?", a: "The city is at about 2,240 metres, and some people feel tired or breathless on the first day. Guides suggest a slow first day, plenty of water and gentle plans until you adjust." },
      { q: "Should I book Frida Kahlo's Casa Azul in advance?", a: "Yes. Guides say it sells out and recommend booking weeks ahead, and one says there are no door sales." },
    ],
    checked: CHECKED,
  },
  "las-vegas": {
    gettingAround: [
      "From Harry Reid Airport (LAS) taxis use zone rates, with one 2026 source giving roughly 21 to 30 US dollars to the Strip. Uber and Lyft are typically about 15 to 35 dollars most of the day but can pass 55 during conventions and busy weekends. Downtown hotels like Circa fall outside the Strip zones and use the meter.",
      "The cheapest option is the RTC bus. Route 109 or the Red Line takes you to a transfer terminal where you change to the Deuce, a 24 hour double-decker that runs along the Strip to Downtown. A 2 hour Strip pass was quoted at 6 dollars and a 24 hour pass at about 8 dollars.",
      "The Strip is longer than it looks, so most visitors mix walking with the Deuce, rideshare or hotel shuttles. A rental car often means a daily parking fee at your resort.",
    ],
    whereToStay: [
      { area: "The Strip", text: "Large casino resorts with shows and restaurants, at the centre of the action." },
      { area: "Downtown (Fremont Street)", text: "Older casinos and cheaper rooms, with the Deuce and CX bus connecting it to the airport." },
      { area: "Off-Strip", text: "Rooms near the Convention Center or the airport are often cheaper than on the Strip." },
      { area: "Near the airport", text: "Hotels close to the airport suit very early or late flights, but are far from the casinos." },
    ],
    costs: [
      "One guide gives daily budgets from about 75 US dollars for budget travellers to over 900 for luxury. Resort fees are charged per night on top of the room rate, and one guide says they can be as high as 50 dollars a day, so check the final price.",
      "Add a service tip for restaurants. A 24 hour RTC pass is about 8 dollars, which is a cheap way to cover the Strip.",
    ],
    extraFaq: [
      { q: "Are resort fees included in the price in Las Vegas?", a: "Often not. They are charged per night on top of the room rate and can appear only at the final step, so compare the full price with fees across hotels before you book." },
      { q: "What is the cheapest way from the airport to the Strip?", a: "The RTC public bus, with a transfer to the Deuce. It costs a few dollars but takes longer and is awkward with large bags, so many people pick a taxi or rideshare." },
    ],
    checked: CHECKED,
  },
  sydney: {
    gettingAround: [
      "Sydney uses the Opal system. Tap on and off with an Opal card or a contactless bank card on trains, metro, buses, ferries and light rail. In 2026 the adult daily cap is 19.30 Australian dollars Monday to Thursday and 9.65 on Friday to Sunday, with a weekly cap of 50.",
      "The airport train is the quickest into the city, but the airport stations charge an access fee that is not covered by the caps. Guides put the trip at roughly 21 to 22 dollars. Walking or taking a bus from Mascot saves most of the fee.",
      "Ferries from Circular Quay, such as the one to Manly, count toward the same cap. Weekends are the best time to go further out because the cap is half the weekday amount.",
    ],
    whereToStay: [
      { area: "CBD and The Rocks", text: "Central for first-timers, close to Circular Quay, the Opera House and the Harbour Bridge." },
      { area: "Bondi and Coogee", text: "Beach suburbs for surf and coastal walks, with a bus or train and bus connection to the city." },
      { area: "Near Central and Kings Cross", text: "Good transport links and nightlife, often cheaper than the CBD." },
      { area: "Newtown", text: "A local-feeling area for longer stays, with cafes and bars." },
    ],
    costs: [
      "Getting around barely dents the budget thanks to the Opal cap. Sydney's best natural sights, including the harbour and beaches, are free, though accommodation and eating out are where costs add up.",
      "One 2026 spending diary recorded a weekend transport spend of about 9 dollars a day. The airport station fee is the main extra.",
    ],
    extraFaq: [
      { q: "Do I need an Opal card in Sydney?", a: "Most adults do not. You can tap on and off with a contactless bank card or phone and get the same daily and weekly caps. Use the same method for a whole journey." },
      { q: "Why is the Sydney airport train more expensive?", a: "The airport stations are privately operated and charge a station access fee on top of the normal fare. It is not covered by the Opal caps." },
    ],
    checked: CHECKED,
  },
  melbourne: {
    gettingAround: [
      "Trams in the central business district and Docklands are free inside the Free Tram Zone, and you do not need to tap on. If your trip starts or ends outside the zone, you must touch on with a myki card.",
      "Myki covers trains, trams and buses. The daily cap is around 11 Australian dollars on weekdays and about 7.60 to 8 on weekends, depending on the source, and the card costs about 6 dollars. The City Circle Tram, route 35, is free and runs a circuit around the centre.",
      "From Melbourne Airport the SkyBus to Southern Cross Station cost 25.90 dollars one way in 2026 and runs between 4am and 1am. SkyBus is not covered by the myki cap.",
    ],
    whereToStay: [
      { area: "CBD", text: "Laneways, arcades and the Free Tram Zone, so most city sights are walkable." },
      { area: "Fitzroy and Collingwood", text: "Bars, live music and cafes just north of the centre, reached by tram." },
      { area: "St Kilda", text: "A beachside area with a backpacker scene, outside the Free Tram Zone." },
      { area: "Southbank and Docklands", text: "Riverside and harbour areas with modern hotels, inside or next to the Free Tram Zone." },
    ],
    costs: [
      "One backpacker guide suggests about 85 Australian dollars a day on a tight budget and about 150 for a comfortable one. Dorm beds start from about 30 dollars on Hostelworld.",
      "The National Gallery of Victoria has free general entry, which helps keep a budget trip cheap.",
    ],
    extraFaq: [
      { q: "Do I need a myki card in Melbourne?", a: "Only if you leave the Free Tram Zone. Inside the CBD and Docklands, trams are free with no card, but you need a myki for trains, buses and trams beyond that area." },
      { q: "How much is the SkyBus from Melbourne Airport?", a: "In 2026 it cost 25.90 Australian dollars one way, with the bus running to Southern Cross Station. Check the operator for current fares." },
    ],
    checked: CHECKED,
  },
  auckland: {
    gettingAround: [
      "Guides disagree on the airport bus. Two 2026 sources say the SkyBus airport express no longer runs and has been replaced by SkyDrive at around 20 New Zealand dollars, taking about 35 minutes to the city, while older articles still quote SkyBus. Check which service is operating before you plan.",
      "The cheapest option is the AirportLink bus to Puhinui Station, then the train into the city. One source gives a 3 zone fare of 6.50 dollars with an AT HOP card or a contactless card. Rideshare is quoted at about 45 to 70 dollars to the CBD.",
      "Buses, trains and inner harbour ferries accept contactless cards or an AT HOP card, which costs 5 dollars. The ferry to Waiheke Island is not discounted with AT HOP.",
    ],
    whereToStay: [
      { area: "CBD and Viaduct", text: "Central for the ferry terminal, Queen Street and the Sky Tower." },
      { area: "Ponsonby", text: "A popular neighbourhood for cafes and restaurants, a short bus ride from the centre." },
      { area: "Parnell", text: "A leafy area near the museum and the Domain, with a calmer feel." },
      { area: "Near the airport", text: "Worth considering for a very early flight or a late arrival." },
    ],
    costs: [
      "Most visitors from visa-free countries need an NZeTA, which one source puts at 17 dollars through the app or 23 online. A tourist levy of 100 New Zealand dollars has applied since October 2024, so combined entry fees are about 117 to 123 dollars.",
      "One 2026 guide gives a budget traveller about 135 dollars a day and mid-range about 450. Another puts a typical day at about 170 dollars. Eating out for every meal is the quickest way to overspend.",
    ],
    extraFaq: [
      { q: "Do I need an NZeTA for Auckland?", a: "Most visa-free travellers do. It is a short electronic travel authority, applied for before you fly, and it is paid together with the tourist levy. Check the official New Zealand immigration site for your passport." },
      { q: "Does SkyBus still run at Auckland Airport?", a: "Sources disagree, and two 2026 guides say it stopped and was replaced by SkyDrive. Check the airport website for the current service before you rely on it." },
    ],
    checked: CHECKED,
  },
  queenstown: {
    gettingAround: [
      "Queenstown Airport is in Frankton, about 8 km from the town centre. The Orbus Route 1 bus runs between the airport, the Frankton interchange and the town. With a Bee Card the fare is around 2 to 2.50 New Zealand dollars, while the cash fare from the airport is about 10. A taxi or Uber is quoted at about 40 to 60 dollars.",
      "A Bee Card costs about 5 dollars and works on other New Zealand bus networks. One guide says it often pays for itself after a single return trip.",
      "Milford Sound is a long day trip. The RealNZ coach and cruise takes about 5 hours each way by coach plus a cruise of 1.5 to 2 hours, with departures from about 6:45am. Some visitors rent a car for Glenorchy and the surrounding valleys.",
    ],
    whereToStay: [
      { area: "Town centre", text: "Walk to restaurants, the lake and tour pick-ups, with the most choice and the highest prices." },
      { area: "Frankton", text: "Close to the airport and the bus interchange, with a quieter feel." },
      { area: "Arrowtown", text: "A historic village outside town, quiet but you need a bus or a car." },
      { area: "Glenorchy", text: "A small settlement at the head of the lake, for scenery and hiking, with limited services." },
    ],
    costs: [
      "Queenstown is expensive. One 2026 guide puts a daily budget from about 116 New Zealand dollars for a budget traveller up to over 1,200 for luxury, depending on how many activities you book.",
      "The Milford Sound day trip from Queenstown starts at about 292 dollars with RealNZ, and another guide says budget day trips cost about 200 to 280 dollars.",
    ],
    extraFaq: [
      { q: "How do I get from Queenstown Airport to the town centre?", a: "Take the Orbus Route 1 bus for the cheapest option with a Bee Card, or a taxi or Uber for a door-to-door ride. The airport is about 8 km from town." },
      { q: "Is Milford Sound worth it as a day trip from Queenstown?", a: "Guides say yes, even in rain, but it is a very long day with several hours on a coach each way. Many visitors stay in Te Anau or take a scenic flight back instead." },
    ],
    checked: CHECKED,
  },
  fiji: {
    gettingAround: [
      "Most visitors arrive at Nadi International Airport on the western side of Viti Levu. Denarau Island is about 20 minutes by car, the Coral Coast is 2 to 2.5 hours, and Suva is about 3.5 hours. Taxis are easy to find in Nadi, and private or shared transfers can be booked in advance.",
      "The yellow Westbus is the cheapest way between Nadi and Denarau, and a Bula Bus hop-on hop-off service links Denarau resorts and the marina.",
      "Island ferries leave from Port Denarau. Mamanuca islands are about 45 to 60 minutes away and Yasawa islands take 2 to 5 hours, or a seaplane. Awesome Adventures sells a Bula Combo Pass valid for 5 to 15 days. Plan at least 4 to 5 hours between a ferry arrival and an international flight.",
    ],
    whereToStay: [
      { area: "Denarau Island", text: "A resort-focused island close to the airport and the ferry terminal." },
      { area: "Coral Coast", text: "Beaches and reefs on the south coast, popular with families." },
      { area: "Mamanuca Islands", text: "Close island resorts reached by a short ferry from Port Denarau." },
      { area: "Yasawa Islands", text: "Remote islands with a wide range of stays, from budget dorms to bures." },
    ],
    costs: [
      "Guides disagree on prices. One puts budget travellers at 50 to 70 US dollars a day and mid-range at 100 to 150, while another puts a mid-range day at about 202 dollars. Budget hostels and economy hotels are about 30 to 50 dollars a night.",
      "Staying on the main island and visiting islands as day trips can cost less than overnight resort stays, but ferry and transfer costs add up.",
    ],
    extraFaq: [
      { q: "How do I get from Nadi Airport to the islands?", a: "Transfer to Port Denarau by road, then take a ferry to the Mamanuca or Yasawa islands. Some ferry companies run coaches from the airport, and seaplanes are another option." },
      { q: "Where should I stay on a first trip to Fiji?", a: "Many first-time visitors split their time between Denarau or the Coral Coast and one island group. Denarau is close to the ferries, while the islands offer quieter beaches." },
    ],
    checked: CHECKED,
  },
  "rio-de-janeiro": {
    gettingAround: [
      "From Galeao airport (GIG) Uber to Copacabana is quoted at about 10 to 18 US dollars (roughly 58 to 70 reais), taking 30 to 60 minutes. Fixed-rate radio taxis cost more, at about 104 reais in one guide. The BRT and metro option is cheap but awkward with bags.",
      "The metro has two main lines that do not reach every tourist area. A group splitting an Uber is often cheaper than the metro per person across the city. One guide recommends Uber rather than street taxis at night in the South Zone.",
      "Christ the Redeemer is reached by the Corcovado train or an official van. Book online, because one guide says queues without a reservation can reach three hours on weekends.",
    ],
    whereToStay: [
      { area: "Copacabana", text: "A long beach with metro access, good value and Sugarloaf close by." },
      { area: "Ipanema and Leblon", text: "Smart beachside areas with restaurants and shops, at higher prices." },
      { area: "Santa Teresa", text: "A hillside artistic area with a historic tram, quiet at night." },
      { area: "Botafogo", text: "A local neighbourhood near the bay with metro access and a growing food scene." },
    ],
    costs: [
      "Guides put budget travellers at about 40 to 60 US dollars a day and mid-range at about 100 to 150. Per-kilo buffets are a cheap lunch, and the beaches are free.",
      "Christ the Redeemer tickets are quoted at about 27 dollars in one guide and more than 186 reais in another, so check the current price when booking.",
    ],
    extraFaq: [
      { q: "Is Rio safe for tourists?", a: "The South Zone neighbourhoods of Copacabana, Ipanema and Botafogo are described as safe for visitors with normal care. Guides advise Uber rather than street taxis at night and watching your belongings." },
      { q: "How do I get from Rio airport to Copacabana?", a: "Uber from Galeao is the common choice, at about 10 to 18 dollars. Radio taxis cost more, and the BRT with metro is cheap but difficult with luggage." },
    ],
    checked: CHECKED,
  },
  "buenos-aires": {
    gettingAround: [
      "Ezeiza airport is just over 30 km from the centre. A pre-booked remis or Uber costs about 25 to 30 US dollars to Recoleta or Palermo in one guide, while another says taxis and remis cost 40 to 50 dollars. A Manuel Tienda Leon shuttle is about 15 to 20 dollars, and the Line 8 city bus is cheapest but slow. Aeroparque is only about 15 minutes from the city.",
      "A SUBE card works on the Subte, buses and suburban rail. The card costs about 1,500 pesos, and a registered card gets lower fares. Since December 2024 the Subte also accepts Visa and Mastercard contactless, though buses still depend on SUBE or on routes that accept contactless.",
      "Uber and Cabify work, and many visitors use them late at night.",
    ],
    whereToStay: [
      { area: "Palermo", text: "Leafy streets, restaurants, craft beer bars and boutique hotels, with Subte Line D." },
      { area: "Recoleta", text: "An elegant area near the cemetery and museums, a common choice for a first visit." },
      { area: "San Telmo", text: "Old cobbled streets, tango and markets, popular with budget travellers." },
      { area: "Microcentro", text: "Central for the Obelisk and transport, busy by day and quiet at night." },
    ],
    costs: [
      "One 2026 guide gives a daily budget from about 36 US dollars for a budget traveller up to 540 for luxury. Hostel dorms in Palermo or San Telmo are about 16 to 21 dollars.",
      "International tourists pay for Recoleta Cemetery by card at about 15 dollars, and a Teatro Colon guided tour is about 26 dollars, per the same guide. Argentine prices move quickly, so check current peso amounts.",
    ],
    extraFaq: [
      { q: "Do I need a SUBE card in Buenos Aires?", a: "It helps. Buses need it, and the Subte now also takes contactless bank cards. A registered SUBE card gets lower fares, which matters on a longer stay." },
      { q: "How do I get from Ezeiza airport to the city?", a: "By remis, taxi or Uber for the easiest ride, or the Tienda Leon shuttle, or the slow Line 8 bus. The airport is over 30 km from the centre, so allow about 45 minutes." },
    ],
    checked: CHECKED,
  },
  cusco: {
    gettingAround: [
      "The airport sits at about 3,310 metres, so do not try to walk with luggage. One guide quotes 15 to 30 Peruvian soles by app or street taxi to the centre and 40 to 70 soles at an official airport counter. Taxis have no meters, so agree the price first.",
      "The historic centre is walkable, but San Blas is uphill and tiring at altitude. Some drivers hesitate to enter the steepest lanes in rain or at night.",
      "For Machu Picchu you need your passport to buy the ticket, and trains leave mostly from Ollantaytambo. One source quotes 50 to 100 US dollars one way for the train, depending on class and season.",
    ],
    whereToStay: [
      { area: "Historic centre", text: "Close to Plaza de Armas, restaurants and tour offices, and the easiest base." },
      { area: "San Blas", text: "A bohemian hillside quarter with galleries and cafes, quieter at night but steep." },
      { area: "Wanchaq and Avenida El Sol", text: "Mid-range hotels near the bus terminals and the main avenue." },
      { area: "San Cristobal", text: "A quiet hillside area above the Plaza de Armas, with views and a steep walk up." },
    ],
    costs: [
      "One guide gives 40 to 60 US dollars a day for backpackers and 80 to 120 for mid-range travellers. The Boleto Turistico costs 130 soles and does not cover Machu Picchu or the Maras salt mines.",
      "A guide says Machu Picchu allows about 4,044 visitors a day in timed slots, so book early. The train and entry make the trip the biggest cost.",
    ],
    extraFaq: [
      { q: "How many days should I spend in Cusco before Machu Picchu?", a: "Guides suggest two days or more in Cusco to adjust to the altitude before heading to the Sacred Valley or Machu Picchu, keeping early days gentle." },
      { q: "Does the Boleto Turistico include Machu Picchu?", a: "No. It covers other Cusco-area sites, costs 130 soles, and does not include Machu Picchu or the Maras salt mines, which need separate tickets." },
    ],
    checked: CHECKED,
  },
  cartagena: {
    gettingAround: [
      "The airport (CTG) is only about 6 km and 15 minutes from the Old Town. There is no airport bus. Taxis use fixed fares, and a kiosk near customs prints the correct fare. Guides quote different amounts: roughly 16,000 to 20,000 Colombian pesos in one, 17,800 in another, and 25,000 to 45,000 in a third, so check the kiosk.",
      "The Old Town and Getsemani are best explored on foot. Taxis within the city rarely have meters, so agree the fare first. Late-night rides cost extra.",
      "The Transcaribe bus costs about 2,300 pesos a ride and is a lot cheaper than a taxi from Bocagrande to the centre.",
    ],
    whereToStay: [
      { area: "Old Town (Centro Historico)", text: "Colonial streets, boutique hotels and romantic dining inside the city walls." },
      { area: "Getsemani", text: "Street art, local bars and cheaper stays, popular with budget travellers." },
      { area: "Bocagrande", text: "High-rise hotels and a city beach, popular with families." },
      { area: "San Diego", text: "A quieter colonial quarter just north of the centre, within the walls." },
    ],
    costs: [
      "One guide says you can get by on 30 to 40 US dollars a day with a dorm in Getsemani around 10, and 60 to 70 a day with a nicer hostel. Another puts mid-range spending at 65 to 80 dollars a day excluding accommodation.",
      "Boat trips to the Rosario Islands, about 45 minutes away, are the biggest extra. Guides say not to book a boat trip every day.",
    ],
    extraFaq: [
      { q: "How hot is Cartagena?", a: "Around 30 degrees Celsius or more year-round, so air conditioning and a pool matter when you choose a hotel." },
      { q: "Which month is driest in Cartagena?", a: "February or early March is described as driest with fewer crowds than the December holiday peak." },
    ],
    checked: CHECKED,
  },
  santiago: {
    gettingAround: [
      "The cheapest airport option is a Centropuerto or Turbus bus, about 2,400 Chilean pesos one way, running every 10 to 15 minutes. Guides disagree on where it ends, naming Los Heroes or Pajaritos on Metro Line 1. Bus 555 to Pajaritos at the normal city fare is another route. A taxi or Uber is quoted at about 25 US dollars.",
      "You need a Bip! card, which costs about 1,550 pesos, for the Metro and buses. Metro fares are about 735 to 895 pesos depending on the time of day, and the bus is a flat 795. Buses do not accept cash. One guide says contactless cards have worked in the Metro since February 2026.",
      "Be careful of fake taxi drivers at the airport. Use the official counters or an app.",
    ],
    whereToStay: [
      { area: "Providencia", text: "Safe, walkable and well connected on Metro Line 1, with many mid-range hotels." },
      { area: "Lastarria", text: "Museums, cafes and a culture-focused base near the centre." },
      { area: "Bellavista", text: "Nightlife and street art at the foot of Cerro San Cristobal." },
      { area: "Las Condes", text: "A business district with larger hotels and shopping." },
    ],
    costs: [
      "One 2026 guide puts daily budgets from about 98 US dollars for a budget solo traveller to 750 for luxury. Metro fares are about 1 dollar and the airport bus about 3 dollars.",
      "Valparaiso is a day trip of about 2 hours, with buses from the Universidad de Santiago station.",
    ],
    extraFaq: [
      { q: "How do I get from Santiago airport to the centre?", a: "Take a Centropuerto or Turbus bus to the Metro, or a taxi or Uber. The airport is about 15 to 20 km from the centre. Avoid unofficial taxi drivers." },
      { q: "Do I need a Bip! card in Santiago?", a: "Yes for buses, since they do not take cash. A Bip! card also works on the Metro and costs about 1,550 pesos. Load it at any Metro station." },
    ],
    checked: CHECKED,
  },
};

export function destinationDetails(slug: string): DestinationDetails | null {
  return DETAILS[slug] ?? null;
}
