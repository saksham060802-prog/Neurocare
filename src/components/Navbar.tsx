import React from 'react';
import { User } from 'firebase/auth';
import {
  Brain,
  MessageSquare,
  BookOpen,
  CheckSquare,
  BarChart2,
  Users,
  Settings,
  Home,
  Globe,
  Sun,
  Moon,
  Type,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GoogleAuthButton } from './GoogleAuthButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCaregiverMode: boolean;
  setIsCaregiverMode: (val: boolean) => void;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  isSimpleMode: boolean;
  setIsSimpleMode: (val: boolean) => void;
  userName: string;
  authUser?: User | null;
  isAuthLoading?: boolean;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isCaregiverMode,
  setIsCaregiverMode,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  isSimpleMode,
  setIsSimpleMode,
  userName,
  authUser = null,
  isAuthLoading = false,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const { currentLanguage, t, openLanguageModal } = useLanguage();

  const patientTabs = [
    { id: 'home', label: t('nav_home', 'Home'), icon: Home },
    { id: 'chat', label: t('nav_chat', 'AI Companion'), icon: MessageSquare },
    { id: 'cognitive', label: t('nav_games', 'Brain Training'), icon: Brain },
    { id: 'memory', label: t('nav_memory', 'Memory Vault'), icon: BookOpen },
    { id: 'tasks', label: t('nav_tasks', 'Tasks'), icon: CheckSquare },
    { id: 'progress', label: t('nav_progress', 'Progress'), icon: BarChart2 },
    { id: 'caregiver', label: t('nav_caregiver', 'Caregiver'), icon: Users },
  ];

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('extra-large');
    else setFontSize('normal');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-11 h-11 rounded-xl bg-[#18181B] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-[#111827] tracking-tight">
                  NeuroCare
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#18181B] text-white flex items-center gap-1.5">
                  NORTH-EAST CARE
                </span>
              </div>
              <span className="text-xs font-bold text-[#6B7280] block">
                {isCaregiverMode ? t('caregiver_portal', 'Caregiver Portal') : `AI Companion (${currentLanguage.nativeName})`}
              </span>
            </div>
          </div>

          {/* Navigation Pill Menu (Desktop) */}
          <nav className="hidden xl:flex items-center bg-[#F9FAFB] p-1.5 rounded-2xl border border-[#E5E7EB] gap-1">
            {patientTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`nav-tab-${tab.id}`}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 min-h-[42px] focus:ring-2 focus:ring-[#18181B] ${
                    isActive
                      ? 'bg-[#18181B] text-white shadow-xs'
                      : 'bg-transparent text-[#374151] hover:bg-white hover:text-[#111827]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Controls & Role Switches */}
          <div className="flex items-center space-x-2">
            {/* Google Workspace & Firebase Auth Button */}
            {onGoogleSignIn && onGoogleSignOut && (
              <GoogleAuthButton
                user={authUser}
                isLoading={isAuthLoading}
                onSignIn={onGoogleSignIn}
                onSignOut={onGoogleSignOut}
                compact={true}
              />
            )}

            {/* Language Selector Trigger Button */}
            <button
              onClick={openLanguageModal}
              id="language-selector-btn"
              title="Change Language"
              className="px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] hover:bg-gray-50 font-bold text-xs flex items-center space-x-1.5 min-h-[44px] transition-all"
            >
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="hidden sm:inline">{currentLanguage.nativeName} ({currentLanguage.name})</span>
              <Globe className="w-4 h-4 text-[#6B7280]" />
            </button>

            {/* Elderly Simple Mode Toggle */}
            <button
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              id="simple-mode-btn"
              title="Toggle Simple Mode"
              className={`px-3 py-2 rounded-xl border transition-all font-bold text-xs flex items-center space-x-1 min-h-[44px] ${
                isSimpleMode
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSimpleMode ? t('simple_mode', 'Simple Mode') : 'Mode'}
              </span>
            </button>

            {/* Font size button */}
            <button
              onClick={cycleFontSize}
              id="font-size-btn"
              title="Toggle Font Size"
              className="px-2.5 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] hover:bg-gray-50 font-bold text-xs flex items-center space-x-1 min-h-[44px] transition-all"
            >
              <Type className="w-4 h-4 text-[#6B7280]" />
              <span className="uppercase">{fontSize[0]}</span>
            </button>

            {/* High Contrast button */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              id="high-contrast-btn"
              title="Toggle High Contrast"
              className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center font-bold ${
                highContrast
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              {highContrast ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-[#6B7280]" />}
            </button>

            {/* Caregiver view pill */}
            <button
              onClick={() => {
                const next = !isCaregiverMode;
                setIsCaregiverMode(next);
                if (next) setActiveTab('caregiver');
                else setActiveTab('home');
              }}
              id="caregiver-role-toggle"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                isCaregiverMode
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isCaregiverMode ? 'Caregiver Active' : t('nav_caregiver', 'Caregiver')}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setActiveTab('settings')}
              id="settings-nav-btn"
              title="Settings"
              className={`p-2.5 rounded-xl border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center font-bold ${
                activeTab === 'settings'
                  ? 'bg-[#18181B] text-white border-[#18181B]'
                  : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Row */}
        <div className="xl:hidden flex items-center justify-around py-2 border-t border-[#E5E7EB] bg-white overflow-x-auto gap-1">
          {patientTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-xs font-bold min-h-[48px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#18181B] text-white'
                    : 'text-[#4B5563] hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
