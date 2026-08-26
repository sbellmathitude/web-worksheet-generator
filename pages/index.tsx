import React, { useState } from "react";
import Head from "next/head";
import { Controls } from "../components/Controls";
import { Worksheet } from "../components/Worksheet";
import InteractiveWorksheet from "../components/InteractiveWorksheet";
import { generateProblems, PracticeMode, Problem } from "../lib/generator";

export default function Home() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [cols, setCols] = useState<number>(10);
  const [rows, setRows] = useState<number>(10);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(false);
  const [mode, setMode] = useState<PracticeMode>("full");

  function handleGenerate(opts: {
    mode: PracticeMode;
    fixedMultiplier?: number;
    rangeMin?: number;
    rangeMax?: number;
    count: number;
    includeAnswers: boolean;
    cols: number;
    rows: number;
  }) {
    const { mode: m, fixedMultiplier, rangeMin, rangeMax, count, includeAnswers, cols, rows } = opts;
    setCols(cols);
    setRows(rows);
    setIncludeAnswers(includeAnswers);
    setMode(m);

    let generated = generateProblems({
      mode: m,
      count,
      fixedMultiplier,
      rangeMin,
      rangeMax
    });

    setProblems(generated);
    setTimeout(() => {
      const el = document.getElementById("worksheet");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <>
      <Head>
        <title>Mathitude Multiplication Worksheet Generator</title>
        <meta name="description" content="Printable multiplication worksheets (Calculation Corner)" />
      </Head>

      <main className="container">
        {/* Header with logo on the left and centered title (Option C) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/images/logo.png" alt="MQ logo" style={{ height: 32, width: 'auto' }} />
          </div>

          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 18, color: '#7030a0' }}>Mathitude Multiplication Worksheet Generator</h1>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Practice your multiplication.</div>
          </div>

          <div style={{ width: 140, display: 'flex', justifyContent: 'flex-end' }} className="no-print">
            <Controls compact onGenerate={handleGenerate} />
          </div>
        </div>

        <div style={{ display: "block" }}>
          <div style={{ flex: 1 }} id="worksheet">
            {problems.length === 0 ? (
              <div style={{ padding: 28, background: "white", borderRadius: 8 }}>
                <p style={{ marginTop: 0 }}>
                  No worksheet generated yet. Choose a practice type and layout, then click Generate.
                </p>
              </div>
            ) : (
              mode === 'interactive' ? (
                <InteractiveWorksheet problems={problems} />
              ) : (
                <Worksheet problems={problems} cols={cols} rows={rows} includeAnswers={includeAnswers} />
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
