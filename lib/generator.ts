export type Operation = "multiplication" | "division" | "addition" | "subtraction";

export type Problem = {
  id: string;
  a: number;
  b: number;
  answer: number;
  operation?: Operation;
};

export type PracticeMode = "single" | "limited" | "full" | "interactive";

export type SkillRuleSet = {
  min: number;
  max: number;
  fixedOperand?: number;
  allowNegativeAnswers?: boolean;
  requireWholeNumberAnswer?: boolean;
  zeroCap?: number;
  oneCap?: number;
  avoidDuplicates?: boolean;
};

export type SkillDefinition = {
  id: string;
  label: string;
  operation: Operation;
  practiceMode: Exclude<PracticeMode, "interactive">;
  gradeTags: string[];
  description: string;
  rules: SkillRuleSet;
};

export type GenerateProblemsOptions = {
  mode: PracticeMode;
  count: number;
  operation?: Operation;
  skillId?: string;
  fixedMultiplier?: number;
  rangeMin?: number;
  rangeMax?: number;
  allowNegativeAnswers?: boolean;
};

const DEFAULT_ZERO_CAP = 5;
const DEFAULT_ONE_CAP = 8;

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createProblem(operation: Operation, a: number, b: number, index: number): Problem {
  return {
    id: `${operation}-${a}-${b}-${index}`,
    a,
    b,
    answer: solve(operation, a, b),
    operation,
  };
}

function solve(operation: Operation, a: number, b: number) {
  switch (operation) {
    case "addition":
      return a + b;
    case "subtraction":
      return a - b;
    case "division":
      return b === 0 ? 0 : a / b;
    case "multiplication":
    default:
      return a * b;
  }
}

export const SKILL_DEFINITIONS: SkillDefinition[] = [
  ...Array.from({ length: 8 }, (_, index) => {
    const multiplier = index + 2;
    return {
      id: `multiplication-single-${multiplier}`,
      label: `Single: ${multiplier}`,
      operation: "multiplication" as const,
      practiceMode: "single" as const,
      gradeTags: ["3", "4"],
      description: `Single-digit multiplication facts for ${multiplier}s.`,
      rules: {
        min: 0,
        max: 9,
        fixedOperand: multiplier,
        zeroCap: DEFAULT_ZERO_CAP,
        oneCap: DEFAULT_ONE_CAP,
        avoidDuplicates: false,
      },
    };
  }),
  {
    id: "multiplication-range-2-5",
    label: "Range: 2–5",
    operation: "multiplication",
    practiceMode: "full",
    gradeTags: ["3"],
    description: "Mixed multiplication facts using factors 2 through 5.",
    rules: {
      min: 2,
      max: 5,
      zeroCap: DEFAULT_ZERO_CAP,
      oneCap: DEFAULT_ONE_CAP,
      avoidDuplicates: true,
    },
  },
  {
    id: "multiplication-range-2-9",
    label: "Range: 2–9",
    operation: "multiplication",
    practiceMode: "full",
    gradeTags: ["3", "4"],
    description: "Mixed multiplication facts using factors 2 through 9.",
    rules: {
      min: 2,
      max: 9,
      zeroCap: DEFAULT_ZERO_CAP,
      oneCap: DEFAULT_ONE_CAP,
      avoidDuplicates: true,
    },
  },
  {
    id: "addition-range-0-10",
    label: "Addition: 0–10",
    operation: "addition",
    practiceMode: "full",
    gradeTags: ["1", "2"],
    description: "Basic addition facts through 10.",
    rules: {
      min: 0,
      max: 10,
      zeroCap: DEFAULT_ZERO_CAP,
      oneCap: DEFAULT_ONE_CAP,
      avoidDuplicates: true,
    },
  },
  {
    id: "subtraction-range-0-10",
    label: "Subtraction: 0–10",
    operation: "subtraction",
    practiceMode: "full",
    gradeTags: ["1", "2"],
    description: "Basic subtraction facts through 10 with non-negative answers.",
    rules: {
      min: 0,
      max: 10,
      allowNegativeAnswers: false,
      zeroCap: DEFAULT_ZERO_CAP,
      oneCap: DEFAULT_ONE_CAP,
      avoidDuplicates: true,
    },
  },
  {
    id: "division-range-2-9",
    label: "Division: 2–9",
    operation: "division",
    practiceMode: "full",
    gradeTags: ["3", "4"],
    description: "Division facts with whole-number quotients using divisors 2 through 9.",
    rules: {
      min: 2,
      max: 9,
      requireWholeNumberAnswer: true,
      zeroCap: DEFAULT_ZERO_CAP,
      oneCap: DEFAULT_ONE_CAP,
      avoidDuplicates: true,
    },
  },
];

