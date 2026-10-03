import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface MemoryMatrixGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

export const MemoryMatrixGame: React.FC<MemoryMatrixGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [gridSize, setGridSize] = useState(3); // 3x3 grid
  const [patternCount, setPatternCount] = useState(3);
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  useEffect(() => {
    let size = 3;
    let count = 3;
    if (difficulty === 'MEDIUM') {
      size = 3;
      count = 4;
    } else if (difficulty === 'HARD') {
      size = 4;
      count = 5;
    }
    setGridSize(size);
    setPatternCount(count);
    startRound(size, count);
  }, [difficulty, round]);

  const startRound = (size: number, count: number) => {
    const totalCells = size * size;
    const indices: number[] = [];
    while (indices.length < count) {
      const rand = Math.floor(Math.random() * totalCells);
      if (!indices.includes(rand)) indices.push(rand);
    }

    setTargetIndices(indices);
    setSelectedIndices([]);
    setPhase('memorize');

    // Show pattern for 2.5 seconds, then transition to recall phase
    setTimeout(() => {
      setPhase('recall');
    }, 2500);
  };

  const handleCellClick = (index: number) => {
    if (phase !== 'recall') return;
    if (selectedIndices.includes(index)) return;

    const nextSelected = [...selectedIndices, index];
    setSelectedIndices(nextSelected);

    if (nextSelected.length === targetIndices.length) {
      setPhase('result');
      // Calculate correctness
      const correctCount = nextSelected.filter((i) => targetIndices.includes(i)).length;
      const roundScore = Math.round((correctCount / targetIndices.length) * 100);

      setScore((s) => s + roundScore);

      setTimeout(() => {
        if (round < maxRounds) {
          setRound((r) => r + 1);
        } else {
          onFinishGame(roundScore, Math.round((correctCount / targetIndices.length) * 100));
        }
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div className="flex items-center justify-between text-sm font-extrabold text-slate-500">
        <span>Round {round} / {maxRounds}</span>
        <span>
          {phase === 'memorize' ? '👀 Memorize the blue tiles!' : '👈 Tap the tiles you remembered!'}
        </span>
      </div>

      <div
        className="grid gap-3 max-w-xs mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
          const isTarget = targetIndices.includes(idx);
          const isSelected = selectedIndices.includes(idx);

          let tileColor = 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';

          if (phase === 'memorize' && isTarget) {
            tileColor = 'bg-[#0052CC] border-blue-700 shadow-md ring-2 ring-blue-300 animate-pulse';
          } else if (phase === 'recall' && isSelected) {
            tileColor = isTarget
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-rose-500 border-rose-600 text-white';
          } else if (phase === 'result' && isTarget) {
            tileColor = 'bg-emerald-500 border-emerald-600';
          }

          return (
            <button
              key={idx}
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'recall'}
              className={`h-20 sm:h-24 rounded-2xl border-2 transition-all transform active:scale-95 shadow-sm ${tileColor}`}
            />
          );
        })}
      </div>
    </div>
  );
};
