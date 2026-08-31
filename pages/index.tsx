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

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <Head>
        <title>Mathitude Multiplication Worksheet Generator</title>
        <meta name="description" content="Printable multiplication worksheets (Calculation Corner)" />
      </Head>

      <main className="container">
        {/* Clean header - title centered, controls/print on right, NO logo */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: 24, 
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: 32, 
              fontFamily: '"Original Surfer", cursive', 
              color: '#7030a0',
              fontWeight: 400,
              letterSpacing: 0.5
            }}>
              Mathitude Multiplication Worksheet Generator
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }} className="no-print">
            <Controls compact onGenerate={handleGenerate} />
            <button
              onClick={handlePrint}
              className="btn"
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14
              }}
            >
              Print
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