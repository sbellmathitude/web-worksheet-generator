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
  // Generate using ABCABCABCC pattern per 10-row block to ensure variety.
  if (mode === "single") {
    const m = Math.max(2, Math.min(9, opts.fixedMultiplier ?? 2));

    // Build ordered A and B lists (n = 0..9)
    const A = Array.from({ length: 10 }).map((_, i) => ({ a: m, b: i }));
    const B = Array.from({ length: 10 }).map((_, i) => ({ a: i, b: m }));

    // Candidate pool for C: mix of A and B, shuffled; we'll draw from it without repeating pairs
    const candidates = shuffle(
      Array.from(new Set([...A, ...B].map((p) => `${p.a}x${p.b}`))).map((key) => {
        const [as, bs] = key.split("x").map(Number);
        return { a: as, b: bs };
      })
    );

    // caps
    const ZERO_CAP = 5;
    const ONE_CAP = 8;
    let zeroCount = 0;
    let oneCount = 0;

    const pattern = ["A", "B", "C", "A", "B", "C", "A", "B", "C", "C"]; // 10 items

    let blockIndex = 0;
    let candidateIdx = 0;

    while (results.length < count) {
      // For each block of 10, produce items according to pattern using index i
      for (let i = 0; i < pattern.length && results.length < count; i++) {
        const token = pattern[i];
        let pair: { a: number; b: number } | null = null;

        if (token === "A") pair = A[blockIndex % A.length];
        else if (token === "B") pair = B[blockIndex % B.length];
        else {
          // token === "C" => pick next candidate that isn't already used
          let attempts = 0;
          while (attempts < candidates.length) {
            const cand = candidates[candidateIdx % candidates.length];
            candidateIdx++;
            attempts++;
            // check if already used
            const exists = results.some((r) => r.a === cand.a && r.b === cand.b);
            if (exists) continue;
            pair = cand;
            break;
          }
          // if none found, fallback to some A or B that isn't used
          if (!pair) {
            const fallback = [...A, ...B].find((p) => !results.some((r) => r.a === p.a && r.b === p.b));
            if (fallback) pair = fallback;
          }
        }

        if (!pair) continue; // nothing to push (shouldn't happen)

        // enforce caps: count any appearance of 0 or 1 in either factor
        const involvesZero = pair.a === 0 || pair.b === 0;
        const involvesOne = pair.a === 1 || pair.b === 1;
        if (involvesZero && zeroCount >= ZERO_CAP) {
          // try to find an alternative non-zero pair
          const alt = [...A, ...B, ...candidates].find((p) => !(p.a === 0 || p.b === 0) && !results.some((r) => r.a === p.a && r.b === p.b));
          if (alt) pair = alt;
          else continue; // skip if truly cannot find
        }
        if (involvesOne && oneCount >= ONE_CAP) {
          const alt = [...A, ...B, ...candidates].find((p) => !(p.a === 1 || p.b === 1) && !results.some((r) => r.a === p.a && r.b === p.b));
          if (alt) pair = alt;
          else continue;
        }

        // avoid exact duplicates
        if (results.some((r) => r.a === pair!.a && r.b === pair!.b)) continue;

        // push and update counts
        pushPair(pair.a, pair.b);
        if (pair.a === 0 || pair.b === 0) zeroCount++;
        if (pair.a === 1 || pair.b === 1) oneCount++;
      }

      blockIndex++;

      // safety: if we loop too many times without filling, break and fill with fallback
      if (blockIndex > 1000) break;
    }

    // If still short, fill with any remaining allowed pairs (respecting caps if possible)
    if (results.length < count) {
      const pool: { a: number; b: number }[] = [];
      for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) pool.push({ a, b });
      let pIdx = 0;
      while (results.length < count && pIdx < pool.length) {
        const p = pool[pIdx++];
        if (results.some((r) => r.a === p.a && r.b === p.b)) continue;
        const involvesZero = p.a === 0 || p.b === 0;
        const involvesOne = p.a === 1 || p.b === 1;
        if (involvesZero && zeroCount >= ZERO_CAP) continue;
        if (involvesOne && oneCount >= ONE_CAP) continue;
        pushPair(p.a, p.b);
        if (involvesZero) zeroCount++;
        if (involvesOne) oneCount++;
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
