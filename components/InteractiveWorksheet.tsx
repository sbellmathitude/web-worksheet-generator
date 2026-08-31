import React from 'react';
import type { Problem } from '../lib/generator';

export default function InteractiveWorksheet({ problems }: { problems: Problem[] }) {
  return (
    <div style={{ 
      padding: '40px', 
      background: 'white', 
      borderRadius: 8, 
      textAlign: 'center',
      maxWidth: '600px',
      margin: '40px auto'
    }}>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
        Interactive Mode
      </div>
      <div style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6 }}>
        <p>Interactive practice mode is coming soon!</p>
        <p>This will be a different setup optimized for learning and practice with immediate feedback.</p>
        <p style={{ marginTop: 24, fontSize: 14 }}>
          For now, please use the PDF mode to generate worksheets.
        </p>
      </div>
    </div>
  );
}
