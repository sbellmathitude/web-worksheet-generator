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
        {/* Centered title */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Mathitude Multiplication Worksheet Generator</h1>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Practice your multiplication — show your work.</div>

          <div className="no-print" style={{ display: "flex", justifyContent: "center", marginTop: 10, gap: 12 }}>
            <Controls compact onGenerate={handleGenerate} />
            <button
              onClick={() => window.print()}
              className="btn"
              title="Print current worksheet / save as PDF"
              style={{ padding: "8px 12px", background: "#111827", color: "white", borderRadius: 8 }}
            >
              Print / Save PDF
            </button>
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
