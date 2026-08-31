import React, { useState, useRef } from 'react';
import type { Problem } from '../lib/generator';

export default function InteractiveWorksheet({ problems, cols = 10 }: { problems: Problem[]; cols?: number }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function spawnConfetti(xPerc: number, yPerc: number) {
    const container = containerRef.current;
    if (!container) return;
    const colors = ['#f97316', '#60a5fa', '#f43f5e', '#34d399', '#f59e0b', '#a78bfa'];

    for (let i = 0; i < 20; i++) {
      const el = document.createElement('span');
      el.className = 'confetti';
      const size = Math.floor(Math.random() * 10) + 6; // 6-16px
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = `${size}px`;
      el.style.height = `${size * 0.6}px`;
      el.style.left = `calc(${xPerc}% + ${Math.random() * 20 - 10}px)`;
      el.style.top = `calc(${yPerc}% + ${Math.random() * 20 - 10}px)`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(el);

      // remove after animation
      el.addEventListener('animationend', () => el.remove());
    }
  }

  function handleChange(id: string, val: string, a: number, b: number, index: number) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    const numeric = Number(val);
    if (!Number.isNaN(numeric) && numeric === a * b && !correct[id]) {
      setCorrect((prev) => ({ ...prev, [id]: true }));
      // spawn confetti near the cell
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const parentRect = containerRef.current!.getBoundingClientRect();
        const x = ((rect.left - parentRect.left) / parentRect.width) * 100;
        const y = ((rect.top - parentRect.top) / parentRect.height) * 100;
        spawnConfetti(x, y);
      } else {
        spawnConfetti(50, 20);
      }
    }
  }

  const score = Object.values(correct).filter(Boolean).length;

  // compute column color families (ten columns)
  function columnColor(colIndex: number) {
    // use HSL across hue spectrum but keep within one family by hue per column
    const hue = Math.round((colIndex / cols) * 360);
    // return a pair of colors for gradient
    return `linear-gradient(180deg, hsl(${hue} 90% 60%) 0%, hsl(${hue} 85% 45%) 100%)`;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} />

      <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14 }}>Interactive practice — score: <strong>{score}/{problems.length}</strong></div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Click a cell to select it. Correct answers fill the cell with color; input stays white.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {problems.map((p, idx) => {
          const col = idx % cols;
          const bg = columnColor(col);
          const isSelected = selected === p.id;
          const isCorrect = !!correct[p.id];

          return (
            <div
              key={p.id}
              id={p.id}
              className={`problem ${isCorrect ? 'correct' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelected(p.id)}
              style={{ padding: 0, borderRadius: 8, background: 'transparent', transition: 'transform .18s ease, box-shadow .18s ease', minHeight: 84 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, height: '100%' }}>
                <div className="problemBox" style={{ width: '100%', padding: 8, borderRadius: 8, background: isCorrect ? bg : (isSelected ? 'rgba(0,0,0,0.04)' : 'transparent'), boxSizing: 'border-box' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="problemText" style={{ color: isCorrect ? 'white' : '#111827', fontWeight: isSelected ? 700 : 400, fontSize: 16 }}>{p.a} × {p.b} =</div>
                    <div style={{ marginTop: 8 }}>
                      <input
                        value={answers[p.id] ?? ''}
                        onChange={(e) => handleChange(p.id, e.target.value, p.a, p.b, idx)}
                        onFocus={() => setSelected(p.id)}
                        style={{ width: 88, padding: '8px 10px', borderRadius: 6, border: '2px solid rgba(0,0,0,0.08)', background: 'white', color: '#111827', fontSize: 14 }}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .problem { outline: 3px solid transparent; }
        .problem.selected { outline: 3px solid rgba(99,102,241,0.12); }
        .problem.correct { transform: scale(1.02); box-shadow: 0 10px 30px rgba(16,24,40,0.12); }
        .problemText { font-size: 16px; }
        .confetti { position: absolute; border-radius: 3px; opacity: 0.95; transform-origin: center; animation: confettiFall 900ms linear forwards; z-index: 9999; }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0) scale(1); opacity: 1; } 100% { transform: translateY(160px) rotate(720deg) scale(0.85); opacity: 0; } }
      `}</style>
    </div>
  );
}
