import React, { useState, useEffect } from 'react';
import { DifficultyLevel } from '../../types';

interface ReactionTapGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

export const ReactionTapGame: React.FC<ReactionTapGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [state, setState] = useState<'waiting' | 'ready' | 'go' | 'early' | 'success'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  useEffect(() => {
    let timer: any;
    if (state === 'waiting') {
      const delay = Math.floor(Math.random() * 3000) + 2000;
      setState('ready');
      timer = setTimeout(() => {
        setState('go');
        setStartTime(Date.now());
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [state]);

  const handleClick = () => {
    if (state === 'ready') {
      setState('early');
    } else if (state === 'go') {
      const ms = Date.now() - startTime;
      setReactionMs(ms);
      setState('success');
      const calcScore = Math.max(20, Math.min(100, Math.round(100000 / ms)));
      setScore(calcScore);
      setTimeout(() => {
        onFinishGame(calcScore, 100);
      }, 1200);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 text-center">
      <div
        onClick={handleClick}
        className={`w-full min-h-[260px] rounded-3xl border-4 flex flex-col items-center justify-center p-6 cursor-pointer transition-all shadow-lg select-none ${
          state === 'ready'
            ? 'bg-amber-500 border-amber-600 text-white'
            : state === 'go'
            ? 'bg-emerald-500 border-emerald-600 text-white animate-pulse'
            : state === 'early'
            ? 'bg-rose-500 border-rose-600 text-white'
            : 'bg-[#0052CC] border-blue-700 text-white'
        }`}
      >
        {state === 'ready' && (
          <div className="space-y-2">
            <span className="text-4xl">🔴</span>
            <p className="text-2xl font-black">Wait for GREEN...</p>
          </div>
        )}

        {state === 'go' && (
          <div className="space-y-2">
            <span className="text-5xl">⚡</span>
            <p className="text-3xl font-black">TAP NOW!</p>
          </div>
        )}

        {state === 'early' && (
          <div className="space-y-2">
            <span className="text-4xl">⚠️</span>
            <p className="text-2xl font-black">Too early! Click to try again.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setState('waiting');
              }}
              className="mt-2 px-4 py-2 bg-white text-rose-700 rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'success' && reactionMs && (
          <div className="space-y-2">
            <span className="text-5xl">🎉</span>
            <p className="text-3xl font-black">{reactionMs} ms!</p>
            <p className="text-sm font-bold opacity-90">Great reaction time!</p>
          </div>
        )}
      </div>
    </div>
  );
};
