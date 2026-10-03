import React, { useState, useEffect } from 'react';
import {
  Brain,
  Flame,
  Target,
  Sparkles,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CognitiveActivityType, DifficultyLevel, CognitiveQuestion, CognitiveSession } from '../types';
import { LanguageService } from '../services/LanguageService';

// Import Pure Client Game Components
import { GameContainer } from './games/GameContainer';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { MemoryMatrixGame } from './games/MemoryMatrixGame';
import { SequenceRecallGame } from './games/SequenceRecallGame';
import { OddOneOutGame } from './games/OddOneOutGame';
import { ReactionTapGame } from './games/ReactionTapGame';
import { RuleSwitchGame } from './games/RuleSwitchGame';
import { NumberMathGame } from './games/NumberMathGame';
import { StoryRecallGame } from './games/StoryRecallGame';
import { DailyBrainWorkout } from './games/DailyBrainWorkout';

import { PhotoRecallGame } from './PhotoRecallGame';
import { PhotoMemory, UserProfile } from '../types';

interface CognitiveViewProps {
  onQuestionSubmit: (
    activityType: CognitiveActivityType,
    difficulty: DifficultyLevel,
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    durationSeconds: number
  ) => Promise<any>;
  sessions: CognitiveSession[];
  photos?: PhotoMemory[];
  profile?: UserProfile;
}

interface GameDefinition {
  id: string;
  title: string;
  category: string;
  categoryKey: CognitiveActivityType;
  description: string;
  icon: string;
}

