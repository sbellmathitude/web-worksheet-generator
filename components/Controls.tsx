import React, { useEffect, useState } from "react";
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
  const [mode, setMode] = useState<PracticeMode>("full");
  const [fixedMultiplier, setFixedMultiplier] = useState<number>(2);
  const [rangeMin, setRangeMin] = useState<number>(2);
  const [rangeMax, setRangeMax] = useState<number>(9);
  const [cols, setCols] = useState<number>(10);
  const [rows, setRows] = useState<number>(10);
  const [includeAnswers, setIncludeAnswers] = useState<boolean>(false);

  const count = cols * rows;

  useEffect(() => {
    if (mode === "limited") {
      setRangeMin(2);
      setRangeMax(5);
    } else if (mode === "full") {
      setRangeMin(2);
      setRangeMax(9);
    }
  }, [mode]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGenerate({
          mode,
          fixedMultiplier: mode === "single" ? fixedMultiplier : undefined,
          rangeMin: mode !== "single" ? rangeMin : undefined,
          rangeMax: mode !== "single" ? rangeMax : undefined,
          count,
          includeAnswers,
          cols,
          rows
        });
      }}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <fieldset style={{ border: "none", padding: 0 }}>
        <legend style={{ fontWeight: 700 }}>Practice type</legend>

        <label style={{ display: "block", marginTop: 6 }}>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={mode === "single"}
            onChange={() => setMode("single")}
          />{" "}
          Single fact (one multiplier)
        </label>

        {mode === "single" && (
          <div style={{ marginLeft: 18, marginTop: 6 }}>
            <label>
              Multiplier:
              <select
                value={fixedMultiplier}
                onChange={(e) => setFixedMultiplier(Number(e.target.value))}
                style={{ marginLeft: 8 }}
              >
                {Array.from({ length: 8 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>
                    {n}s
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <label style={{ display: "block", marginTop: 10 }}>
          <input
            type="radio"
            name="mode"
            value="limited"
            checked={mode === "limited"}
            onChange={() => setMode("limited")}
          />{" "}
          Limited mixed (smaller range)
        </label>

        {mode === "limited" && (
          <div style={{ marginLeft: 18, marginTop: 6 }}>
            <label>
              Range:
              <input
                type="number"
                value={rangeMin}
                min={2}
                max={20}
                onChange={(e) => setRangeMin(Number(e.target.value))}
                style={{ width: 60, marginLeft: 8 }}
              />
              {" — "}
              <input
                type="number"
                value={rangeMax}
                min={2}
                max={20}
                onChange={(e) => setRangeMax(Number(e.target.value))}
                style={{ width: 60, marginLeft: 8 }}
              />
            </label>
          </div>
        )}

        <label style={{ display: "block", marginTop: 10 }}>
          <input
            type="radio"
            name="mode"
            value="full"
            checked={mode === "full"}
            onChange={() => setMode("full")}
          />{" "}
          Full mixed single-digit (2–9)
        </label>
      </fieldset>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Columns
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column" }}>
          Rows
          <input
            type="number"
            min={1}
            max={50}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>

        <div style={{ marginLeft: "auto", fontSize: 13, color: "#475569" }}>
          Total: <strong>{count}</strong>
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={includeAnswers}
          onChange={(e) => setIncludeAnswers(e.target.checked)}
        />
        Include answer key
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" className="btn" style={{ padding: "8px 12px" }}>
          Generate Worksheet
        </button>
      </div>
    </form>
  );
};
