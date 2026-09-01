export type Problem = {
  id: string;
  a: number;
  b: number;
  answer: number;
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
  // Pattern: ABCABCABCC (10-item repeating block)
  // A: M × 0, M × 1, M × 2, M × 3 (always in order: 0,1,2,3,0,1,2,3,...)
  // B: 0 × M, 1 × M, 2 × M, 3 × M (always in order: 0,1,2,3,0,1,2,3,...)
  // C: random mix involving M with other multiplicands 2–9 (no 0 or 1)
  if (mode === "single") {
    const m = Math.max(2, Math.min(9, opts.fixedMultiplier ?? 2));
    const pattern = ["A", "B", "C", "A", "B", "C", "A", "B", "C", "C"];
    
    let aCycle = 0; // 0, 1, 2, 3 cycling for A rows
    let bCycle = 0; // 0, 1, 2, 3 cycling for B rows

    while (results.length < count) {
      for (let i = 0; i < pattern.length && results.length < count; i++) {
        const token = pattern[i];
        let pair: { a: number; b: number } | null = null;

        if (token === "A") {
          // A row: M × aCycle, then increment
          pair = { a: m, b: aCycle };
          aCycle = (aCycle + 1) % 4;
        } else if (token === "B") {
          // B row: bCycle × M, then increment
          pair = { a: bCycle, b: m };
          bCycle = (bCycle + 1) % 4;
        } else {
          // C row: random involving M, other factor 2–9
          let attempts = 0;
          while (attempts < 100) {
            const isAM = Math.random() > 0.5;
            let candidate: { a: number; b: number };

            if (isAM) {
              // a = M, b is random 2–9
              candidate = { a: m, b: Math.floor(Math.random() * 8) + 2 };
            } else {
              // b = M, a is random 2–9
              candidate = { a: Math.floor(Math.random() * 8) + 2, b: m };
            }

            // Avoid duplicates
            if (results.some((r) => r.a === candidate.a && r.b === candidate.b)) {
              attempts++;
              continue;
            }

            pair = candidate;
            break;
          }

          // Fallback if random fails
          if (!pair) {
            for (let x = 2; x <= 9; x++) {
              for (const [a, b] of [[m, x], [x, m]]) {
                if (results.some((r) => r.a === a && r.b === b)) continue;
                pair = { a, b };
                break;
              }
              if (pair) break;
            }
          }
        }

        if (pair) pushPair(pair.a, pair.b);
      }
    }

    return results.slice(0, count);
  }

  // Full/limited/interactive modes
  let topMin = rangeMin;
  let topMax = rangeMax;
  let bottomMin = rangeMin;
  let bottomMax = rangeMax;

  if (mode === "limited") {
    topMin = opts.rangeMin ?? 0;
    topMax = opts.rangeMax ?? 4;
    bottomMin = Math.max(1, opts.rangeMin ?? 0);
    bottomMax = opts.rangeMax ?? 4;
  } else if (mode === "full" || mode === "interactive") {
    topMin = opts.rangeMin ?? 0;
    topMax = opts.rangeMax ?? 9;
    bottomMin = topMin === 0 ? 0 : Math.max(1, topMin);
    bottomMax = topMax;
  }

  const pairs: { a: number; b: number }[] = [];
  for (let a = topMin; a <= topMax; a++) {
    for (let b = bottomMin; b <= bottomMax; b++) {
      pairs.push({ a, b });
    }
  }

  let pool = shuffle(pairs.slice());

  const ZERO_CAP = 5;
  const ONE_CAP = 8;
  let zeroCount = 0;
  let oneCount = 0;

  let attempts = 0;
  let idx = 0;
  while (results.length < count && attempts < 100000) {
    if (pool.length === 0) pool = shuffle(pairs.slice());
    const p = pool[idx % pool.length];
    idx++;
    attempts++;

    const involvesZero = p.a === 0 || p.b === 0;
    const involvesOne = p.a === 1 || p.b === 1;

    if (involvesZero && zeroCount >= ZERO_CAP) continue;
    if (involvesOne && oneCount >= ONE_CAP) continue;
    if (results.some((r) => r.a === p.a && r.b === p.b)) continue;

    pushPair(p.a, p.b);
    if (involvesZero) zeroCount++;
    if (involvesOne) oneCount++;
  }

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
      for (let a = topMin; a <= topMax; a++) {
        for (let b = bottomMin; b <= bottomMax; b++) fallbackPairs.push({ a, b });
      }
    }

    let j = 0;
    while (results.length < count) {
      const p = fallbackPairs[j % fallbackPairs.length];
      pushPair(p.a, p.b);
      j++;
      if (j > fallbackPairs.length * 1000) break;
    }
  }

  return results.slice(0, count);
}