export const CognitiveView: React.FC<CognitiveViewProps> = ({
  onQuestionSubmit,
  sessions,
  photos,
  profile,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);
  const [isDailyWorkoutActive, setIsDailyWorkoutActive] = useState<boolean>(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('EASY');

  // AI Question Mode state
  const [isAiQuestionMode, setIsAiQuestionMode] = useState<boolean>(false);
  const [aiQuestionDomain, setAiQuestionDomain] = useState<CognitiveActivityType>('memory');
  const [question, setQuestion] = useState<CognitiveQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultEvaluation, setResultEvaluation] = useState<any>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const gameDefinitions: GameDefinition[] = [
    {
      id: 'photo_recall',
      title: 'Photo-Recall Nostalgia Game',
      category: 'Memory & Family',
      categoryKey: 'memory',
      description: 'Recall family members, trips, and occasions from your Memory Vault.',
      icon: '🖼️',
    },
    {
      id: 'memory_match',
      title: 'Memory Card Match',
      category: 'Memory',
      categoryKey: 'memory',
      description: 'Flip pairs of visual cards to match identical items and build recall.',
      icon: '🎴',
    },
    {
      id: 'memory_matrix',
      title: 'Memory Pattern Matrix',
      category: 'Memory',
      categoryKey: 'memory',
      description: 'Memorize glowing tile patterns on a grid and recall them accurately.',
      icon: '🟦',
    },
    {
      id: 'sequence_recall',
      title: 'Sequence Repeat',
      category: 'Auditory & Pattern',
      categoryKey: 'pattern',
      description: 'Follow the flashing symbol sequence and repeat in exact order.',
      icon: '🔁',
    },
    {
      id: 'odd_one_out',
      title: 'Odd One Out Focus',
      category: 'Attention & Focus',
      categoryKey: 'attention',
      description: 'Identify the single item that differs from surrounding distractors.',
      icon: '🎯',
    },
    {
      id: 'reaction_tap',
      title: 'Reaction Flash Tap',
      category: 'Speed & Reaction',
      categoryKey: 'reasoning',
      description: 'Tap as fast as possible when the target color flashes green.',
      icon: '⚡',
    },
    {
      id: 'rule_switch',
      title: 'Rule Switching Flex',
      category: 'Mental Flexibility',
      categoryKey: 'reasoning',
      description: 'Adapt instantly when matching criteria switches between color and shape.',
      icon: '🔄',
    },
    {
      id: 'number_math',
      title: 'Mental Arithmetic',
      category: 'Numbers & Math',
      categoryKey: 'reasoning',
      description: 'Sharpen numeric reasoning with quick, senior-friendly math problems.',
      icon: '🔢',
    },
    {
      id: 'story_recall',
      title: 'Story Memory Recall',
      category: 'Language & Story',
      categoryKey: 'language',
      description: 'Read a warm short story and recall key names, times, and details.',
      icon: '📖',
    },
    {
      id: 'ai_qna',
      title: 'AI Personal Q&A Exercise',
      category: 'Personal Memory',
      categoryKey: 'memory',
      description: 'Adaptive AI Q&A tailored to your personal facts and daily knowledge.',
      icon: '🧠',
    },
  ];

  const categoryFilters = [
    { id: 'all', label: LanguageService.t('all_categories') },
    { id: 'memory', label: LanguageService.t('cat_memory') },
    { id: 'attention', label: LanguageService.t('cat_attention') },
    { id: 'speed', label: LanguageService.t('cat_speed') },
    { id: 'flexibility', label: LanguageService.t('cat_flexibility') },
    { id: 'words', label: LanguageService.t('cat_words') },
    { id: 'numbers', label: LanguageService.t('cat_numbers') },
  ];

  const filteredGames = gameDefinitions.filter((g) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'memory') return g.categoryKey === 'memory';
    if (activeCategoryFilter === 'attention') return g.categoryKey === 'attention';
    if (activeCategoryFilter === 'speed') return g.id === 'reaction_tap';
    if (activeCategoryFilter === 'flexibility') return g.id === 'rule_switch';
    if (activeCategoryFilter === 'words') return g.categoryKey === 'language';
    if (activeCategoryFilter === 'numbers') return g.id === 'number_math';
    return true;
  });

  // AI Question fetch
  const fetchAiQuestion = async (domain: CognitiveActivityType, diff: DifficultyLevel) => {
    setIsLoading(true);
    setResultEvaluation(null);
    setSelectedOption('');
    setShowHint(false);
    setTimerSeconds(0);

    try {
      const res = await fetch(`/api/cognitive/question?activityType=${domain}&difficulty=${diff}`);
      const data = await res.json();
      setQuestion(data);
      setIsTimerRunning(true);
    } catch (e) {
      console.error('Error fetching cognitive question:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAiQuestionMode) {
      fetchAiQuestion(aiQuestionDomain, currentDifficulty);
    }
  }, [isAiQuestionMode, aiQuestionDomain]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleGameFinish = async (score: number, accuracy: number, durationSeconds: number) => {
    if (!activeGame) return;
    await onQuestionSubmit(
      activeGame.categoryKey,
      currentDifficulty,
      activeGame.title,
      `${score}%`,
      '100%',
      durationSeconds
    );
  };

  const handleAiAnswerSubmit = async () => {
    if (!selectedOption || !question || isLoading) return;
    setIsTimerRunning(false);
    setIsLoading(true);

    try {
      const res = await onQuestionSubmit(
        aiQuestionDomain,
        currentDifficulty,
        question.question,
        selectedOption,
        question.expectedAnswer,
        timerSeconds || 15
      );

      setResultEvaluation(res.evaluation);
      if (res.nextDifficulty) {
        setCurrentDifficulty(res.nextDifficulty);
      }
    } catch (e) {
      console.error('Error submitting cognitive answer:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDailyWorkoutActive) {
    return (
      <div className="pb-12 animate-fade-in">
        <DailyBrainWorkout
          onWorkoutComplete={(score) => {
            onQuestionSubmit('memory', 'EASY', 'Daily Workout Complete', `${score}%`, '100%', 300);
          }}
          onClose={() => setIsDailyWorkoutActive(false)}
        />
      </div>
    );
  }

  if (activeGame) {
    return (
      <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
        <GameContainer
          title={activeGame.title}
          category={activeGame.categoryKey}
          instructions={activeGame.description}
          difficulty={currentDifficulty}
          onBack={() => setActiveGame(null)}
          onComplete={handleGameFinish}
        >
          {({ setScore, onFinish }) => {
            if (activeGame.id === 'photo_recall') {
              return (
                <PhotoRecallGame
                  photos={photos || []}
                  profile={
                    profile || {
                      userId: 'p1',
                      name: 'Elder Patient',
                      preferredLanguage: 'hi-IN',
                      emergencyContact: '',
                      voiceSpeed: 1.0,
                    }
                  }
                  onSubmitScore={onQuestionSubmit}
                  onFinishGame={() => setActiveGame(null)}
                />
              );
            }
            if (activeGame.id === 'memory_match') {
              return <MemoryMatchGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'memory_matrix') {
              return <MemoryMatrixGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'sequence_recall') {
              return <SequenceRecallGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'odd_one_out') {
              return <OddOneOutGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'reaction_tap') {
              return <ReactionTapGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'rule_switch') {
              return <RuleSwitchGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'number_math') {
              return <NumberMathGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            if (activeGame.id === 'story_recall') {
              return <StoryRecallGame difficulty={currentDifficulty} onFinishGame={onFinish} setScore={setScore} />;
            }
            return null;
          }}
        </GameContainer>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in text-[#18181B]">
      {/* Title Header Banner */}
      <div className="bg-[#18181B] rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4 text-[#18181B]" />
            <span>{LanguageService.t('games_title')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Cognitive Training Center
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
            {LanguageService.t('games_subtitle')}
          </p>
        </div>

        {/* 10-Minute Daily Workout CTA Button */}
        <button
          onClick={() => setIsDailyWorkoutActive(true)}
          className="w-full md:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-gray-100 text-[#111827] font-bold text-base transition-all flex items-center justify-center space-x-3 shrink-0 shadow-xs"
        >
          <Flame className="w-6 h-6 text-[#18181B]" />
          <div className="text-left">
            <span className="block text-[10px] font-bold uppercase text-[#6B7280]">DAILY ROUTINE</span>
            <span>{LanguageService.t('start_workout')}</span>
          </div>
        </button>
      </div>

      {/* Category Filter Scrollbar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryFilters.map((cat) => {
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryFilter(cat.id);
                setIsAiQuestionMode(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* AI Q&A Exercise Container if selected */}
      {isAiQuestionMode ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <button
              onClick={() => setIsAiQuestionMode(false)}
              className="text-xs font-bold text-[#18181B] hover:underline"
            >
              ← Back to All Games
            </button>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              AI PERSONAL EXERCISE
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#18181B] animate-spin mx-auto" />
              <p className="text-[#111827] font-bold text-base">Generating AI exercise...</p>
            </div>
          ) : question ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#111827] leading-relaxed">
                {question.question}
              </h2>

              {question.hint && (
                <div>
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs font-bold text-[#18181B] flex items-center space-x-1 underline"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>{LanguageService.t('hints')}</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-[#F9FAFB] text-[#111827] text-sm font-medium border border-[#E5E7EB]">
                      💡 {question.hint}
                    </div>
                  )}
                </div>
              )}

              {question.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(opt)}
                      className={`p-4 rounded-xl border text-left font-bold transition-all ${
                        selectedOption === opt
                          ? 'border-[#18181B] bg-[#18181B] text-white'
                          : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {resultEvaluation ? (
                <div className="p-6 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] font-bold">
                  {resultEvaluation.feedback}
                </div>
              ) : (
                <button
                  disabled={!selectedOption || isLoading}
                  onClick={handleAiAnswerSubmit}
                  className="w-full py-3.5 rounded-xl bg-[#18181B] text-white hover:bg-[#27272A] border border-[#18181B] font-bold text-sm transition-all"
                >
                  Submit Answer
                </button>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        /* Brain Games Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white rounded-2xl p-6 border border-[#E5E7EB] flex flex-col justify-between space-y-4 shadow-xs hover:border-[#18181B] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    {game.icon}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB]">
                    {game.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    {game.title}
                  </h3>
                  <p className="text-[#6B7280] text-xs font-medium leading-relaxed mt-1">
                    {game.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (game.id === 'ai_qna') {
                    setIsAiQuestionMode(true);
                  } else {
                    setActiveGame(game);
                  }
                }}
                className="w-full py-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-white font-bold text-xs border border-[#18181B] transition-all flex items-center justify-center space-x-2 shadow-2xs"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{LanguageService.t('start_game')}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History Log */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-[#111827] flex items-center space-x-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Recent Cognitive Training Sessions</span>
        </h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-[#6B7280] font-medium">No sessions recorded yet. Try an exercise above!</p>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-bold gap-2"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
                  <span className="capitalize font-bold text-[#111827]">
                    {s.activityType} Exercise
                  </span>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase">({s.difficulty})</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold text-[#111827]">{s.score}% Score</span>
                  <span className="text-[10px] text-[#6B7280] font-medium">
                    {new Date(s.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
