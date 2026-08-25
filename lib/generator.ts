export type Problem = {
  id: string;
  a: number;
  b: number;
  answer: number;
  format?: "ab" | "ba"; // whether displayed as a × b or b × a
};

export type PracticeMode = "single" | "limited" | "full" | "interactive";

export function generateProblems(opts: {
  mode: PracticeMode;
  count: number;
  fixedMultiplier?: number;
  rangeMin?: number;
  rangeMax?: number;
}): Problem[] {
  const { mode, count } = opts;
  let rangeMin = opts.rangeMin ?? 0;
  let rangeMax = opts.rangeMax ?? 9;

  function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const results: Problem[] = [];

  function pushPair(a: number, b: number) {
    results.push({ id: `${a}x${b}-${results.length}`, a, b, answer: a * b });
  }

  // SINGLE mode: fixed multiplier (M) chosen from 2..9 only.
  // Generate a progression starting at 0: M×0, M×1, ..., M×9 repeated to fill the grid.
  if (mode === "single") {
    const m = opts.fixedMultiplier ?? 2;
    const seq = Array.from({ length: 10 }).map((_, i) => i); // 0..9
    while (results.length < count) {
      for (const n of seq) {
        if (results.length >= count) break;
        pushPair(m, n);
      }
    }
    return results.slice(0, count);
  }

  // Determine ranges for full/limited/interactive modes.
  // For range mode, top multiplicand uses rangeMin..rangeMax.
  // Bottom multiplier defaults to 1..rangeMax unless rangeMin explicitly includes 0.
  let topMin = rangeMin;
  let topMax = rangeMax;
  let bottomMin = rangeMin;
  let bottomMax = rangeMax;

  if (mode === "limited") {
    // Keep provided range
    topMin = opts.rangeMin ?? 0;
    topMax = opts.rangeMax ?? 4;
    bottomMin = Math.max(1, opts.rangeMin ?? 0); // bottom excludes 0 by default in range modes
    bottomMax = opts.rangeMax ?? 4;
  } else if (mode === "full" || mode === "interactive") {
    topMin = opts.rangeMin ?? 0;
    topMax = opts.rangeMax ?? 9;
    // default bottomMin to 1 unless the top range includes 0 explicitly
    bottomMin = topMin === 0 ? 0 : Math.max(1, topMin);
    bottomMax = topMax;
  }

  // Build pool of pairs respecting bottomMin/bottomMax
  const pairs: { a: number; b: number }[] = [];
  for (let a = topMin; a <= topMax; a++) {
    for (let b = bottomMin; b <= bottomMax; b++) {
      pairs.push({ a, b });
    }
  }

  // Shuffle pool
  let pool = shuffle(pairs.slice());

  // Caps for easy facts across the whole worksheet
  const ZERO_CAP = 5; // max problems involving 0
  const ONE_CAP = 8; // max problems involving 1
  let zeroCount = 0;
  let oneCount = 0;

  // Fill results while respecting caps; iterate over pool cyclically
  let attempts = 0;
  let idx = 0;
  while (results.length < count && attempts < 100000) {
    if (pool.length === 0) pool = shuffle(pairs.slice());
    const p = pool[idx % pool.length];
    idx++;
    attempts++;

    const involvesZero = p.a === 0 || p.b === 0;
    const involvesOne = p.a === 1 || p.b === 1;

    if (involvesZero && zeroCount >= ZERO_CAP) {
      // skip this pair
      // but if all remaining pairs would be skipped, we'll eventually relax; continue
      continue;
    }
    if (involvesOne && oneCount >= ONE_CAP) {
      continue;
    }

    pushPair(p.a, p.b);
    if (involvesZero) zeroCount++;
    if (involvesOne) oneCount++;
  }

  // If we couldn't fill due to caps, fill remaining slots with non-zero/non-one pairs, then if necessary relax caps
  if (results.length < count) {
    const fallbackPairs: { a: number; b: number }[] = [];
    for (let a = topMin; a <= topMax; a++) {
      for (let b = bottomMin; b <= bottomMax; b++) {
        const involvesZero = a === 0 || b === 0;
        const involvesOne = a === 1 || b === 1;
        if (!involvesZero && !involvesOne) fallbackPairs.push({ a, b });
      }
    }
    if (fallbackPairs.length === 0) {
      // relax caps: allow any pairs
      for (let a = topMin; a <= topMax; a++) {
        for (let b = bottomMin; b <= bottomMax; b++) fallbackPairs.push({ a, b });
    }
    }

    let j = 0;
    while (results.length < count) {
      const p = fallbackPairs[j % fallbackPairs.length];
      pushPair(p.a, p.b);
      j++;
      if (j > fallbackPairs.length * 1000) break; // safety
    }
  }

  return results.slice(0, count);
}
