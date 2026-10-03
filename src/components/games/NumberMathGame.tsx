import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface NumberMathGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

export const NumberMathGame: React.FC<NumberMathGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [question, setQuestion] = useState({ text: '', options: [''], answer: '' });
  const [round, setRound] = useState(1);
  const totalRounds = 4;

  useEffect(() => {
    generateMathProblem();
  }, [round, difficulty]);

  const generateMathProblem = () => {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let ans = num1 + num2;
    let text = `${num1} + ${num2} = ?`;

    if (difficulty === 'MEDIUM') {
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 10) + 1;
      ans = num1 - num2;
      text = `${num1} - ${num2} = ?`;
    } else if (difficulty === 'HARD') {
      num1 = Math.floor(Math.random() * 10) + 2;
      num2 = Math.floor(Math.random() * 5) + 2;
      ans = num1 * num2;
      text = `${num1} × ${num2} = ?`;
    }

    const wrong1 = ans + 2;
    const wrong2 = Math.max(1, ans - 3);
    const wrong3 = ans + 5;

    const opts = [String(ans), String(wrong1), String(wrong2), String(wrong3)].sort(
      () => Math.random() - 0.5
    );

    setQuestion({ text, options: opts, answer: String(ans) });
  };

  const handleSelectOption = (opt: string) => {
    if (opt === question.answer) {
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
      <p className="text-sm font-extrabold text-slate-500">Round {round} / {totalRounds}</p>

      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg max-w-xs mx-auto">
        <p className="text-4xl font-black tracking-wider">{question.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            className="py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#0052CC] rounded-2xl text-2xl font-black text-slate-900 dark:text-white shadow-sm transition-all active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