export const MULTIPLICATION_SKILLS = SKILL_DEFINITIONS.filter(
  (skill) => skill.operation === "multiplication"
);

export function getSkillDefinition(skillId?: string) {
  return SKILL_DEFINITIONS.find((skill) => skill.id === skillId);
}

function resolveGenerationOptions(opts: GenerateProblemsOptions) {
  const skill = getSkillDefinition(opts.skillId);
  const operation = opts.operation ?? skill?.operation ?? "multiplication";
  const matchedSkill =
    skill && (!opts.operation || skill.operation === opts.operation) ? skill : undefined;
  const skillRules = matchedSkill?.rules;

  const rangeMin = opts.rangeMin ?? skillRules?.min ?? 0;
  const rangeMax = opts.rangeMax ?? skillRules?.max ?? 9;
  const fixedOperand = opts.fixedMultiplier ?? skillRules?.fixedOperand;
  const allowNegativeAnswers = opts.allowNegativeAnswers ?? skillRules?.allowNegativeAnswers ?? false;

  return {
    skill: matchedSkill,
    operation,
    mode: opts.mode,
    rangeMin,
    rangeMax,
    fixedOperand,
    count: opts.count,
    allowNegativeAnswers,
  };
}

function generateMultiplicationSingleProblems(count: number, multiplier: number): Problem[] {
  const results: Problem[] = [];
  const pattern = ["A", "B", "C", "A", "B", "C", "A", "B", "C", "C"];
  const m = clamp(multiplier, 2, 9);

  const pushPair = (a: number, b: number) => {
    results.push(createProblem("multiplication", a, b, results.length));
  };

  while (results.length < count) {
    for (const token of pattern) {
      if (results.length >= count) {
        break;
      }

      if (token === "A") {
        for (let j = 0; j < 10 && results.length < count; j++) {
          pushPair(m, j);
        }
      } else if (token === "B") {
        for (let j = 0; j < 10 && results.length < count; j++) {
          pushPair(j, m);
        }
      } else {
        const cProblems: Array<{ a: number; b: number }> = [];
        let attempts = 0;

        while (cProblems.length < 10 && attempts < 1000) {
          const isAM = Math.random() > 0.5;
          const candidate = isAM
            ? { a: m, b: Math.floor(Math.random() * 8) + 2 }
            : { a: Math.floor(Math.random() * 8) + 2, b: m };

          if (cProblems.some((problem) => problem.a === candidate.a && problem.b === candidate.b)) {
            attempts++;
            continue;
          }

          cProblems.push(candidate);
          attempts = 0;
        }

        for (const problem of cProblems) {
          if (results.length < count) {
            pushPair(problem.a, problem.b);
          }
        }
      }
    }
  }

  return results.slice(0, count);
}

