import React, { useEffect, useMemo, useState } from "react";
import type { Operation, Problem } from "../lib/generator";
import {
  createInitialInteractiveState,
  getLiveAnswerResult,
  InteractiveCellState,
} from "../lib/interactiveWorksheet";
import { getOperationSymbol, getWorksheetTitle } from "../lib/operations";
import styles from "../styles/InteractiveWorksheet.module.css";

type Props = {
  problems: Problem[];
  cols: number;
  rows: number;
  operation?: Operation;
  sessionId: number;
};

function buildInitialState(problems: Problem[]) {
  return Object.fromEntries(
    problems.map((problem) => [problem.id, createInitialInteractiveState()])
  ) as Record<string, InteractiveCellState>;
}

export default function InteractiveWorksheet({
  problems,
  cols,
  rows,
  operation = "multiplication",
  sessionId,
}: Props) {
  const problemIdsKey = useMemo(() => problems.map((problem) => problem.id).join("|"), [problems]);
  const [cellStates, setCellStates] = useState<Record<string, InteractiveCellState>>(() =>
    buildInitialState(problems)
  );

  useEffect(() => {
    setCellStates(buildInitialState(problems));
  }, [problemIdsKey, sessionId]);

  const total = cols * rows;
  const filled = problems.slice(0, total);
  const solvedCount = useMemo(
    () => filled.filter((problem) => cellStates[problem.id]?.isSolved).length,
    [cellStates, filled]
  );
  const operations = new Set(filled.map((problem) => problem.operation ?? operation));
  const worksheetOperation =
    operations.size === 1 ? Array.from(operations)[0] ?? operation : undefined;
  const title = getWorksheetTitle(worksheetOperation);

  function handleValueChange(problem: Problem, value: string) {
    setCellStates((current) => {
      const existing = current[problem.id] ?? createInitialInteractiveState();
      if (existing.isSolved) {
        return current;
      }

      const nextState = getLiveAnswerResult(value, problem.answer);
      return {
        ...current,
        [problem.id]:
          nextState.status === "correct"
            ? {
                value: nextState.normalizedValue,
                isSolved: true,
              }
            : {
                ...existing,
                value,
              },
      };
    });
  }

  return (
    <section className={styles.interactiveSheet}>
      <div className={styles.summaryPanel}>
        <div>
          <p className={styles.eyebrow}>Interactive practice</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>
            Type each answer directly in the grid. Correct answers lock in right away.
          </p>
        </div>
        <div className={styles.progressBadge} aria-live="polite">
          {solvedCount} / {filled.length} correct
        </div>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => {
          const problem = filled[index];
          if (!problem) {
            return <div key={`empty-${index}`} className={styles.emptyCell} aria-hidden />;
          }

          const cellState = cellStates[problem.id] ?? createInitialInteractiveState();
          const liveAnswer = cellState.isSolved
            ? { status: "correct" as const, normalizedValue: cellState.value }
            : getLiveAnswerResult(cellState.value, problem.answer);
          const isIncorrect = liveAnswer.status === "incorrect" || liveAnswer.status === "invalid";
          const isSolved = cellState.isSolved;
          const answerInputId = `interactive-answer-${problem.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
          const cellOperation = problem.operation ?? worksheetOperation ?? operation;

          return (
            <div
              key={problem.id}
              className={`${styles.cell} ${isSolved ? styles.cellSolved : ""} ${
                isIncorrect ? styles.cellIncorrect : ""
              }`.trim()}
            >
              <div className={styles.problemStack}>
                <label className={styles.expression} htmlFor={answerInputId}>
                  <span className={styles.topRow}>
                    <span className={styles.topNumber}>{problem.a}</span>
                  </span>
                  <span className={styles.middleRow}>
                    <span className={styles.operator}>{getOperationSymbol(cellOperation)}</span>
                    <span className={styles.bottomNumber}>{problem.b}</span>
                  </span>
                  <span className={styles.lineRow} aria-hidden>
                    <span className={styles.line} />
                  </span>
                </label>

                <div className={styles.answerRow}>
                  <input
                    id={answerInputId}
                    className={`${styles.input} ${isSolved ? styles.inputSolved : ""} ${
                      isIncorrect ? styles.inputIncorrect : ""
                    }`.trim()}
                    type="text"
                    inputMode="numeric"
                    pattern="-?[0-9]*"
                    autoComplete="off"
                    value={cellState.value}
                    onChange={(event) => handleValueChange(problem, event.target.value)}
                    aria-invalid={isIncorrect}
                    readOnly={isSolved}
                  />
                  <span
                    className={`${styles.status} ${isSolved ? styles.statusSolved : ""} ${
                      isIncorrect ? styles.statusIncorrect : ""
                    }`.trim()}
                    aria-hidden={!isSolved && !isIncorrect}
                  >
                    {isSolved ? "✓" : isIncorrect ? "✕" : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
