import React, { useState } from 'react';
import {
  Home,
  MessageSquare,
  Gamepad2,
  Image as ImageIcon,
  HeartPulse,
  Stethoscope,
  Settings,
  Mic,
  MicOff,
  Globe,
  Brain,
  Bell,
  Sparkles,
  Phone,
  ShieldAlert,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { UserProfile, ProgressMetrics, PhotoMemory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ResponsiveLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: 'patient' | 'caregiver' | 'doctor';
  setUserRole?: (role: 'patient' | 'caregiver' | 'doctor') => void;
  profile?: UserProfile;
  metrics?: ProgressMetrics;
  photoMemories?: PhotoMemory[];
  isRecording?: boolean;
  onToggleVoiceMic?: () => void;
  interimVoiceText?: string;
  onTriggerTestCall?: () => void;
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'patient',
  setUserRole = (_role?: 'patient' | 'caregiver' | 'doctor') => {},
  profile,
  metrics,
  photoMemories = [],
  isRecording = false,
  onToggleVoiceMic = () => {},
  interimVoiceText,
  onTriggerTestCall = () => {},
  children,
}) => {
  const { currentLanguage, openLanguageModal } = useLanguage();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Voice AI', icon: MessageSquare },
    { id: 'cognitive', label: 'Brain Training', icon: Gamepad2 },
    { id: 'memory', label: 'Memory Vault', icon: ImageIcon },
    { id: 'caregiver', label: 'Caregiver Portal', icon: HeartPulse },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-[#18181B] font-sans flex flex-col lg:flex-row">
      {/* ==========================================
          1. DESKTOP & LAPTOP SIDEBAR (>1024px)
      ========================================== */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-[#E5E7EB] p-6 sticky top-0 h-screen justify-between z-20 shrink-0 shadow-xs">
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center space-x-3 pb-5 border-b border-[#E5E7EB]">
            <div className="w-11 h-11 rounded-2xl bg-[#18181B] text-white flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-[#111827]">
                NeuroCare
              </h1>
              <p className="text-xs font-bold text-[#6B7280]">
                NORTH-EAST CARE
              </p>
            </div>
          </div>

          {/* Tri-Role Switcher Segmented Control */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-[#6B7280]">
              Portal Role Access
            </label>
            <div className="grid grid-cols-3 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB] gap-1">
              <button
                onClick={() => {
                  setUserRole('patient');
                  if (activeTab === 'doctor') setActiveTab('home');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userRole === 'patient'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'bg-transparent text-[#374151] hover:text-[#111827]'
                }`}
              >
                Elder
              </button>
              <button
                onClick={() => {
                  setUserRole('caregiver');
                  setActiveTab('caregiver');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userRole === 'caregiver'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'bg-transparent text-[#374151] hover:text-[#111827]'
                }`}
              >
                Caregiver
              </button>
              <button
                onClick={() => {
                  setUserRole('doctor');
                  setActiveTab('doctor');
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  userRole === 'doctor'
                    ? 'bg-[#18181B] text-white shadow-xs'
                    : 'bg-transparent text-[#374151] hover:text-[#111827]'
                }`}
              >
                Doctor
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    isActive
                      ? 'bg-[#18181B] text-white border-[#18181B] shadow-xs'
                      : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
          {/* Quick Language Selector Button */}
          <button
            onClick={openLanguageModal}
            className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between text-xs font-bold text-[#374151] hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#6B7280]" />
              <span>{currentLanguage.flag} {currentLanguage.nativeName}</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#18181B] text-white rounded-md">
              Change
            </span>
          </button>

          {/* Test Call Generator Button */}
          <button
            onClick={onTriggerTestCall}
            className="w-full py-2.5 px-3 bg-[#18181B] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 hover:bg-[#27272A] transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Simulate Incoming Call</span>
          </button>

          {/* User Profile Card */}
          <div className="p-3 bg-white rounded-xl flex items-center space-x-3 border border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-sm">
              {(profile?.name || 'Ramesh').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111827] truncate">
                {profile?.name || 'Ramesh Sharma'}
              </p>
              <p className="text-[10px] font-medium text-[#6B7280] truncate">
                {profile?.preferredLanguage || 'Hindi'} • Age {profile?.ageRange || '70-75'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          2. TABLET MID-BAR HEADER (640px - 1024px)
      ========================================== */}
      <div className="hidden sm:flex lg:hidden bg-white border-b border-[#E5E7EB] px-6 py-4 items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-bold">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#111827]">NeuroCare</h1>
            <p className="text-xs font-medium text-[#6B7280]">NORTH-EAST CARE</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === item.id ? 'bg-[#18181B] text-white border-[#18181B]' : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={onTriggerTestCall}
            className="p-2 bg-[#18181B] text-white border border-[#18181B] rounded-xl text-xs font-bold hover:bg-[#27272A]"
            title="Simulate Call"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==========================================
          3. MAIN CONTENT AREA & TABLET DUAL-PANE
      ========================================== */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F1F3F5]">
        {/* Mobile Header (<640px) */}
        <header className="sm:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-bold">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#111827] leading-tight">
                NeuroCare
              </h2>
              <p className="text-[10px] font-bold text-[#6B7280]">
                NORTH-EAST CARE • {currentLanguage.flag}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onTriggerTestCall}
              className="p-2 bg-[#18181B] text-white rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-[#27272A]"
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px]">Call</span>
            </button>
            <button
              onClick={openLanguageModal}
              className="p-2 bg-white text-[#374151] rounded-xl text-xs font-bold border border-[#E5E7EB] hover:bg-gray-50"
            >
              <Globe className="w-4.5 h-4.5 text-[#6B7280]" />
            </button>
          </div>
        </header>

        {/* Low-Latency Live Voice Transcript Banner (When Mic is Active) */}
        {isRecording && (
          <div className="bg-black text-white px-4 py-3 flex items-center justify-between sticky top-14 sm:top-0 z-20 border-b-2 border-black animate-fade-in">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Instant Voice Listening...
                </p>
                <p className="text-sm font-bold italic text-neutral-200 truncate max-w-md">
                  {interimVoiceText || 'Listening to your voice... Speak now.'}
                </p>
              </div>
            </div>
            <button
              onClick={onToggleVoiceMic}
              className="px-3 py-1 bg-white text-black border border-black rounded-lg text-xs font-black hover:bg-black hover:text-white transition-colors"
            >
              Stop
            </button>
          </div>
        )}

        {/* Content Router + Tablet Dual-Pane Split Layout */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 sm:pb-12">
          {/* Tablet Split Pane: Left Active View, Right Memory/Stats Panel */}
          <div className="hidden sm:grid lg:block grid-cols-12 gap-6">
            <div className="col-span-7 lg:col-span-12 space-y-6">
              {children}
            </div>

            {/* Tablet Right Side Memory & Stats Quick Panel (640px - 1024px) */}
            <div className="col-span-5 lg:hidden space-y-5 sticky top-20 h-fit">
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111827]">
                    Cognitive Status
                  </h3>
                  <span className="text-xs font-bold text-white bg-[#18181B] px-2.5 py-0.5 rounded-full">
                    Clarity {metrics?.overallScore ?? 83}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    <p className="text-[10px] font-bold text-[#6B7280]">Streak</p>
                    <p className="text-lg font-black text-[#111827]">{metrics?.streakDays ?? 5} Days</p>
                  </div>
                  <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    <p className="text-[10px] font-bold text-[#6B7280]">Level</p>
                    <p className="text-lg font-black text-[#111827]">{metrics?.currentLevel ?? 'MEDIUM'}</p>
                  </div>
                </div>
              </div>

              {/* Memory Vault Quick Carousel */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111827]">
                    Family Vault ({(photoMemories || []).length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('memory')}
                    className="text-xs font-bold text-[#18181B] hover:underline px-1.5 py-0.5 rounded"
                  >
                    View All
                  </button>
                </div>
                {(photoMemories || []).slice(0, 2).map((photo) => (
                  <div key={photo.id} className="flex items-center space-x-3 p-2 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                    <img
                      src={photo.photoUrl}
                      alt={photo.title}
                      className="w-12 h-12 object-cover rounded-lg border border-[#E5E7EB]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#111827] truncate">{photo.title}</p>
                      <p className="text-[10px] font-medium text-[#6B7280] truncate">{photo.relationTag}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & Desktop standard View fallback */}
          <div className="sm:hidden lg:block">
            {children}
          </div>
        </div>

        {/* ==========================================
            4. MOBILE BOTTOM NAVIGATION BAR (<640px)
            Includes Sticky 72px Central Primary Mic Button!
        ========================================== */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-3 py-2 z-40 shadow-lg">
          <div className="flex items-center justify-around relative max-w-md mx-auto">
            {/* Home / Voice */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 min-h-[48px] py-1 rounded-xl transition-all ${
                activeTab === 'home' ? 'text-[#18181B] font-black' : 'text-[#6B7280] font-bold'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-[10px] mt-0.5 font-bold">Home</span>
            </button>

            {/* Cognitive Training */}
            <button
              onClick={() => setActiveTab('cognitive')}
              className={`flex flex-col items-center justify-center w-14 min-h-[48px] py-1 rounded-xl transition-all ${
                activeTab === 'cognitive' ? 'text-[#18181B] font-black' : 'text-[#6B7280] font-bold'
              }`}
            >
              <Gamepad2 className="w-6 h-6" />
              <span className="text-[10px] mt-0.5 font-bold">Training</span>
            </button>

            {/* STICKY CENTRAL 72PX HERO VOICE MIC BUTTON */}
            <div className="relative -top-5 flex flex-col items-center justify-center">
              <button
                onClick={() => {
                  onToggleVoiceMic();
                  if (activeTab !== 'chat') setActiveTab('chat');
                }}
                id="mobile-central-sticky-mic-btn"
                aria-label={isRecording ? 'Stop Voice Recording' : 'Start Instant Voice Assistant'}
                className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-white border-4 border-white transition-all duration-200 transform active:scale-95 shadow-md ${
                  isRecording
                    ? 'bg-[#18181B] animate-recording-pulse text-white'
                    : 'bg-[#18181B] hover:bg-[#27272A] text-white'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 animate-bounce" />
                )}
              </button>
              <span className="text-[10px] font-bold text-[#18181B] mt-0.5">
                Voice AI
              </span>
            </div>

            {/* Memories Vault */}
            <button
              onClick={() => setActiveTab('memory')}
              className={`flex flex-col items-center justify-center w-14 min-h-[48px] py-1 rounded-xl transition-all ${
                activeTab === 'memory' ? 'text-[#18181B] font-black' : 'text-[#6B7280] font-bold'
              }`}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-[10px] mt-0.5 font-bold">Vault</span>
            </button>

            {/* Caregiver Portal */}
            <button
              onClick={() => setActiveTab('caregiver')}
              className={`flex flex-col items-center justify-center w-14 min-h-[48px] py-1 rounded-xl transition-all ${
                activeTab === 'caregiver' ? 'text-[#18181B] font-black' : 'text-[#6B7280] font-bold'
              }`}
            >
              <HeartPulse className="w-6 h-6" />
              <span className="text-[10px] mt-0.5 font-bold">Care</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
