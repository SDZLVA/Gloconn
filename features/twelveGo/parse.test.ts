import { test } from "node:test";
import assert from "node:assert/strict";
import { minutesOf, parseTwelveGoTimetable, pricesOf, twelveGoDateLink } from "@/features/twelveGo/parse";

// Trimmed from the real answer for Bangkok → Chiang Mai (2026-11-10).
const HTML = `<div class="one2go-route-container">
<div class="one2go-route-header"><a target="_blank" href="https://12go.asia/en/travel/bangkok/chiang-mai?z=17465383&amp;curr=EUR">Bangkok - Chiang Mai</a>
<a class="one2go-buy-button" target="_blank" href="https://12go.asia/en/travel/bangkok/chiang-mai?z=17465383&amp;curr=EUR">More info / Tickets</a></div>
<table class="one2go-timetable"><tbody>
<tr><td class="one2go-route-name" colspan="2">
  <a target="_blank" href="https://12go.asia/en/avia/bangkok/chiang-mai?z=17465383&amp;curr=EUR">Flight Bangkok - Chiang Mai</a>
  <span class="one2go-route-info"><span class="one2go-route-price"> € 44.29–167.81 </span>
  <span class="one2go-route-duration"> 1h 15m – 6h </span></span></td></tr>
<tr><td class="one2go-trips" colspan="2"><ul>
  <li><b class="one2go-right">→</b>&nbsp;<span class="one2go-class">Economy</span><span class="one2go-departures">06:10, 06:15, 22:35</span></li>
  <li><b class="one2go-right">→</b>&nbsp;<span class="one2go-class">Business</span><span class="one2go-departures">06:30</span></li>
</ul></td></tr>
<tr><td class="one2go-route-name" colspan="2">
  <a target="_blank" href="https://12go.asia/en/train/bangkok/chiang-mai?z=17465383&amp;curr=EUR">Train Bangkok - Chiang Mai</a>
  <span class="one2go-route-info"><span class="one2go-route-price"> € 7.42–30.36 </span>
  <span class="one2go-route-duration"> 10h 10m &ndash; 13h 50m </span></span></td></tr>
<tr><td class="one2go-trips" colspan="2"><ul>
  <li><span class="one2go-class">2nd Class Sleeper AC</span><span class="one2go-departures">14:32, 18:40</span></li>
</ul></td></tr>
<tr><td class="one2go-route-name" colspan="2"><a href="https://evil.example/x">Bus Bangkok - Chiang Mai</a><span class="one2go-route-price">€ 1</span></td></tr>
</tbody></table></div>
<div class="one2go-route-container">
<div class="one2go-route-header"><a target="_blank" href="https://12go.asia/en/travel/don-mueang-airport/chiang-mai?z=17465383&amp;curr=EUR">Don Mueang Airport - Chiang Mai</a></div>
<table class="one2go-timetable"><tbody>
<tr><td class="one2go-route-name" colspan="2"><a href="https://12go.asia/en/avia/don-mueang-airport/chiang-mai?z=17465383&amp;curr=EUR">Flight Don Mueang Airport - Chiang Mai</a><span class="one2go-route-price">€ 36.73–58.28</span><span class="one2go-route-duration">1h 10m – 1h 20m</span></td></tr>
</tbody></table></div>`;

test("parses city pairs, modes, prices, durations, classes and departures", () => {
  const routes = parseTwelveGoTimetable(HTML);
  assert.equal(routes.length, 2);
  assert.equal(routes[0].name, "Bangkok - Chiang Mai");
  const [flight, train] = routes[0].options;
  assert.equal(routes[0].options.length, 2, "non-12Go links are dropped");
  assert.equal(flight.mode, "avia");
  assert.equal(flight.priceMin, 44.29);
  assert.equal(flight.priceMax, 167.81);
  assert.equal(flight.durationMin, 75);
  assert.equal(flight.durationMax, 360);
  assert.deepEqual(flight.classes[0], { name: "Economy", departures: ["06:10", "06:15", "22:35"] });
  assert.equal(train.mode, "train");
  assert.equal(train.link, "https://12go.asia/en/train/bangkok/chiang-mai?z=17465383&curr=EUR");
  assert.equal(train.classes[0].name, "2nd Class Sleeper AC");
  assert.equal(train.durationMax, 830, "&ndash; between durations");
  assert.equal(routes[1].options[0].priceMin, 36.73);
});

test("helpers", () => {
  assert.equal(minutesOf("10h 10m"), 610);
  assert.equal(minutesOf("6h"), 360);
  assert.equal(minutesOf("45m"), 45);
  assert.deepEqual(pricesOf("€ 1,250.50–2,000"), [1250.5, 2000]);
  assert.equal(
    twelveGoDateLink("https://12go.asia/en/bus/bangkok/chiang-mai?z=17465383&curr=EUR", "2026-11-20"),
    "https://12go.asia/en/bus/bangkok/chiang-mai?z=17465383&curr=EUR&date=2026-11-20",
  );
  assert.deepEqual(parseTwelveGoTimetable("<p>nothing</p>"), []);
});
