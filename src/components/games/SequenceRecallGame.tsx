import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface SequenceRecallGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const BUTTONS = [
  { id: 0, color: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-600', activeColor: 'bg-emerald-300 ring-4 ring-emerald-200', label: '🟢 Green' },
  { id: 1, color: 'bg-rose-500 hover:bg-rose-400 border-rose-600', activeColor: 'bg-rose-300 ring-4 ring-rose-200', label: '🔴 Red' },
  { id: 2, color: 'bg-amber-500 hover:bg-amber-400 border-amber-600', activeColor: 'bg-amber-300 ring-4 ring-amber-200', label: '🟡 Yellow' },
  { id: 3, color: 'bg-blue-500 hover:bg-blue-400 border-blue-600', activeColor: 'bg-blue-300 ring-4 ring-blue-200', label: '🔵 Blue' },
];

export const SequenceRecallGame: React.FC<SequenceRecallGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [round, setRound] = useState(1);
  const targetRounds = difficulty === 'EASY' ? 3 : difficulty === 'MEDIUM' ? 4 : 5;

  useEffect(() => {
    startNewRound(1, []);
  }, [difficulty]);

  const startNewRound = (currentRound: number, prevSeq: number[]) => {
    const nextItem = Math.floor(Math.random() * 4);
    const newSeq = [...prevSeq, nextItem];
    setSequence(newSeq);
    setPlayerInput([]);
    playSequence(newSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsPlayingSeq(true);
    let step = 0;
    const interval = setInterval(() => {
      if (step < seq.length) {
        setActiveBtn(seq[step]);
        setTimeout(() => setActiveBtn(null), 500);
        step++;
      } else {
        clearInterval(interval);
        setIsPlayingSeq(false);
      }
    }, 900);
  };

  const handleButtonClick = (btnId: number) => {
    if (isPlayingSeq) return;

    // Highlight button temporarily
    setActiveBtn(btnId);
    setTimeout(() => setActiveBtn(null), 250);

    const nextInput = [...playerInput, btnId];
    setPlayerInput(nextInput);

    // Check correctness
    const currentIndex = nextInput.length - 1;
    if (nextInput[currentIndex] !== sequence[currentIndex]) {
      // Wrong tap!
      onFinishGame(Math.max(10, (round - 1) * 25), 60);
      return;
    }

    if (nextInput.length === sequence.length) {
      setScore((s) => s + 25);
      if (round < targetRounds) {
        setRound((r) => r + 1);
        setTimeout(() => {
          startNewRound(round + 1, sequence);
        }, 1000);
      } else {
        onFinishGame(100, 100);
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-center">
      <p className="text-sm font-extrabold text-slate-500">
        {isPlayingSeq ? '👀 Watch the sequence carefully...' : '👇 Repeat the sequence!'}
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
        {BUTTONS.map((btn) => {
          const isActive = activeBtn === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => handleButtonClick(btn.id)}
              disabled={isPlayingSeq}
              className={`h-28 sm:h-32 rounded-3xl border-4 font-black text-white text-lg transition-all shadow-md transform active:scale-95 ${
                isActive ? btn.activeColor : btn.color
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
