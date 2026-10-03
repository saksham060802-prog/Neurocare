import React, { useState } from 'react';
import { DifficultyLevel } from '../../types';
import { LanguageService } from '../../services/LanguageService';

interface StoryRecallGameProps {
  difficulty: DifficultyLevel;
  onFinishGame: (score: number, accuracy: number) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const STORIES = [
  {
    title: 'A Sunny Morning Walk',
    text: 'Grandma Clara took a walk in the morning garden at 8:00 AM. She carried a basket of blue flowers and greeted her neighbor Mr. Thomas.',
    questions: [
      {
        q: 'What time did Grandma Clara take her walk?',
        options: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM'],
        answer: '8:00 AM',
      },
      {
        q: 'What color were the flowers in her basket?',
        options: ['Red', 'Yellow', 'Blue', 'White'],
        answer: 'Blue',
      },
    ],
  },
  {
    title: 'The Teahouse Visit',
    text: 'Uncle Raj went to the cozy teahouse near the lake on Tuesday. He ordered warm cardamom tea and a slice of cinnamon cake.',
    questions: [
      {
        q: 'What day did Uncle Raj visit the teahouse?',
        options: ['Monday', 'Tuesday', 'Friday', 'Sunday'],
        answer: 'Tuesday',
      },
      {
        q: 'What kind of tea did he order?',
        options: ['Green Tea', 'Cardamom Tea', 'Mint Tea', 'Black Tea'],
        answer: 'Cardamom Tea',
      },
    ],
  },
];

export const StoryRecallGame: React.FC<StoryRecallGameProps> = ({
  difficulty,
  onFinishGame,
  setScore,
}) => {
  const [step, setStep] = useState<'read' | 'question'>('read');
  const [storyIndex] = useState(Math.floor(Math.random() * STORIES.length));
  const [qIndex, setQIndex] = useState(0);

  const currentStory = STORIES[storyIndex];
  const currentQ = currentStory.questions[qIndex];

  const handleAnswer = (opt: string) => {
    if (opt === currentQ.answer) {
      setScore((s) => s + 50);
      if (qIndex + 1 < currentStory.questions.length) {
        setQIndex((i) => i + 1);
      } else {
        onFinishGame(100, 100);
      }
    } else {
      onFinishGame(50, 50);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 text-center">
      {step === 'read' ? (
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            📖 {currentStory.title}
          </h3>
          <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200 font-semibold">
            "{currentStory.text}"
          </p>
          <button
            onClick={() => setStep('question')}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-md"
          >
            I'm Ready for Questions!
          </button>
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
          <p className="text-xs font-bold text-slate-400">Question {qIndex + 1} of {currentStory.questions.length}</p>
          <p className="text-xl font-black text-slate-900 dark:text-white">{currentQ.q}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className="p-4 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl text-base font-bold text-slate-900 dark:text-white hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
