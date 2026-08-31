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
  // A rows: M × 0, M × 1, M × 2, M × 3 (pattern repeats)
  // B rows: 0 × M, 1 × M, 2 × M, 3 × M (pattern repeats)
  // C rows: random mix where one multiplier is always 2, NO 0 or 1 multiplicands
  if (mode === "single") {
    const m = Math.max(2, Math.min(9, opts.fixedMultiplier ?? 2));

    // Pattern for a 10-item block: ABCABCABCC
    const pattern = ["A", "B", "C", "A", "B", "C", "A", "B", "C", "C"];
    
    let blockIndex = 0;

    while (results.length < count) {
      for (let i = 0; i < pattern.length && results.length < count; i++) {
        const token = pattern[i];
        let pair: { a: number; b: number } | null = null;

        if (token === "A") {
          // A row: M × 0, M × 1, M × 2, M × 3 (cycling)
          const n = i % 4;
          pair = { a: m, b: n };
        } else if (token === "B") {
          // B row: 0 × M, 1 × M, 2 × M, 3 × M (cycling)
          const n = i % 4;
          pair = { a: n, b: m };
        } else {
          // token === "C": random mix where one multiplier is always 2, NO 0 or 1
          // Generate pairs with 2 as one factor, but other factor must be 2-9
          let attempts = 0;
          while (attempts < 100) {
            const isATwo = Math.random() > 0.5;
            let candidate: { a: number; b: number };
            
            if (isATwo) {
              // a = 2, b is random 2-9 (no 0 or 1)
              candidate = { a: 2, b: Math.floor(Math.random() * 8) + 2 };
            } else {
              // b = 2, a is random 2-9 (no 0 or 1)
              candidate = { a: Math.floor(Math.random() * 8) + 2, b: 2 };
            }

            // Check if already used in results
            if (results.some((r) => r.a === candidate.a && r.b === candidate.b)) {
              attempts++;
              continue;
            }

            pair = candidate;
            break;
          }

          if (!pair) {
            // Fallback: find any allowed pair with 2 as one multiplier (both factors 2-9)
            for (let x = 2; x <= 9; x++) {
              for (const [a, b] of [[2, x], [x, 2]]) {
                if (results.some((r) => r.a === a && r.b === b)) continue;
                pair = { a, b };
                break;
              }
              if (pair) break;
            }
          }
        }

        if (!pair) continue;

        pushPair(pair.a, pair.b);
      }

      blockIndex++;

      // Safety: prevent infinite loop
      if (blockIndex > 1000) break;
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
      continue;
    }
    if (involvesOne && oneCount >= ONE_CAP) {
      continue;
    }

    // avoid duplicates
    if (results.some((r) => r.a === p.a && r.b === p.b)) continue;

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
