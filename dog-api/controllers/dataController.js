import Dog from '../models/dataModel.js';

// ---------------- Helpers ----------------
const toNum = (v) => (v === null || v === undefined || v === '') ? null : Number(v);
const avg2 = (a, b) => (Number.isFinite(a) && Number.isFinite(b)) ? (a + b) / 2 : null;

const KG_PER_LB = 0.45359237;
const LB_PER_KG = 1 / KG_PER_LB;

const kgToLb = (kg) => Number.isFinite(kg) ? kg * LB_PER_KG : null;
const lbToKg = (lb) => Number.isFinite(lb) ? lb * KG_PER_LB : null;

const getWeightAvgKg = (d) => {
  const mmin = toNum(d?.weight?.metric?.min);
  const mmax = toNum(d?.weight?.metric?.max);
  const iMin = toNum(d?.weight?.imperial?.min);
  const iMax = toNum(d?.weight?.imperial?.max);
  let a = avg2(mmin, mmax);
  if (a === null) {
    const aLb = avg2(iMin, iMax);
    if (aLb !== null) a = lbToKg(aLb);
  }
  return a; // kg or null
};

const getWeightAvgLb = (d) => {
  const kg = getWeightAvgKg(d);
  return kgToLb(kg); // lbs or null
};

const getWeightRangeKg = (d) => {
  const mmin = toNum(d?.weight?.metric?.min);
  const mmax = toNum(d?.weight?.metric?.max);
  if (Number.isFinite(mmin) && Number.isFinite(mmax)) return mmax - mmin;

  const iMin = toNum(d?.weight?.imperial?.min);
  const iMax = toNum(d?.weight?.imperial?.max);
  if (Number.isFinite(iMin) && Number.isFinite(iMax)) return lbToKg(iMax - iMin);

  return null;
};

const getHeightMaxCm = (d) => {
  const hmax = toNum(d?.height?.metric?.max); // cm
  if (Number.isFinite(hmax)) return hmax;

  const himp = toNum(d?.height?.imperial?.max); // inches
  return Number.isFinite(himp) ? himp * 2.54 : null;
};

const getLifeAvgYears = (d) => avg2(toNum(d?.life_span?.min), toNum(d?.life_span?.max));

const getTemperaments = (d) => {
  if (Array.isArray(d?.temperament)) return d.temperament.map((t) => String(t).toLowerCase().trim());
  if (typeof d?.temperament === 'string') {
    return d.temperament.split(',').map((t) => t.toLowerCase().trim());
  }
  return [];
};

const firstNonEmpty = (...vals) => vals.find(v => typeof v === 'string' && v.trim().length > 0) || null;

// generic top by numeric
const topBy = (docs, numericFn) => {
  let best = -Infinity, winners = [];
  for (const d of docs) {
    const v = numericFn(d);
    if (!Number.isFinite(v)) continue;
    if (v > best) { best = v; winners = [d]; }
    else if (v === best) winners.push(d);
  }
  return { best, winners };
};

// ---------------- CRUD ----------------
export const createDog = async (req, res, next) => {
  try {
    const dog = await Dog.create(req.body);
    res.status(201).json(dog);
  } catch (e) { next(e); }
};

export const getDogs = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    res.json(dogs);
  } catch (e) { next(e); }
};

export const getDog = async (req, res, next) => {
  try {
    const { id } = req.params;

    let dog = null;
    if (/^\d+$/.test(id)) {
      dog = await Dog.findOne({ id: Number(id) }).lean();
    } else {
      dog = await Dog.findById(id).lean();
    }
    if (!dog) return res.status(404).json({ message: 'Not found' });
    res.json(dog);
  } catch (e) { next(e); }
};

export const updateDog = async (req, res, next) => {
  try {
    const { id } = req.params;
    let dog;
    if (/^\d+$/.test(id)) {
      dog = await Dog.findOneAndUpdate({ id: Number(id) }, req.body, { new: true, runValidators: true });
    } else {
      dog = await Dog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    }
    if (!dog) return res.status(404).json({ message: 'Not found' });
    res.json(dog);
  } catch (e) { next(e); }
};

export const deleteDog = async (req, res, next) => {
  try {
    const { id } = req.params;
    let dog;
    if (/^\d+$/.test(id)) {
      dog = await Dog.findOneAndDelete({ id: Number(id) });
    } else {
      dog = await Dog.findByIdAndDelete(id);
    }
    if (!dog) return res.status(404).json({ message: 'Not found' });
    res.json({ deleted: true });
  } catch (e) { next(e); }
};

// ---------------- Your 8 Questions ----------------

// 1) Average weight across all dog breeds (returns kg and lbs)
export const qAverageWeightAll = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const perBreedKg = dogs.map(getWeightAvgKg).filter(Number.isFinite);
    const avgKg = perBreedKg.length
      ? perBreedKg.reduce((a, b) => a + b, 0) / perBreedKg.length
      : null;
    res.json({
      question: 'What is the average weight across all dog breeds?',
      answer: avgKg !== null
        ? { kilograms: Number(avgKg.toFixed(2)), pounds: Number(kgToLb(avgKg).toFixed(2)) }
        : null,
      countBreedsUsed: perBreedKg.length
    });
  } catch (e) { next(e); }
};

