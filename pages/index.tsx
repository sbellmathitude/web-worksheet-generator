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

      <main className="container" style={{ maxWidth: '100%' }}>
        {/* Title */}
        <h1 style={{ 
          margin: '0 0 24px 0', 
          fontSize: 32, 
          fontFamily: '"Original Surfer", cursive', 
          color: '#7030a0',
          fontWeight: 400,
          letterSpacing: 0.5,
          textAlign: 'center'
        }}>
          Mathitude Multiplication Worksheet Generator
        </h1>

        {/* Menu row: all controls aligned horizontally and centered */}
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          paddingTop: 16,
          paddingBottom: 24,
          borderTop: '1px solid #e5e7eb',
          marginBottom: 24
        }} className="no-print">
          <Controls onGenerate={handleGenerate} />
          <button
            onClick={handlePrint}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(90deg,#f97316,#f43f5e)",
              color: "white",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14
            }}
          >
            Print
          </button>
        </div>

        {/* Worksheet output */}
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
