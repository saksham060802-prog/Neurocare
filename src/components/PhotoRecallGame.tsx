import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { PhotoMemory, UserProfile } from '../types';
import { voiceController } from '../lib/voice';
import { useLanguage } from '../context/LanguageContext';

interface PhotoRecallGameProps {
  photos: PhotoMemory[];
  profile: UserProfile;
  onSubmitScore: (
    activityType: string,
    difficulty: string,
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    durationSeconds: number
  ) => Promise<any>;
  onFinishGame?: () => void;
}

export const PhotoRecallGame: React.FC<PhotoRecallGameProps> = ({
  photos,
  profile,
  onSubmitScore,
  onFinishGame,
}) => {
  const { currentLanguage, speechLocale, t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Fallback default photos if vault is empty
  const activePhotos = photos.length > 0 ? photos : [
    {
      id: 'def_1',
      userId: profile.userId,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      title: 'Granddaughter Riya in Shillong',
      relationTag: 'Granddaughter Riya',
      location: 'Shillong, Meghalaya',
      date: 'Diwali 2024',
      contextHint: 'Riya wore her yellow dress and brought marigold flowers.',
      uploadedBy: 'caregiver' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'def_2',
      userId: profile.userId,
      photoUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      title: 'Family Trip to Kaziranga National Park',
      relationTag: 'Kaziranga National Park',
      location: 'Kaziranga, Assam',
      date: 'November 2023',
      contextHint: 'We rode on elephant safari in the morning fog.',
      uploadedBy: 'caregiver' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  const currentPhoto = activePhotos[currentIndex % activePhotos.length];

  // Dynamic Question & Distractor Options Generator
  const generateOptions = (current: PhotoMemory) => {
    const mainTarget = current.relationTag;
    const distractors = ['Neighbor Sunita', 'Dr. Sen', 'Cousin Vikram', 'School Teacher']
      .filter((d) => d.toLowerCase() !== mainTarget.toLowerCase())
      .slice(0, 3);
    const combined = [mainTarget, ...distractors].sort(() => Math.random() - 0.5);
    return combined;
  };

  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    setOptions(generateOptions(currentPhoto));
    setSelectedOption(null);
    setIsEvaluated(false);
    setSpokenTranscript('');
    setStartTime(Date.now());

    // Auto Voice Read Aloud Question in regional locale
    const questionText = `${t('photo_recall_q', 'Look at this photo.')} ${t('who_is_this', 'Do you remember who this person or place is?')}`;
    voiceController.speak(questionText, undefined, speechLocale);
  }, [currentIndex, currentPhoto]);

  const handleSelectOption = (opt: string) => {
    if (isEvaluated) return;
    setSelectedOption(opt);
    evaluateAnswer(opt);
  };

  const evaluateAnswer = async (answer: string) => {
    const target = currentPhoto.relationTag.toLowerCase();
    const userClean = answer.toLowerCase().trim();

    // Flexible fuzzy matching
    const correct =
      userClean.includes(target) ||
      target.includes(userClean) ||
      (currentPhoto.title && userClean.includes(currentPhoto.title.toLowerCase()));

    setIsCorrect(correct);
    setIsEvaluated(true);

    if (correct) {
      setScoreCount((prev) => prev + 1);
      voiceController.speak(
        `${t('correct_praise', 'Wonderful!')} That is indeed ${currentPhoto.relationTag}.`,
        undefined,
        speechLocale
      );
    } else {
      voiceController.speak(
        `${t('incorrect_gentle', 'Good try!')} This is actually ${currentPhoto.relationTag}.`,
        undefined,
        speechLocale
      );
    }

    // Submit cognitive score to server API
    const duration = Math.round((Date.now() - startTime) / 1000);
    try {
      await onSubmitScore(
        'memory',
        'EASY',
        `Photo Recall: ${currentPhoto.title}`,
        answer,
        currentPhoto.relationTag,
        duration
      );
    } catch (e) {
      console.error('Error submitting recall score:', e);
    }
  };

  const handleVoiceAnswer = () => {
    if (isRecording) {
      voiceController.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceController.startListening(
        (transcript) => {
          setIsRecording(false);
          setSpokenTranscript(transcript);
          evaluateAnswer(transcript);
        },
        (err) => {
          console.error(err);
          setIsRecording(false);
        },
        () => setIsRecording(false),
        speechLocale,
        (interim) => {
          setSpokenTranscript(interim);
        }
      );
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= activePhotos.length) {
      setGameCompleted(true);
      voiceController.speak(
        `Great job! You completed all ${activePhotos.length} photo nostalgia levels with ${scoreCount + (isCorrect ? 1 : 0)} correct recall answers.`,
        undefined,
        speechLocale
      );
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (gameCompleted) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-[#E7E5E4] dark:border-stone-800 shadow-sm text-center max-w-xl mx-auto space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#1C1917] text-white flex items-center justify-center mx-auto shadow-md">
          <Trophy className="w-10 h-10 text-[#16A34A]" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#1C1917] dark:text-white">
            Photo Nostalgia Completed!
          </h2>
          <p className="text-sm font-semibold text-[#78716C] mt-1">
            Cognitive Recall Accuracy Score: {Math.round((scoreCount / activePhotos.length) * 100)}%
          </p>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-[#78716C]">Photos Recalled</p>
            <p className="text-xl font-black text-[#1C1917] dark:text-white">{activePhotos.length}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#78716C]">Correct Answers</p>
            <p className="text-xl font-black text-[#16A34A]">{scoreCount}</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScoreCount(0);
              setGameCompleted(false);
            }}
            className="px-6 py-3 bg-stone-100 dark:bg-stone-800 text-[#1C1917] dark:text-stone-200 border border-[#E7E5E4] rounded-2xl text-xs font-black flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          {onFinishGame && (
            <button
              onClick={onFinishGame}
              className="px-6 py-3 bg-[#1C1917] text-white rounded-2xl text-xs font-black hover:bg-stone-800"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Game Header Bar */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-[#E7E5E4] dark:border-stone-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1C1917] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#1C1917] dark:text-white">
              Photo-Recall Nostalgia Game
            </h2>
            <p className="text-xs font-semibold text-[#78716C]">
              Level {currentIndex + 1} of {activePhotos.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#16A34A] text-white">
            Score: {scoreCount}
          </span>
          <button
            onClick={() =>
              voiceController.speak(
                `Look at this photo of ${currentPhoto.title}. Do you remember who this is?`,
                undefined,
                speechLocale
              )
            }
            className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#1C1917] border border-[#E7E5E4] hover:bg-[#1C1917] hover:text-white transition-all"
            title="Repeat Question Aloud"
          >
            <Volume2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* Main Memory Photo Arena Card */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-[#E7E5E4] dark:border-stone-800 shadow-sm space-y-6">
        {/* Photo Container */}
        <div className="relative h-72 sm:h-80 bg-stone-100 dark:bg-stone-800 rounded-2xl overflow-hidden border-2 border-[#1C1917]/10 shadow-xs">
          <img
            src={currentPhoto.photoUrl}
            alt="Recall Trivia"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#1C1917]/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
            {currentPhoto.location || 'North-East Memory'}
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-center space-y-2">
          <p className="text-xl font-black text-[#1C1917] dark:text-white">
            Who is this person or where is this photo from?
          </p>
          {currentPhoto.contextHint && (
            <p className="text-xs font-semibold text-[#78716C] italic">
              Hint: "{currentPhoto.contextHint}"
            </p>
          )}
        </div>

        {/* Live Speech Recognition Feedback (If STT Active) */}
        {isRecording && (
          <div className="p-3 bg-stone-900 text-white rounded-2xl text-center space-y-1 animate-pulse">
            <p className="text-xs font-black uppercase tracking-wider text-amber-300">
              Listening to your spoken answer...
            </p>
            <p className="text-sm font-bold italic">
              "{spokenTranscript || 'Speak your answer now...'}"
            </p>
          </div>
        )}

        {/* Multiple Choice Tappable Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isThisCorrect = opt.toLowerCase() === currentPhoto.relationTag.toLowerCase();

            let optionStyle =
              'bg-stone-50 dark:bg-stone-800 text-[#1C1917] dark:text-stone-200 border-[#E7E5E4] dark:border-stone-700 hover:bg-stone-100';

            if (isEvaluated) {
              if (isThisCorrect) {
                optionStyle = 'bg-[#16A34A] text-white border-[#16A34A] font-black';
              } else if (isSelected && !isThisCorrect) {
                optionStyle = 'bg-[#DC2626] text-white border-[#DC2626] font-black';
              }
            }

            return (
              <button
                key={idx}
                disabled={isEvaluated}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border-2 text-base font-extrabold text-left transition-all flex items-center justify-between min-h-[56px] shadow-2xs ${optionStyle}`}
              >
                <span>{opt}</span>
                {isEvaluated && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                {isEvaluated && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Voice STT Reply Action Bar */}
        <div className="pt-4 border-t border-[#E7E5E4] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleVoiceAnswer}
            disabled={isEvaluated}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all min-h-[48px] ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#1C1917] text-white hover:bg-stone-800'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-white" />}
            <span>{isRecording ? 'Stop Recording' : 'Speak Answer via Mic'}</span>
          </button>

          {isEvaluated && (
            <button
              onClick={handleNextQuestion}
              className="w-full sm:w-auto px-8 py-3 bg-[#1C1917] text-white rounded-2xl text-xs font-black flex items-center justify-center space-x-2 hover:bg-stone-800 transition-all min-h-[48px]"
            >
              <span>Next Photo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