// 2) Breed(s) with the longest average lifespan
export const qLongestAverageLifespan = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const { best, winners } = topBy(dogs, getLifeAvgYears);
    res.json({
      question: 'Which breed has the longest average lifespan?',
      answer: winners.map(d => ({
        name: d.name,
        avgYears: Number(getLifeAvgYears(d)?.toFixed(2))
      })),
      best
    });
  } catch (e) { next(e); }
};

// 3) Tallest breed (by max height in cm)
export const qTallestBreed = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const { best, winners } = topBy(dogs, getHeightMaxCm);
    res.json({
      question: 'Which breed is the tallest?',
      answer: winners.map(d => ({
        name: d.name,
        maxHeightCm: Number(getHeightMaxCm(d)?.toFixed(2))
      })),
      best
    });
  } catch (e) { next(e); }
};

// 4) Breed group with the heaviest average weight (uses per-breed avg kg)
export const qHeaviestGroupByAvg = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const groups = new Map(); // group -> {sumKg, count}
    for (const d of dogs) {
      const g = d?.breed_group || 'Unknown';
      const kg = getWeightAvgKg(d);
      if (!Number.isFinite(kg)) continue;
      if (!groups.has(g)) groups.set(g, { sum: 0, count: 0 });
      const obj = groups.get(g);
      obj.sum += kg; obj.count += 1;
    }
    const arr = Array.from(groups.entries())
      .map(([group, { sum, count }]) => ({
        group,
        averageKg: Number((sum / count).toFixed(2)),
        averageLb: Number(kgToLb(sum / count).toFixed(2)),
        count
      }))
      .sort((a, b) => b.averageKg - a.averageKg);

    const maxKg = arr.length ? arr[0].averageKg : null;
    const winners = arr.filter(x => x.averageKg === maxKg);

    res.json({
      question: 'Which breed group has the heaviest average weight?',
      answer: winners,
      allGroups: arr
    });
  } catch (e) { next(e); }
};

// 5) Median weight (lbs) of small breeds (< 20 lbs, by per-breed average lbs)
export const qMedianWeightSmallBreeds = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const smallAvgs = dogs
      .map(getWeightAvgLb)
      .filter(v => Number.isFinite(v) && v < 20)
      .sort((a, b) => a - b);

    let median = null;
    if (smallAvgs.length) {
      const mid = Math.floor(smallAvgs.length / 2);
      median = smallAvgs.length % 2 === 0
        ? (smallAvgs[mid - 1] + smallAvgs[mid]) / 2
        : smallAvgs[mid];
    }

    res.json({
      question: 'What is the median weight of small breeds (under 20 lbs)?',
      answer: median !== null ? Number(median.toFixed(2)) : null,
      countBreedsUsed: smallAvgs.length,
      unit: 'lbs',
      note: 'Per-breed average lbs used to determine small-breed set and median.'
    });
  } catch (e) { next(e); }
};

// 6) Breed(s) with the widest weight range between min and max
export const qWidestWeightRange = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const { best, winners } = topBy(dogs, getWeightRangeKg);
    res.json({
      question: 'Which breed has the widest weight range between min and max?',
      answer: winners.map(d => {
        const rangeKg = getWeightRangeKg(d);
        return {
          name: d.name,
          rangeKg: Number(rangeKg?.toFixed(2)),
          rangeLb: Number(kgToLb(rangeKg)?.toFixed(2))
        };
      }),
      bestKg: Number.isFinite(best) ? Number(best.toFixed(2)) : null
    });
  } catch (e) { next(e); }
};

// 7) Count breeds with "intelligent" in temperament (case-insensitive)
export const qCountIntelligentTemperament = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const matches = [];
    for (const d of dogs) {
      const temps = getTemperaments(d);
      if (temps.some(t => t.includes('intelligent'))) matches.push(d.name);
    }
    res.json({
      question: 'How many breeds list "intelligent" in their temperament?',
      answer: matches.length,
      breeds: matches
    });
  } catch (e) { next(e); }
};

// 8) Breeds bred for lapdog purposes
export const qLapdogBreeds = async (_req, res, next) => {
  try {
    const dogs = await Dog.find().lean();
    const out = [];
    for (const d of dogs) {
      const bf = String(firstNonEmpty(d?.bred_for, '') || '').toLowerCase();
      if (!bf) continue;
      // match "lap", "lapdog", or general "companion"
      if (bf.includes('lap') || bf.includes('lapdog') || bf.includes('companion')) {
        out.push({ name: d.name, bred_for: d.bred_for });
      }
    }
    res.json({
      question: 'Which breeds were bred for lapdog purposes?',
      answer: out
    });
  } catch (e) { next(e); }
};
