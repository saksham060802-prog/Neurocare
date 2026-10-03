import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ArrowLeft, Lightbulb, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { CognitiveActivityType, DifficultyLevel } from '../../types';
import { LanguageService } from '../../services/LanguageService';

interface GameContainerProps {
  title: string;
  category: CognitiveActivityType;
  instructions: string;
  difficulty: DifficultyLevel;
  onBack: () => void;
  onComplete: (score: number, accuracy: number, durationSeconds: number) => void;
  children: (props: {
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    onFinish: (finalScore: number, finalAccuracy: number) => void;
    showHint: boolean;
    toggleHint: () => void;
  }) => React.ReactNode;
  hintText?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  title,
  category,
  instructions,
  difficulty,
  onBack,
  onComplete,
  children,
  hintText,
}) => {
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState(100);

  useEffect(() => {
    let interval: any = null;
    if (!isGameOver) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleFinish = (earnedScore: number, accuracy: number) => {
    setIsGameOver(true);
    setFinalAccuracy(accuracy);
    onComplete(earnedScore, accuracy, timer);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-xs space-y-6 text-[#18181B]">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-[#111827] hover:bg-gray-100 font-bold text-sm bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{LanguageService.t('choose_activity')}</span>
        </button>

        <div className="flex items-center space-x-3 text-sm font-bold">
          <div className="flex items-center space-x-1.5 text-[#111827] bg-[#F9FAFB] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{LanguageService.t('score')}: {score}</span>
          </div>

          <div className="flex items-center space-x-1.5 text-[#111827] bg-[#F9FAFB] px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
            <Clock className="w-4 h-4 text-[#6B7280]" />
            <span>{formatTime(timer)}</span>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-[#18181B] text-white">
            {difficulty}
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-[#1C1917] dark:text-white flex items-center gap-2">
            <span>🧠</span> {title}
          </h2>
          <p className="text-sm font-semibold text-[#78716C] dark:text-stone-400 mt-1">
            {instructions}
          </p>
        </div>

        {hintText && !isGameOver && (
          <button
            onClick={() => setShowHint((prev) => !prev)}
            className="self-start sm:self-auto inline-flex items-center space-x-1.5 text-xs font-black text-[#1C1917] bg-stone-100 border border-[#E7E5E4] px-3 py-2 rounded-xl hover:bg-stone-200 transition-all shrink-0 focus:ring-2 focus:ring-[#1C1917]"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>{showHint ? 'Hide Hint' : LanguageService.t('hints')}</span>
          </button>
        )}
      </div>

      {/* Hint Alert Box */}
      {showHint && hintText && !isGameOver && (
        <div className="p-4 bg-stone-100 border border-[#E7E5E4] rounded-2xl text-xs font-bold text-[#1C1917] animate-fade-in flex items-start space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p>{hintText}</p>
        </div>
      )}

      {/* Game Stage Area */}
      {!isGameOver ? (
        <div className="min-h-[320px] flex items-center justify-center py-4">
          {children({
            score,
            setScore,
            onFinish: handleFinish,
            showHint,
            toggleHint: () => setShowHint((prev) => !prev),
          })}
        </div>
      ) : (
        /* Game Over Results Overlay */
        <div className="py-12 px-4 text-center space-y-6 bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 animate-fade-in">
          <div className="w-20 h-20 bg-stone-200 dark:bg-stone-800 text-[#1C1917] dark:text-white rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-[#E7E5E4]">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-[#1C1917] dark:text-white">
              {LanguageService.t('game_over')}
            </h3>
            <p className="text-[#78716C] dark:text-stone-300 font-bold text-base">
              {LanguageService.t('excellent_job')}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700">
              <p className="text-xs font-bold text-[#78716C]">{LanguageService.t('score')}</p>
              <p className="text-2xl font-black text-[#1C1917] dark:text-white">{score}</p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700">
              <p className="text-xs font-bold text-[#78716C]">{LanguageService.t('accuracy')}</p>
              <p className="text-2xl font-black text-[#1C1917] dark:text-white">{finalAccuracy}%</p>
            </div>

            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700">
              <p className="text-xs font-bold text-[#78716C]">{LanguageService.t('time')}</p>
              <p className="text-2xl font-black text-[#1C1917] dark:text-white">{formatTime(timer)}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-2xl bg-[#1C1917] hover:bg-stone-800 text-white font-black text-sm shadow-md flex items-center space-x-2 focus:ring-2 focus:ring-[#1C1917]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{LanguageService.t('choose_activity')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
