import React, { useState } from 'react';
import type { Problem } from '../lib/generator';

export default function InteractiveWorksheet({ problems }: { problems: Problem[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});

  function handleChange(id: string, val: string, a: number, b: number) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    const numeric = Number(val);
    if (!Number.isNaN(numeric) && numeric === a * b) {
      setCorrect((prev) => ({ ...prev, [id]: true }));
      // small visual feedback handled by CSS class for .correct
    }
  }

  const score = Object.values(correct).filter(Boolean).length;

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14 }}>Interactive practice — score: <strong>{score}/{problems.length}</strong></div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Type answers; correct answers animate green.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(10, 1fr)`, gap: 8 }}>
        {problems.map((p) => (
          <div key={p.id} className={`problem ${correct[p.id] ? 'correct' : ''}`}>
            <div className="problem-label">{p.a} × {p.b}</div>
            <input
              value={answers[p.id] ?? ''}
              onChange={(e) => handleChange(p.id, e.target.value, p.a, p.b)}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }}
              inputMode="numeric"
            />
            {correct[p.id] && <div className="check">✓</div>}
          </div>
        ))}
      </div>

      <style jsx>{`
        .problem { padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; position: relative; transition: transform .18s ease, box-shadow .18s ease; }
        .problem.correct { transform: scale(1.04); box-shadow: 0 8px 24px rgba(16,24,40,0.08); border-color: #bbf7d0; }
        .check { position: absolute; top: 8px; right: 8px; color: #10b981; font-weight: 700; }
        .problem-label { font-weight: 600; margin-bottom: 6px; }
      `}</style>
    </div>
  );
}
