import React from 'react';
import {
  Mic,
  Brain,
  MessageSquare,
  BookOpen,
  CheckSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  Heart,
  Award,
  Flame,
  Globe,
  Pill,
  PhoneCall,
  Dumbbell,
} from 'lucide-react';
import { UserProfile, Memory, Task, ProgressMetrics } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HomeViewProps {
  profile: UserProfile;
  memories: Memory[];
  tasks: Task[];
  metrics: ProgressMetrics;
  setActiveTab: (tab: string) => void;
  onVoiceTalkClick: () => void;
  isSimpleMode?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  memories,
  tasks,
  metrics,
  setActiveTab,
  onVoiceTalkClick,
  isSimpleMode = false,
}) => {
  const { currentLanguage, t } = useLanguage();
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const familyMemories = memories.filter((m) => m.category === 'family');
  const featuredMemory = familyMemories.length > 0 ? familyMemories[0] : memories[0];

  const getGreeting = () => {
    const greetingKey = t('welcome_greeting', 'Good day');
    return greetingKey;
  };

  /* Elderly Simple Mode View */
  if (isSimpleMode) {
    return (
      <div className="space-y-8 pb-12 max-w-3xl mx-auto animate-fade-in">
        {/* Simple Mode Banner */}
        <div className="bg-[#18181B] p-8 sm:p-12 rounded-3xl text-white space-y-6 border border-[#18181B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="px-4 py-2 rounded-full bg-white text-[#111827] font-bold text-sm uppercase">
              ⚡ {t('simple_mode', 'SIMPLE MODE')} ({currentLanguage.flag} {currentLanguage.nativeName})
            </span>
            <span className="text-sm font-medium text-gray-300">Accessible View</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            {getGreeting()}, {(profile?.name || 'Ramesh').split(' ')[0]} 👋
          </h1>

          <p className="text-xl font-bold text-gray-200 leading-relaxed">
            {t('tap_to_speak', 'Tap to Speak')} - {t('ai_companion_subtitle', 'Speak or type to recall memories or check tasks.')}
          </p>

          {/* Giant Mic Button */}
          <button
            onClick={onVoiceTalkClick}
            className="w-full py-7 rounded-2xl bg-white hover:bg-gray-100 text-[#111827] font-black text-2xl flex items-center justify-center space-x-4 border border-white transition-all transform active:scale-95 shadow-md"
          >
            <Mic className="w-10 h-10 fill-current" />
            <span>{t('talk_to_ai', 'TALK TO AI COMPANION')}</span>
          </button>
        </div>

        {/* Quick Action Buttons Pill Bar */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-left hover:bg-gray-50 transition-all shadow-xs"
          >
            <Pill className="w-8 h-8 text-[#18181B] shrink-0" />
            <div>
              <p className="font-bold text-base text-[#111827]">{t('quick_medicine', 'Medicine Reminder')}</p>
              <p className="text-xs font-medium text-[#6B7280]">{t('medicine_reminder', 'Take Medicine')}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('caregiver')}
            className="p-5 rounded-2xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-left hover:bg-gray-50 transition-all shadow-xs"
          >
            <PhoneCall className="w-8 h-8 text-[#18181B] shrink-0" />
            <div>
              <p className="font-bold text-base text-[#111827]">{t('quick_emergency', 'Emergency Contacts')}</p>
              <p className="text-xs font-medium text-[#6B7280]">{profile?.emergencyContact || 'Doctor / Family'}</p>
            </div>
          </button>
        </div>

        {/* Big Simple Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => setActiveTab('chat')}
            className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-left space-y-4 hover:border-[#18181B] transition-all shadow-xs"
          >
            <MessageSquare className="w-12 h-12 text-[#18181B]" />
            <h2 className="text-2xl font-black text-[#111827]">
              {t('nav_chat', 'AI Companion')}
            </h2>
            <p className="text-base font-medium text-[#4B5563]">
              Open chat & speak naturally with your AI companion.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('cognitive')}
            className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-left space-y-4 hover:border-[#18181B] transition-all shadow-xs"
          >
            <Brain className="w-12 h-12 text-[#18181B]" />
            <h2 className="text-2xl font-black text-[#111827]">
              {t('nav_games', 'Brain Training')}
            </h2>
            <p className="text-base font-medium text-[#4B5563]">
              Play easy memory and focus exercises.
            </p>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-left space-y-4 hover:border-[#18181B] transition-all shadow-xs"
          >
            <BookOpen className="w-12 h-12 text-[#18181B]" />
            <h2 className="text-2xl font-black text-[#111827]">
              {t('nav_memory', 'Memory Vault')}
            </h2>
            <p className="text-base font-medium text-[#4B5563]">
              View stored family facts ({memories.length}).
            </p>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className="p-8 rounded-2xl bg-white border border-[#E5E7EB] text-left space-y-4 hover:border-[#18181B] transition-all shadow-xs"
          >
            <CheckSquare className="w-12 h-12 text-[#18181B]" />
            <h2 className="text-2xl font-black text-[#111827]">
              {t('nav_tasks', 'Tasks & Reminders')}
            </h2>
            <p className="text-base font-medium text-[#4B5563]">
              Check daily medicine reminders ({pendingTasks.length}).
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-[#18181B]">
      {/* Hero Welcome Banner */}
      <section className="bg-[#18181B] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 text-[#18181B]" />
            <span>{t('app_subtitle', 'AI Voice Companion & Brain Training')} ({currentLanguage.flag} {currentLanguage.nativeName})</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            {getGreeting()}, {(profile?.name || 'Ramesh').split(' ')[0]} 👋
          </h1>

          <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed font-medium">
            {t('ai_companion_subtitle', 'I am your personal AI companion, here to hold warm conversations, preserve family memories, assist with reminders, and keep your mind sharp.')}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <button
              onClick={onVoiceTalkClick}
              id="talk-to-me-btn"
              className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-white text-[#18181B] hover:bg-gray-100 font-bold text-base transition-all active:scale-95 min-h-[48px] shadow-xs"
            >
              <Mic className="w-5 h-5 fill-current" />
              <span>{t('talk_to_ai', 'Talk to AI Companion')}</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              id="start-conversation-btn"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold text-base transition-all min-h-[48px]"
            >
              <MessageSquare className="w-5 h-5" />
              <span>{t('nav_chat', 'AI Companion')}</span>
            </button>
          </div>
        </div>

        {/* Floating Quick Metrics Pill Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/20">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-medium">{t('streak_days', 'Active Streak')}: <strong className="font-bold">{metrics?.streakDays ?? 5} Days</strong></span>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/20">
            <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
            <span className="text-xs font-medium">{t('my_memory', 'Memories Preserved')}: <strong className="font-bold">{memories.length} Items</strong></span>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/20">
            <Brain className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium">{t('level', 'Level')}: <strong className="font-bold uppercase">{metrics?.currentLevel ?? 'MEDIUM'}</strong></span>
          </div>
        </div>

        {/* Background Visual Graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Brain className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Quick Action Buttons Row */}
      <section className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-[#111827] flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#18181B]" />
          <span>{t('quick_actions', 'Quick Actions')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-left hover:bg-gray-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#111827]">{t('quick_medicine', 'Medicine Reminder')}</p>
              <p className="text-xs font-medium text-[#6B7280]">{pendingTasks.length} pending today</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('caregiver')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-left hover:bg-gray-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#111827]">{t('quick_emergency', 'Emergency Contacts')}</p>
              <p className="text-xs font-medium text-[#6B7280]">{profile.emergencyContact || 'Family & Doctor'}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('cognitive')}
            className="p-4 rounded-xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-left hover:bg-gray-50 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-[#18181B] text-white flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#111827]">{t('quick_daily_workout', 'Daily Workout')}</p>
              <p className="text-xs font-medium text-[#6B7280]">10-Min Brain Exercise</p>
            </div>
          </button>
        </div>
      </section>

      {/* Main Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setActiveTab('chat')}
          className="group bg-white p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4 transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1 text-[#111827]">{t('nav_chat', 'AI Companion')}</h3>
            <p className="text-sm font-medium text-[#4B5563] leading-relaxed">
              Have warm voice conversations, ask about family, or set reminders.
            </p>
          </div>
          <div className="flex items-center font-bold text-sm text-[#18181B] mt-6 group-hover:translate-x-1 transition-transform">
            <span>{t('talk_to_ai', 'Talk to AI Companion')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('cognitive')}
          className="group bg-white p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4 transition-colors">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1 text-[#111827]">{t('nav_games', 'Brain Training')}</h3>
            <p className="text-sm font-medium text-[#4B5563] leading-relaxed">
              Adaptive memory and focus training calibrated for senior comfort.
            </p>
          </div>
          <div className="flex items-center font-bold text-sm text-[#18181B] mt-6 group-hover:translate-x-1 transition-transform">
            <span>{t('start_workout', 'Start Exercise')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('memory')}
          className="group bg-white p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1 text-[#111827]">{t('nav_memory', 'Memory Vault')}</h3>
            <p className="text-sm font-medium text-[#4B5563] leading-relaxed">
              Safely browse stored personal facts, places, and relatives ({memories.length}).
            </p>
          </div>
          <div className="flex items-center font-bold text-sm text-[#18181B] mt-6 group-hover:translate-x-1 transition-transform">
            <span>{t('my_memory', 'Browse Memory Vault')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('tasks')}
          className="group bg-white p-6 rounded-2xl border border-[#E5E7EB] hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#18181B] text-white flex items-center justify-center mb-4 transition-colors">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-1 text-[#111827]">{t('nav_tasks', 'Tasks & Reminders')}</h3>
            <p className="text-sm font-medium text-[#4B5563] leading-relaxed">
              {pendingTasks.length} {t('pending', 'pending')} task{pendingTasks.length === 1 ? '' : 's'} scheduled for today.
            </p>
          </div>
          <div className="flex items-center font-bold text-sm text-[#18181B] mt-6 group-hover:translate-x-1 transition-transform">
            <span>{t('my_tasks', 'View Schedule')}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </section>

      {/* Memory Spotlight & Today's Schedule */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Memory Spotlight */}
        {featuredMemory && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-[#E5E7EB] flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{t('my_memory', 'Memory Spotlight')}</span>
                </span>
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider capitalize">{featuredMemory.category}</span>
              </div>
              <blockquote className="text-lg font-bold text-[#111827] italic leading-relaxed">
                "{featuredMemory.content}"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280] font-medium">
                Saved in AI Memory Vault
              </span>
              <button
                onClick={() => setActiveTab('memory')}
                className="text-xs font-bold text-[#18181B] hover:underline px-2 py-1 rounded"
              >
                All Memories →
              </button>
            </div>
          </div>
        )}

        {/* Pending Reminders / Tasks */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#111827] flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#18181B]" />
              <span>{t('tasks_title', 'Today’s Reminders')} ({pendingTasks.length})</span>
            </h2>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-sm font-bold text-[#18181B] hover:underline px-2 py-1 rounded"
            >
              Open Schedule →
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-[#374151] border border-dashed border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
              <p className="font-bold text-base">All tasks for today are completed! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#111827]">{task.title}</p>
                    {task.description && (
                      <p className="text-xs text-[#6B7280] font-medium">{task.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-bold">
                      {new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cognitive Progress Overview */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#111827] flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#18181B]" />
            <span>{t('my_progress', 'Cognitive Performance Summary')}</span>
          </h2>
          <span className="px-3.5 py-1.5 rounded-full bg-[#18181B] text-white text-xs font-bold">
            {t('accuracy', 'Overall Accuracy')}: {metrics?.overallScore ?? 83}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] text-center space-y-1">
            <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">{t('cat_memory', 'Memory')}</span>
            <div className="text-2xl font-black text-[#111827]">{metrics?.memoryScore ?? 82}%</div>
          </div>
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] text-center space-y-1">
            <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">{t('cat_attention', 'Attention')}</span>
            <div className="text-2xl font-black text-[#111827]">{metrics?.attentionScore ?? 78}%</div>
          </div>
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] text-center space-y-1">
            <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">{t('cat_problem_solving', 'Reasoning')}</span>
            <div className="text-2xl font-black text-[#111827]">{metrics?.reasoningScore ?? 85}%</div>
          </div>
          <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] text-center space-y-1">
            <span className="text-xs text-[#6B7280] font-bold uppercase tracking-wider block">{t('cat_words', 'Language')}</span>
            <div className="text-2xl font-black text-[#111827]">{metrics?.languageScore ?? 88}%</div>
          </div>
        </div>
      </section>
    </div>
  );
};
