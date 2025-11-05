// scripts/normalize-breeds.js
import fs from "fs";

const raw = JSON.parse(fs.readFileSync("data/raw/dogdata.json", "utf-8"));

function rangeToObject(str) {
  // e.g., "10 - 14 years" or "70 - 130"
  if (!str) return null;
  const cleaned = String(str).replace(/[^\d\-–]/g, " ").replace(/\s+/g, " ").trim();
  const m = cleaned.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2]) };
}

function splitCSV(str) {
  if (!str) return [];
  return String(str)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

const normalized = raw.map(b => ({
  id: b.id ?? null,
  name: b.name ?? null,
  breed_group: b.breed_group ?? null,
  bred_for: b.bred_for ?? null,
  life_span: rangeToObject(b.life_span),
  weight: {
    imperial: rangeToObject(b?.weight?.imperial),
    metric: rangeToObject(b?.weight?.metric)
  },
  height: {
    imperial: rangeToObject(b?.height?.imperial),
    metric: rangeToObject(b?.height?.metric)
  },
  temperament: splitCSV(b.temperament),
  origin: splitCSV(b.origin),
  reference_image_id: b.reference_image_id ?? null
}));

fs.writeFileSync("data/clean/dogdata.json", JSON.stringify(normalized, null, 2));
console.log("Wrote data/cleaned/breeds.json with", normalized.length, "records");
