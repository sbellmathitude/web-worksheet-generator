import React, { useState, useEffect } from "react";
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
  compact?: boolean;
};

export const Controls: React.FC<Props> = ({ onGenerate, compact = false }) => {
  const [activity, setActivity] = useState<"pdf" | "interactive">("pdf");
  const [spec, setSpec] = useState<string>("range:2-9");
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(false);

  // all activities are 10x10
  const cols = 10;
  const rows = 10;
  const count = cols * rows;

  useEffect(() => {
    // ensure checkbox reset when switching to interactive
    if (activity === "interactive") setIncludeAnswers(false);
  }, [activity]);

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
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {/* Activity toggle buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => setActivity("pdf")}
          style={{
            fontWeight: 700,
            padding: "8px 12px",
            background: activity === "pdf" ? "linear-gradient(90deg,#60a5fa,#7c3aed)" : "white",
            color: activity === "pdf" ? "white" : "#111827",
            border: activity === "pdf" ? "none" : "1px solid #e6eef6",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          PDF
        </button>

        <button
          onClick={() => setActivity("interactive")}
          style={{
            fontWeight: 700,
            padding: "8px 12px",
            background: activity === "interactive" ? "linear-gradient(90deg,#f97316,#f43f5e)" : "white",
            color: activity === "interactive" ? "white" : "#111827",
            border: activity === "interactive" ? "none" : "1px solid #e6eef6",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          Interactive
        </button>
      </div>

      {/* Problem set selector */}
      <select 
        value={spec} 
        onChange={(e) => setSpec(e.target.value)} 
        style={{ 
          padding: "8px 10px", 
          borderRadius: 6, 
          border: "1px solid #e6eef6", 
          minWidth: 160,
          fontSize: 14,
          background: "white",
          cursor: "pointer"
        }}
      >
        {/* single multiplier options (2..9 only) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const val = i + 2;
          return <option key={`s${val}`} value={`single:${val}`}>Single: {val}</option>;
        })}

        <option value="range:2-9">Range: 2–9</option>
        <option value="range:3-8">Range: 3–8</option>
        <option value="range:0-9">Range: 0–9</option>
      </select>

      {/* Answer key checkbox (PDF only) */}
      {activity === "pdf" && (
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
          <input 
            type="checkbox" 
            checked={includeAnswers} 
            onChange={(e) => setIncludeAnswers(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          Answer key
        </label>
      )}

      {/* Generate button */}
      <button 
        onClick={handleGenerate} 
        style={{ 
          padding: "8px 16px", 
          background: "#10b981", 
          color: "white", 
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 14
        }}
      >
        Generate
      </button>
    </div>
  );
};
