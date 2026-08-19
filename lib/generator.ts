export type Problem = {
  id: string;
  a: number;
  b: number;
  answer: number;
};

export type PracticeMode = "single" | "limited" | "full";

export function generateProblems(opts: {
  mode: PracticeMode;
  count: number;
  fixedMultiplier?: number;
  rangeMin?: number;
  rangeMax?: number;
}): Problem[] {
  const { mode, count } = opts;
  let rangeMin = opts.rangeMin ?? 2;
  let rangeMax = opts.rangeMax ?? 9;

  function allPairs(min: number, max: number) {
    const pairs: { a: number; b: number }[] = [];
    for (let a = min; a <= max; a++) {
      for (let b = min; b <= max; b++) pairs.push({ a, b });
    }
    return pairs;
  }

  function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const results: Problem[] = [];

  if (mode === "single") {
    const m = opts.fixedMultiplier ?? 2;
    const multiplicands = [];
    for (let b = 1; b <= 9; b++) multiplicands.push(b);
    let pool = shuffle(multiplicands.map((b) => ({ a: m, b })));
    while (results.length < count) {
      if (pool.length === 0) pool = shuffle(multiplicands.map((b) => ({ a: m, b })));
      const p = pool.pop()!;
      results.push({
        id: `${p.a}x${p.b}-${results.length}`,
        a: p.a,
        b: p.b,
        answer: p.a * p.b
      });
    }
    return results;
  }

  if (mode === "limited") {
    rangeMin = opts.rangeMin ?? 2;
    rangeMax = opts.rangeMax ?? 5;
  } else if (mode === "full") {
    rangeMin = opts.rangeMin ?? 2;
    rangeMax = opts.rangeMax ?? 9;
  }

  const pairs = allPairs(rangeMin, rangeMax);
  let pool = shuffle(pairs.slice());

  while (results.length < count) {
    if (pool.length === 0) pool = shuffle(pairs.slice());
    const p = pool.pop()!;
    results.push({
      id: `${p.a}x${p.b}-${results.length}`,
      a: p.a,
      b: p.b,
      answer: p.a * p.b
    });
  }

  return results;
}
