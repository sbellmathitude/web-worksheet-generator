export type LiveAnswerResult =
  | { status: "blank" | "typing" }
  | { status: "invalid" | "incorrect" }
  | { status: "correct"; normalizedValue: string };

export type InteractiveCellState = {
  value: string;
  isSolved: boolean;
};

export function createInitialInteractiveState(): InteractiveCellState {
  return {
    value: "",
    isSolved: false,
  };
}

export function getLiveAnswerResult(rawValue: string, expectedAnswer: number): LiveAnswerResult {
  const trimmedValue = rawValue.trim();
  const expectedValue = String(expectedAnswer);

  if (!trimmedValue) {
    return { status: "blank" };
  }

  if (trimmedValue === expectedValue) {
    return {
      status: "correct",
      normalizedValue: expectedValue,
    };
  }

  if (!/^-?\d*$/.test(trimmedValue)) {
    return { status: "invalid" };
  }

  if (expectedValue.startsWith(trimmedValue) || trimmedValue.length < expectedValue.length) {
    return { status: "typing" };
  }

  return { status: "incorrect" };
}
