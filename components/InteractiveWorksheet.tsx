import React, { useEffect, useMemo, useState } from "react";
import type { Problem } from "../lib/generator";
import {
  checkAnswer,
  createInitialInteractiveState,
  InteractiveCellState,
} from "../lib/interactiveWorksheet";
import { getOperationSymbol, getWorksheetTitle } from "../lib/operations";
import {
  getRandomPixelArtPattern,
  getRewardPixelToken,
  PIXEL_ART_COLUMNS,
  PIXEL_ART_ROWS,
  PIXEL_TOKEN_COLORS,
  PixelArtPattern,
} from "../lib/pixelArt";
import styles from "../styles/InteractiveWorksheet.module.css";

type Props = {
  problems: Problem[];
  sessionId: number;
};

function buildInitialState(problems: Problem[]) {
  return Object.fromEntries(
    problems.map((problem) => [problem.id, createInitialInteractiveState()])
  ) as Record<string, InteractiveCellState>;
}

export default function InteractiveWorksheet({ problems, sessionId }: Props) {
  const [cellStates, setCellStates] = useState<Record<string, InteractiveCellState>>(() =>
    buildInitialState(problems)
  );
  const [rewardPattern, setRewardPattern] = useState<PixelArtPattern>(() => getRandomPixelArtPattern());

  useEffect(() => {
    setCellStates(buildInitialState(problems));
    setRewardPattern(getRandomPixelArtPattern());
  }, [problems, sessionId]);

  const solvedCount = useMemo(
    () => problems.filter((problem) => cellStates[problem.id]?.isSolved).length,
    [cellStates, problems]
  );
  const totalCount = problems.length;
  const isComplete = totalCount > 0 && solvedCount === totalCount;
  const operations = new Set(problems.map((problem) => problem.operation ?? "multiplication"));
  const worksheetOperation = operations.size === 1 ? Array.from(operations)[0] : undefined;
  const title = getWorksheetTitle(worksheetOperation);
  const rewardLabel = isComplete ? rewardPattern.label : "mystery picture";

  function updateCellState(problemId: string, updater: (current: InteractiveCellState) => InteractiveCellState) {
    setCellStates((current) => ({
      ...current,
      [problemId]: updater(current[problemId] ?? createInitialInteractiveState()),
    }));
  }

  function handleValueChange(problemId: string, value: string) {
    updateCellState(problemId, (current) => ({
      ...current,
      value,
      feedback: current.isSolved ? current.feedback : undefined,
    }));
  }

  function handleSubmit(problem: Problem) {
    const currentState = cellStates[problem.id] ?? createInitialInteractiveState();
    if (currentState.isSolved) {
      return;
    }

    const result = checkAnswer(currentState.value, problem.answer);
    if (result.status === "correct") {
      updateCellState(problem.id, () => ({
        value: result.normalizedValue,
        isSolved: true,
        feedback: {
          tone: "success",
          message: result.message,
        },
      }));
      return;
    }

    updateCellState(problem.id, (existing) => ({
      ...existing,
      feedback: {
        tone: "error",
        message: result.message,
      },
    }));
  }

  return (
    <section className={styles.interactiveSheet}>
      <div className={styles.summaryPanel}>
        <div className={styles.summaryCopy}>
          <p className={styles.eyebrow}>Interactive practice</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>
            Solve each fact to reveal one pixel of the hidden picture. Wrong answers stay unsolved, so
            you can keep trying until every square is complete.
          </p>
          <div className={styles.progressRow}>
            <span className={styles.progressBadge}>
              {solvedCount} / {totalCount} solved
            </span>
            {isComplete && <span className={styles.completionBadge}>All {totalCount} problems solved!</span>}
          </div>
          <p className={styles.completionMessage}>
            {isComplete
              ? `Great work—you revealed the ${rewardPattern.label}.`
              : "Tip: press Enter in any answer box or use the Check button for that cell."}
          </p>
        </div>

        <div className={styles.rewardPanel}>
          <div
            className={styles.rewardGrid}
            role="img"
            aria-label={`Reward picture: a ${rewardLabel}. Solved problems reveal its colors.`}
          >
            {Array.from({ length: PIXEL_ART_COLUMNS * PIXEL_ART_ROWS }).map((_, index) => {
              const isSolved = problems[index] ? cellStates[problems[index].id]?.isSolved : false;
              const color = isSolved
                ? PIXEL_TOKEN_COLORS[getRewardPixelToken(rewardPattern, index)]
                : undefined;

              return (
                <div
                  key={`${rewardPattern.id}-${index}`}
                  className={`${styles.rewardPixel} ${isSolved ? styles.rewardPixelSolved : ""}`.trim()}
                  style={color ? { backgroundColor: color } : undefined}
                />
              );
            })}
          </div>
          <p className={styles.patternLabel}>
            {isComplete ? (
              <>
                Revealed picture: <strong>{rewardPattern.label}</strong>
              </>
            ) : (
              "Each correct answer reveals one more pixel."
            )}
          </p>
        </div>
      </div>

      <div className={styles.gridScroller}>
        <div className={styles.problemGrid}>
          {problems.map((problem, index) => {
            const cellState = cellStates[problem.id] ?? createInitialInteractiveState();
            const answerInputId = `interactive-answer-${index}`;
            const answerFeedbackId = `interactive-feedback-${index}`;
            const operation = problem.operation ?? "multiplication";

            return (
              <div
                key={problem.id}
                className={`${styles.problemCard} ${cellState.isSolved ? styles.problemCardSolved : ""}`.trim()}
              >
                <p className={styles.cellNumber}>Problem {index + 1}</p>
                <p className={styles.expression}>
                  {problem.a} {getOperationSymbol(operation)} {problem.b}
                </p>

                <form
                  className={styles.inputForm}
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit(problem);
                  }}
                >
                  <label className={styles.inputLabel} htmlFor={answerInputId}>
                    Answer for problem {index + 1}: {problem.a} {getOperationSymbol(operation)} {problem.b}
                  </label>
                  <div className={styles.inputRow}>
                    <input
                      id={answerInputId}
                      className={`${styles.input} ${cellState.isSolved ? styles.inputSolved : ""}`.trim()}
                      type="text"
                      inputMode={operation === "subtraction" ? "text" : "numeric"}
                      pattern="-?[0-9]*"
                      autoComplete="off"
                      value={cellState.value}
                      onChange={(event) => handleValueChange(problem.id, event.target.value)}
                      aria-describedby={answerFeedbackId}
                      aria-invalid={cellState.feedback?.tone === "error"}
                      readOnly={cellState.isSolved}
                    />
                    <button className={styles.checkButton} type="submit" disabled={cellState.isSolved}>
                      {cellState.isSolved ? "Done" : "Check"}
                    </button>
                  </div>
                  <p
                    id={answerFeedbackId}
                    className={`${styles.feedback} ${
                      cellState.feedback?.tone === "success"
                        ? styles.feedbackSuccess
                        : cellState.feedback?.tone === "error"
                          ? styles.feedbackError
                          : ""
                    }`.trim()}
                    aria-live="polite"
                  >
                    {cellState.feedback?.message ?? <span className={styles.srOnly}>No feedback yet.</span>}
                  </p>
                </form>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
