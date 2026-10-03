import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface RuleSwitchGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

export const RuleSwitchGame: React.FC<RuleSwitchGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [rule, setRule] = useState<'COLOR' | 'SHAPE'>('COLOR');
  const [targetItem, setTargetItem] = useState({ color: 'RED', shape: 'CIRCLE' });
  const [round, setRound] = useState(1);
  const totalRounds = 4;

  useEffect(() => {
    generateTarget();
  }, [round]);

  const generateTarget = () => {
    const nextRule = Math.random() > 0.5 ? 'COLOR' : 'SHAPE';
    setRule(nextRule);

    const colors = ['RED', 'BLUE'];
    const shapes = ['CIRCLE', 'SQUARE'];

    setTargetItem({
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  };

  const handleChoice = (type: 'RED' | 'BLUE' | 'CIRCLE' | 'SQUARE') => {
    let isCorrect = false;
    if (rule === 'COLOR' && (type === targetItem.color)) isCorrect = true;
    if (rule === 'SHAPE' && (type === targetItem.shape)) isCorrect = true;

    if (isCorrect) {
      setScore((s) => s + 25);
      if (round < totalRounds) {
        setRound((r) => r + 1);
      } else {
        onFinishGame(100, 100);
      }
    } else {
      onFinishGame(50, 50);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      {/* Rule Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border-2 border-indigo-200 dark:border-indigo-800 space-y-1">
        <p className="text-xs font-black uppercase text-indigo-500">Active Rule</p>
        <p className="text-2xl font-black text-indigo-900 dark:text-indigo-200">
          Match by: <span className="underline decoration-amber-400">{rule}</span>
        </p>
      </div>

      {/* Target Display */}
      <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 max-w-xs mx-auto flex flex-col items-center justify-center space-y-2">
        <div
          className={`w-20 h-20 ${
            targetItem.color === 'RED' ? 'bg-rose-500' : 'bg-blue-500'
          } ${targetItem.shape === 'CIRCLE' ? 'rounded-full' : 'rounded-2xl'}`}
        />
        <p className="text-xs font-bold text-slate-400">
          {targetItem.color} {targetItem.shape}
        </p>
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {rule === 'COLOR' ? (
          <>
            <button
              onClick={() => handleChoice('RED')}
              className="py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-sm"
            >
              🔴 RED
            </button>
            <button
              onClick={() => handleChoice('BLUE')}
              className="py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl shadow-sm"
            >
              🔵 BLUE
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleChoice('CIRCLE')}
              className="py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm"
            >
              ⚪ CIRCLE
            </button>
            <button
              onClick={() => handleChoice('SQUARE')}
              className="py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-sm"
            >
              ⬛ SQUARE
            </button>
          </>
        )}
      </div>
    </div>
  );
};
