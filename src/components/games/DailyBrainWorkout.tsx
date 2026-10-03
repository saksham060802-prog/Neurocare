import React, { useState } from 'react';
import { Flame, CheckCircle, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { GameContainer } from './GameContainer';
import { MemoryMatchGame } from './MemoryMatchGame';
import { OddOneOutGame } from './OddOneOutGame';
import { ReactionTapGame } from './ReactionTapGame';
import { NumberMathGame } from './NumberMathGame';
import { CognitiveActivityType, DifficultyLevel } from '../../types';
import { LanguageService } from '../../services/LanguageService';

interface DailyBrainWorkoutProps {
  onWorkoutComplete: (totalScore: number) => void;
  onClose: () => void;
}

const WORKOUT_STEPS: {
  id: string;
  title: string;
  category: CognitiveActivityType;
  instructions: string;
  difficulty: DifficultyLevel;
}[] = [
  {
    id: 'memory_match',
    title: 'Memory Match',
    category: 'memory',
    instructions: 'Flip cards and match the pairs to warm up your memory.',
    difficulty: 'EASY',
  },
  {
    id: 'attention_odd',
    title: 'Selective Attention',
    category: 'attention',
    instructions: 'Find the odd item that differs from the rest.',
    difficulty: 'EASY',
  },
  {
    id: 'speed_reaction',
    title: 'Reaction Flash',
    category: 'reasoning',
    instructions: 'Tap the screen as fast as you can when it turns GREEN.',
    difficulty: 'EASY',
  },
  {
    id: 'number_math',
    title: 'Quick Arithmetic',
    category: 'reasoning',
    instructions: 'Solve the mental math question accurately.',
    difficulty: 'EASY',
  },
];

export const DailyBrainWorkout: React.FC<DailyBrainWorkoutProps> = ({
  onWorkoutComplete,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [accumulatedScores, setAccumulatedScores] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentStep = WORKOUT_STEPS[currentStepIdx];

  const handleStepComplete = (score: number, accuracy: number, durationSeconds: number) => {
    const nextScores = [...accumulatedScores, score];
    setAccumulatedScores(nextScores);

    if (currentStepIdx + 1 < WORKOUT_STEPS.length) {
      setCurrentStepIdx((idx) => idx + 1);
    } else {
      setIsFinished(true);
      const avgScore = Math.round(nextScores.reduce((a, b) => a + b, 0) / nextScores.length);
      onWorkoutComplete(avgScore);
    }
  };

  const totalAvg = accumulatedScores.length
    ? Math.round(accumulatedScores.reduce((a, b) => a + b, 0) / accumulatedScores.length)
    : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Progress Top Bar */}
      {!isFinished && (
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-[#E7E5E4] dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-stone-100 dark:bg-stone-800 text-[#1C1917] dark:text-stone-200 rounded-xl">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </span>
            <div>
              <p className="text-sm font-black text-[#1C1917] dark:text-white">
                {LanguageService.t('todays_brain_workout')}
              </p>
              <p className="text-xs font-bold text-[#78716C]">
                Exercise {currentStepIdx + 1} of {WORKOUT_STEPS.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-36 sm:w-48">
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden border border-[#E7E5E4] dark:border-stone-700">
              <div
                className="bg-[#1C1917] dark:bg-stone-300 h-full transition-all duration-300"
                style={{ width: `${((currentStepIdx + 1) / WORKOUT_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Game Stage or Workout Summary */}
      {!isFinished ? (
        <GameContainer
          key={currentStep.id}
          title={currentStep.title}
          category={currentStep.category}
          instructions={currentStep.instructions}
          difficulty={currentStep.difficulty}
          onBack={onClose}
          onComplete={handleStepComplete}
        >
          {({ setScore, onFinish }) => {
            if (currentStep.id === 'memory_match') {
              return <MemoryMatchGame difficulty={currentStep.difficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (currentStep.id === 'attention_odd') {
              return <OddOneOutGame difficulty={currentStep.difficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (currentStep.id === 'speed_reaction') {
              return <ReactionTapGame difficulty={currentStep.difficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            return <NumberMathGame difficulty={currentStep.difficulty} onFinishGame={onFinish} setScore={setScore} />;
          }}
        </GameContainer>
      ) : (
        /* Daily Workout Completion Screen */
        <div className="bg-white dark:bg-stone-900 p-8 sm:p-12 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 text-center space-y-6 shadow-2xl animate-fade-in">
          <div className="w-24 h-24 bg-[#1C1917] text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl ring-8 ring-stone-100 dark:ring-stone-800">
            <Trophy className="w-12 h-12 text-amber-300" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[#1C1917] dark:text-stone-200 font-black text-xs border border-[#E7E5E4]">
              <CheckCircle className="w-4 h-4 text-[#1C1917] dark:text-stone-200" />
              <span>{LanguageService.t('workout_completed')}</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] dark:text-white pt-2">
              Congratulations! 🎉
            </h2>
            <p className="text-[#78716C] dark:text-stone-300 font-semibold text-base max-w-md mx-auto">
              You completed all 4 brain exercises today! Your memory and focus skills are sharpening every day.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700">
              <p className="text-xs font-black text-[#78716C]">Workout Average Score</p>
              <p className="text-3xl font-black text-[#1C1917] dark:text-white">{totalAvg}</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700">
              <p className="text-xs font-black text-[#78716C]">Daily Streak</p>
              <div className="flex items-center justify-center space-x-1">
                <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
                <span className="text-3xl font-black text-[#1C1917] dark:text-white">5 Days</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-[#1C1917] text-white font-black text-base shadow-md hover:bg-stone-800 transition-all flex items-center justify-center space-x-2 mx-auto focus:ring-2 focus:ring-[#1C1917]"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Return to Brain Center</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
