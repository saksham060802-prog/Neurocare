import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface OddOneOutGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const SETS = [
  { common: '🍎', odd: '🍅' },
  { common: '🐱', odd: '🐶' },
  { common: '⭐', odd: '🌟' },
  { common: '🚗', odd: '🚕' },
  { common: '🌸', odd: '🌺' },
  { common: '☕', odd: '🍵' },
  { common: '🟢', odd: '🟢' },
];

export const OddOneOutGame: React.FC<OddOneOutGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [items, setItems] = useState<{ id: number; symbol: string; isOdd: boolean }[]>([]);
  const [round, setRound] = useState(1);
  const totalRounds = 4;

  useEffect(() => {
    generateGrid();
  }, [round, difficulty]);

  const generateGrid = () => {
    const gridCount = difficulty === 'EASY' ? 9 : difficulty === 'MEDIUM' ? 12 : 16;
    const randSet = SETS[Math.floor(Math.random() * SETS.length)];
    const oddIndex = Math.floor(Math.random() * gridCount);

    const newItems = Array.from({ length: gridCount }).map((_, idx) => ({
      id: idx,
      symbol: idx === oddIndex ? randSet.odd : randSet.common,
      isOdd: idx === oddIndex,
    }));

    setItems(newItems);
  };

  const handleItemClick = (isOdd: boolean) => {
    if (isOdd) {
      setScore((s) => s + 25);
      if (round < totalRounds) {
        setRound((r) => r + 1);
      } else {
        onFinishGame(100, 100);
      }
    } else {
      onFinishGame(50, 60);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <p className="text-sm font-extrabold text-slate-500">
        Round {round} / {totalRounds} — Find the item that is different!
      </p>

      <div className={`grid gap-3 ${items.length <= 9 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.isOdd)}
            className="h-20 sm:h-24 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-3xl flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all active:scale-95 shadow-sm"
          >
            {item.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