function generateMultiplicationRangeProblems(mode: PracticeMode, count: number, rangeMin: number, rangeMax: number): Problem[] {
  const results: Problem[] = [];

  let topMin = rangeMin;
  let topMax = rangeMax;
  let bottomMin = rangeMin;
  let bottomMax = rangeMax;

  if (mode === "limited") {
    topMin = rangeMin;
    topMax = rangeMax;
    bottomMin = Math.max(1, rangeMin);
    bottomMax = rangeMax;
  } else if (mode === "full" || mode === "interactive") {
    bottomMin = topMin === 0 ? 0 : Math.max(1, topMin);
    bottomMax = topMax;
  }

  const pairs: Array<{ a: number; b: number }> = [];
  for (let a = topMin; a <= topMax; a++) {
    for (let b = bottomMin; b <= bottomMax; b++) {
      pairs.push({ a, b });
    }
  }

  let pool = shuffle(pairs.slice());
  let zeroCount = 0;
  let oneCount = 0;
  let attempts = 0;
  let idx = 0;

  while (results.length < count && attempts < 100000) {
    if (pool.length === 0) {
      pool = shuffle(pairs.slice());
    }

    const pair = pool[idx % pool.length];
    idx++;
    attempts++;

    const involvesZero = pair.a === 0 || pair.b === 0;
    const involvesOne = pair.a === 1 || pair.b === 1;

    if (involvesZero && zeroCount >= DEFAULT_ZERO_CAP) {
      continue;
    }

    if (involvesOne && oneCount >= DEFAULT_ONE_CAP) {
      continue;
    }

    if (results.some((problem) => problem.a === pair.a && problem.b === pair.b)) {
      continue;
    }

    results.push(createProblem("multiplication", pair.a, pair.b, results.length));
    if (involvesZero) {
      zeroCount++;
    }
    if (involvesOne) {
      oneCount++;
    }
  }

  if (results.length < count) {
    const fallbackPairs: Array<{ a: number; b: number }> = [];
    for (let a = topMin; a <= topMax; a++) {
      for (let b = bottomMin; b <= bottomMax; b++) {
        const involvesZero = a === 0 || b === 0;
        const involvesOne = a === 1 || b === 1;
        if (!involvesZero && !involvesOne) {
          fallbackPairs.push({ a, b });
        }
      }
    }

    if (fallbackPairs.length === 0) {
      for (let a = topMin; a <= topMax; a++) {
        for (let b = bottomMin; b <= bottomMax; b++) {
          fallbackPairs.push({ a, b });
        }
      }
    }

    let fallbackIndex = 0;
    while (results.length < count) {
      const pair = fallbackPairs[fallbackIndex % fallbackPairs.length];
      results.push(createProblem("multiplication", pair.a, pair.b, results.length));
      fallbackIndex++;
      if (fallbackIndex > fallbackPairs.length * 1000) {
        break;
      }
    }
  }

  return results.slice(0, count);
}

