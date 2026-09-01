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
    <>
      <div className={styles.sheetContainer}>
        <div className={styles.sheet}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <img src="/images/logo.png" alt="MQ logo" className={styles.logoSmall} />
            </div>
            <div className={styles.headerCenter}>
              <div className={styles.title}>Multiplication Practice</div>
            </div>
            <div style={{ width: 60 }} aria-hidden />
          </div>

          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: total }).map((_, i) => {
              const p = filled[i];
              return (
                <div key={i} className={styles.cell}>
                  {p ? (
                    <div className={styles.vertical}>
                      <div className={styles.topRow} aria-hidden>
                        <div className={styles.topNumber}>{p.a}</div>
                      </div>

                      <div className={styles.middleRow} aria-hidden>
                        <div className={styles.times}>×</div>
                        <div className={styles.bottomNumber}>{p.b}</div>
                      </div>

                      <div className={styles.lineRow} aria-hidden>
                        <div className={styles.line} />
                      </div>

                      <div className={styles.writeArea}></div>
                    </div>
                  ) : (
                    <div className={styles.empty} />
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerText} style={{ fontFamily: '\"Original Surfer\", cursive', color: '#7030a0' }}>© Mathitude 2026</div>
          </div>
        </div>
      </div>

      {includeAnswers && (
        <div className={styles.sheetContainer}>
          <div className={styles.sheet}>
            <div className={styles.answerHeader}>
              <div className={styles.answerTitle}>Answer Key</div>
            </div>

            <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: total }).map((_, i) => {
                const p = filled[i];
                return (
                  <div key={`a-${i}`} className={styles.cell}>
                    {p ? (
                      <div className={styles.vertical}>
                        <div className={styles.topRow} aria-hidden>
                          <div className={styles.topNumber}>{p.a}</div>
                        </div>

                        <div className={styles.middleRow} aria-hidden>
                          <div className={styles.times}>×</div>
                          <div className={styles.bottomNumber}>{p.b}</div>
                        </div>

                        <div className={styles.answerLine} aria-hidden />

                        <div className={styles.answerValue}>{p.answer}</div>
                      </div>
                    ) : (
                      <div className={styles.empty} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.footer}>
              <div className={styles.footerText} style={{ fontFamily: '\"Original Surfer\", cursive', color: '#7030a0' }}>© Mathitude 2026</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
