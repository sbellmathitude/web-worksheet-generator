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

  // helper to push pair
  function pushPair(a: number, b: number) {
    results.push({ id: `${a}x${b}-${results.length}`, a, b, answer: a * b });
  }

  if (mode === "single") {
    const m = opts.fixedMultiplier ?? 2;

    // Build 10x10 rows with the requested pattern:
    // rows 1,4,7 : left-to-right show M×1..M×10 (format ab)
    // rows 2,5,8 : left-to-right show 1×M..10×M (format ba)
    // rows 3,6,9 : random rows (mix of a×M and M×a)
    // row 10 : random

    const multiplicands = Array.from({ length: 10 }).map((_, i) => (i + 1) % 10); // 1..9,0 mapped to 1..9,0? adjust to 0..9
    // better: use 0..9 sequence
    const seq = Array.from({ length: 10 }).map((_, i) => i); // 0..9

    for (let row = 1; row <= 10; row++) {
      if (row % 3 === 1) {
        // M × n, n = 1..10 -> use 1..9,0 order rotated: we'll use 1..9,0 (i.e., 1..9 then 0)
        const order = [...Array.from({ length: 9 }, (_, i) => i + 1), 0];
        for (const n of order) pushPair(m, n);
      } else if (row % 3 === 2) {
        // n × M
        const order = [...Array.from({ length: 9 }, (_, i) => i + 1), 0];
        for (const n of order) pushPair(n, m);
      } else {
        // random mix of 10 items
        const pool = Array.from({ length: 100 }, () => ({
          a: Math.floor(Math.random() * 10),
          b: m
        }));
        for (let i = 0; i < 10; i++) {
          const p = pool[i];
          // randomly choose format
          if (Math.random() < 0.5) pushPair(p.a, p.b);
          else pushPair(p.b, p.a);
        }
      }
    }

    // ensure length is exactly count
    return results.slice(0, count);
  }

  // For limited/full range modes
  if (mode === "limited") {
    rangeMin = opts.rangeMin ?? 0;
    rangeMax = opts.rangeMax ?? 4;
  } else if (mode === "full" || mode === "interactive") {
    rangeMin = opts.rangeMin ?? 0;
    rangeMax = opts.rangeMax ?? 9;
  }

  const pairs: { a: number; b: number }[] = [];
  for (let a = rangeMin; a <= rangeMax; a++) {
    for (let b = rangeMin; b <= rangeMax; b++) pairs.push({ a, b });
  }

  let pool = shuffle(pairs.slice());

  while (results.length < count) {
    if (pool.length === 0) pool = shuffle(pairs.slice());
    const p = pool.pop()!;
    pushPair(p.a, p.b);
  }

  return results;
}
