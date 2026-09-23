export type AnswerCheckResult =
  | { status: "blank"; message: string }
  | { status: "invalid"; message: string }
  | { status: "incorrect"; message: string }
  | { status: "correct"; message: string; normalizedValue: string };

export type InteractiveCellState = {
  value: string;
  isSolved: boolean;
  feedback?: {
    tone: "error" | "success";
    message: string;
  };
};

export function createInitialInteractiveState(): InteractiveCellState {
  return {
    value: "",
    isSolved: false,
  };
}

export function checkAnswer(rawValue: string, expectedAnswer: number): AnswerCheckResult {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return {
      status: "blank",
      message: "Enter a number first.",
    };
  }

  if (!/^-?\d+$/.test(trimmedValue)) {
    return {
      status: "invalid",
      message: "Use digits only, then try again.",
    };
  }

  const submittedAnswer = Number(trimmedValue);
  if (submittedAnswer !== expectedAnswer) {
    return {
      status: "incorrect",
      message: "Not quite—try again!",
    };
  }

  return {
    status: "correct",
    message: "Correct!",
    normalizedValue: trimmedValue,
  };
}