function generateGenericProblems(operation: Operation, count: number, rangeMin: number, rangeMax: number, allowNegativeAnswers: boolean): Problem[] {
  const candidates: Array<{ a: number; b: number }> = [];

  if (operation === "division") {
    const minDivisor = Math.max(1, rangeMin);
    for (let answer = rangeMin; answer <= rangeMax; answer++) {
      for (let divisor = minDivisor; divisor <= rangeMax; divisor++) {
        candidates.push({ a: answer * divisor, b: divisor });
      }
    }
  } else if (operation === "subtraction") {
    for (let a = rangeMin; a <= rangeMax; a++) {
      for (let b = rangeMin; b <= rangeMax; b++) {
        if (!allowNegativeAnswers && a < b) {
          continue;
        }
        candidates.push({ a, b });
      }
    }
  } else {
    for (let a = rangeMin; a <= rangeMax; a++) {
      for (let b = rangeMin; b <= rangeMax; b++) {
        candidates.push({ a, b });
      }
    }
  }

  const results: Problem[] = [];
  const pool = shuffle(candidates.slice());
  let zeroCount = 0;
  let oneCount = 0;
  let index = 0;

  while (results.length < count && pool.length > 0) {
    const pair = pool[index % pool.length];
    index++;
    const involvesZero = pair.a === 0 || pair.b === 0;
    const involvesOne = pair.a === 1 || pair.b === 1;

    if (involvesZero && zeroCount >= DEFAULT_ZERO_CAP) {
      if (index > pool.length * 2) {
        break;
      }
      continue;
    }

    if (involvesOne && oneCount >= DEFAULT_ONE_CAP) {
      if (index > pool.length * 2) {
        break;
      }
      continue;
    }

    if (results.some((problem) => problem.a === pair.a && problem.b === pair.b && problem.operation === operation)) {
      if (index > pool.length * 2) {
        break;
      }
      continue;
    }

    results.push(createProblem(operation, pair.a, pair.b, results.length));
    if (involvesZero) {
      zeroCount++;
    }
    if (involvesOne) {
      oneCount++;
    }
  }

  const capEligiblePairs = candidates.filter((pair) => {
    const involvesZero = pair.a === 0 || pair.b === 0;
    const involvesOne = pair.a === 1 || pair.b === 1;

    if (involvesZero && zeroCount >= DEFAULT_ZERO_CAP) {
      return false;
    }

    if (involvesOne && oneCount >= DEFAULT_ONE_CAP) {
      return false;
    }

    return true;
  });

  const unusedPairs = candidates.filter(
    (pair) =>
      !results.some(
        (problem) => problem.a === pair.a && problem.b === pair.b && problem.operation === operation
      )
  );
  const uncappedPairs = capEligiblePairs.filter(
    (pair) => pair.a !== 0 && pair.b !== 0 && pair.a !== 1 && pair.b !== 1
  );

  appendFromPool(unusedPairs, false);
  appendFromPool(uncappedPairs, false);
  appendFromPool(candidates, true);

  return results.slice(0, count);

  function appendFromPool(pairs: Array<{ a: number; b: number }>, allowCapOverflow: boolean) {
    if (pairs.length === 0 || results.length >= count) {
      return;
    }

    let poolIndex = 0;
    let stalledAttempts = 0;

    while (results.length < count && stalledAttempts <= pairs.length * 2) {
      const pair = pairs[poolIndex % pairs.length] ?? pairs[0];
      const involvesZero = pair.a === 0 || pair.b === 0;
      const involvesOne = pair.a === 1 || pair.b === 1;

      if (
        !allowCapOverflow &&
        results.some(
          (problem) => problem.a === pair.a && problem.b === pair.b && problem.operation === operation
        )
      ) {
        poolIndex++;
        stalledAttempts++;
        continue;
      }

      if (!allowCapOverflow && involvesZero && zeroCount >= DEFAULT_ZERO_CAP) {
        poolIndex++;
        stalledAttempts++;
        continue;
      }

      if (!allowCapOverflow && involvesOne && oneCount >= DEFAULT_ONE_CAP) {
        poolIndex++;
        stalledAttempts++;
        continue;
      }

      results.push(createProblem(operation, pair.a, pair.b, results.length));
      if (involvesZero) {
        zeroCount++;
      }
      if (involvesOne) {
        oneCount++;
      }
      poolIndex++;
      stalledAttempts = 0;
    }
  }
}

export function generateProblems(opts: GenerateProblemsOptions): Problem[] {
  const { operation, mode, count, rangeMin, rangeMax, fixedOperand, allowNegativeAnswers } = resolveGenerationOptions(opts);

  if (operation === "multiplication") {
    if (mode === "single") {
      return generateMultiplicationSingleProblems(count, fixedOperand ?? 2);
    }

    const normalizedRangeMin = opts.rangeMin ?? 0;
    const normalizedRangeMax = opts.rangeMax ?? (mode === "limited" ? 4 : 9);
    return generateMultiplicationRangeProblems(mode, count, normalizedRangeMin, normalizedRangeMax);
  }

  return generateGenericProblems(operation, count, rangeMin, rangeMax, allowNegativeAnswers);
}
