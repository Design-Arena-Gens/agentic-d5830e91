'use client';

import { useState, useMemo } from 'react';
import GlassFruitCanvas from '../components/GlassFruitCanvas';

const FRUITS = [
  { key: 'watermelon', label: 'Watermelon', hue: '#a3e4b5' },
  { key: 'banana', label: 'Banana', hue: '#f7f0a3' },
  { key: 'apple', label: 'Apple', hue: '#f3b0b0' },
  { key: 'carrot', label: 'Carrot', hue: '#f3c29a' }
];

export default function Page() {
  const [fruitKey, setFruitKey] = useState('watermelon');

  const fruit = useMemo(() => FRUITS.find(f => f.key === fruitKey) ?? FRUITS[0], [fruitKey]);

  return (
    <main className="page">
      <div className="topbar">
        <div className="title">Glass Fruit ? Cinematic Close?up</div>
        <label className="picker">
          <span>Fruit</span>
          <select value={fruitKey} onChange={(e) => setFruitKey(e.target.value)}>
            {FRUITS.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        </label>
      </div>
      <GlassFruitCanvas fruit={fruit} />
      <footer className="footer">Tip: orbit the view (drag), zoom (wheel)</footer>
    </main>
  );
}
