import React, { useState } from "react";
import { PracticeMode } from "../lib/generator";

type Props = {
  onGenerate: (opts: {
    mode: PracticeMode;
    fixedMultiplier?: number;
    rangeMin?: number;
    rangeMax?: number;
    count: number;
    includeAnswers: boolean;
    cols: number;
    rows: number;
  }) => void;
};

export const Controls: React.FC<Props> = ({ onGenerate }) => {
  const [activity, setActivity] = useState<"pdf" | "interactive">("pdf");
  const [spec, setSpec] = useState<string>("range:0-9");
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(false);

  // all activities are 10x10
  const cols = 10;
  const rows = 10;
  const count = cols * rows;

  function handleGenerate() {
    // interpret spec
    if (spec.startsWith("single:")) {
      const m = Number(spec.split(":")[1]);
      onGenerate({
        mode: "single",
        fixedMultiplier: m,
        count,
        includeAnswers,
        cols,
        rows
      });
    } else if (spec.startsWith("range:")) {
      const parts = spec.split(":")[1].split("-");
      const min = Number(parts[0]);
      const max = Number(parts[1]);
      onGenerate({
        mode: "full",
        rangeMin: min,
        rangeMax: max,
        count,
        includeAnswers,
        cols,
        rows
      });
    } else {
      // fallback
      onGenerate({ mode: "full", count, includeAnswers, cols, rows });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn"
          onClick={() => setActivity("pdf")}
          style={{
            flex: 1,
            fontWeight: 700,
            background: activity === "pdf" ? "linear-gradient(90deg,#60a5fa,#7c3aed)" : "white",
            color: activity === "pdf" ? "white" : "#111827",
            border: activity === "pdf" ? "none" : "1px solid #d1d5db"
          }}
        >
          PDF
        </button>
        <button
          className="btn"
          onClick={() => setActivity("interactive")}
          style={{
            flex: 1,
            fontWeight: 700,
            background: activity === "interactive" ? "linear-gradient(90deg,#f97316,#f43f5e)" : "white",
            color: activity === "interactive" ? "white" : "#111827",
            border: activity === "interactive" ? "none" : "1px solid #d1d5db"
          }}
        >
          Interactive
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 13, minWidth: 72 }}>Problem set</label>
        <select value={spec} onChange={(e) => setSpec(e.target.value)} style={{ flex: 1 }}>
          {/* single multiplier options */}
          {Array.from({ length: 10 }).map((_, i) => (
            <option key={`s${i}`} value={`single:${i}`}>Single: {i}</option>
          ))}
          <option value="range:0-4">Range: 0–4</option>
          <option value="range:2-9">Range: 2–9</option>
          <option value="range:0-9">Range: 0–9</option>
        </select>
      </div>

      {activity === "pdf" && (
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={includeAnswers} onChange={(e) => setIncludeAnswers(e.target.checked)} /> Include answer key
        </label>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleGenerate}
          className="btn"
          style={{ padding: "8px 12px", flex: 1 }}
        >
          Generate {activity === "interactive" ? "Interactive" : "PDF"}
        </button>
      </div>
    </div>
  );
};
