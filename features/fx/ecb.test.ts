import { test } from "node:test";
import assert from "node:assert/strict";
import { convertAmount, parseEcbXml } from "@/features/fx/ecb";

const XML = `<Cube><Cube time='2026-11-05'><Cube currency='USD' rate='1.0800'/><Cube currency='GBP' rate='0.8500'/></Cube></Cube>`;

test("parseEcbXml reads rates per euro", () => {
  assert.deepEqual(parseEcbXml(XML), { EUR: 1, USD: 1.08, GBP: 0.85 });
});

test("convertAmount converts through the euro", () => {
  const rates = parseEcbXml(XML);
  assert.equal(convertAmount(85, "GBP", "EUR", rates), 100);
  assert.equal(convertAmount(100, "EUR", "USD", rates), 108);
  assert.equal(convertAmount(50, "GBP", "GBP", rates), 50);
  assert.equal(convertAmount(10, "XYZ", "EUR", rates), null);
});
