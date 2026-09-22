import React, { useState, useEffect } from "react";
import { GenerateProblemsOptions, MULTIPLICATION_SKILLS, PracticeMode } from "../lib/generator";

type Props = {
  onGenerate: (opts: {
    activity: "pdf" | "interactive";
    mode: PracticeMode;
    skillId?: string;
    operation?: GenerateProblemsOptions["operation"];
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
  const [spec, setSpec] = useState<string>("multiplication-range-2-9");
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
    const selectedSkill = MULTIPLICATION_SKILLS.find((skill) => skill.id === spec) ?? MULTIPLICATION_SKILLS[0];
    if (!selectedSkill) {
      return;
    }

    onGenerate({
      activity,
      mode: selectedSkill.practiceMode,
      skillId: selectedSkill.id,
      operation: selectedSkill.operation,
      fixedMultiplier: selectedSkill.rules.fixedOperand,
      rangeMin: selectedSkill.rules.min,
      rangeMax: selectedSkill.rules.max,
      count,
      includeAnswers,
      cols,
      rows,
    });
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
        {MULTIPLICATION_SKILLS.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.label}
          </option>
        ))}
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
          background: "linear-gradient(90deg,#60a5fa,#7c3aed)",
          color: "white", 
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14
        }}
      >
        Generate
      </button>
    </div>
  );
};
