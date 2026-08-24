import React from "react";
import styles from "../styles/Worksheet.module.css";
import { Problem } from "../lib/generator";

type Props = {
  problems: Problem[];
  cols: number;
  rows: number;
  includeAnswers?: boolean;
};

export const Worksheet: React.FC<Props> = ({ problems, cols, rows, includeAnswers }) => {
  const total = cols * rows;
  const filled = problems.slice(0, total);

  return (
    <div className={styles.sheet}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src="/images/logo.png" alt="MQ logo" className={styles.logo} />
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.title}>Calculation Corner</div>
          <div className={styles.sub}>Practice your multiplication — show your work.</div>
        </div>

        <div className={styles.headerRight} aria-hidden />
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: total }).map((_, i) => {
          const p = filled[i];
          return (
            <div key={i} className={styles.cell}>
              {p ? (
                <div className={styles.vertical}>
                  <div className={styles.topNumber} aria-hidden>{p.a}</div>

                  <div className={styles.mulLine} aria-hidden>× {p.b}</div>

                  <div className={styles.line} />

                  <div className={styles.writeArea}></div>
                </div>
              ) : (
                <div className={styles.empty} />
              )}
            </div>
          );
        })}
      </div>

      {includeAnswers && (
        <div className={styles.answerPage}>
          <h2>Answer Key</h2>
          <ol className={styles.answerList}>
            {filled.map((p, idx) => (
              <li key={p.id}>
                <span className={styles.answerText}>
                  {p.a} × {p.b} = <span className={styles.answerValue}>{p.answer}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className={styles.footer}>
        <small>© Mathitude 2026</small>
      </div>
    </div>
  );
};
