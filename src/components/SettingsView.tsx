import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Type,
  Sun,
  Moon,
  Volume2,
  ShieldCheck,
  User,
  Trash2,
  Key,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onClearHistory: () => void;
  healthInfo: { geminiConfigured: boolean; azureConfigured: boolean };
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  onClearHistory,
  healthInfo,
}) => {
  const [name, setName] = useState(profile?.name || 'Ramesh Sharma');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'English');
  const [isSaved, setIsSaved] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      name,
      emergencyContact,
      preferredLanguage,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#1C1917] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex items-center justify-between border border-stone-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone-200 text-xs font-black uppercase tracking-wider mb-2 backdrop-blur-md">
            <SettingsIcon className="w-4 h-4 text-white" />
            <span>Preferences & System Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Settings & Accessibility</h1>
          <p className="text-stone-300 text-sm mt-1 max-w-xl leading-relaxed">
            Customize font scaling, high-contrast visual modes, profile details, and inspect system service status.
          </p>
        </div>
      </div>

      {/* Accessibility Preferences */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 shadow-xs space-y-6">
        <h2 className="text-xl font-black text-[#1C1917] dark:text-white flex items-center space-x-2">
          <Type className="w-5 h-5 text-[#1C1917] dark:text-white" />
          <span>Display & Accessibility</span>
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 gap-3">
            <div>
              <p className="font-black text-[#1C1917] dark:text-white">Text Size Scaling</p>
              <p className="text-xs text-[#78716C] font-semibold">Adjust font scaling across the application</p>
            </div>
            <div className="flex items-center space-x-2">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black capitalize transition-all focus:ring-2 focus:ring-[#1C1917] ${
                    fontSize === size
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'bg-white dark:bg-stone-900 border border-[#E7E5E4] dark:border-stone-700 text-[#1C1917] dark:text-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {size.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700">
            <div>
              <p className="font-black text-[#1C1917] dark:text-white">High Contrast Mode</p>
              <p className="text-xs text-[#78716C] font-semibold">Optimize contrast for low vision readability</p>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`p-3 rounded-xl border font-black text-xs transition-all focus:ring-2 focus:ring-[#1C1917] ${
                highContrast
                  ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
                  : 'bg-white dark:bg-stone-900 border border-[#E7E5E4] dark:border-stone-700 text-[#1C1917] dark:text-stone-300 hover:bg-stone-100'
              }`}
            >
              {highContrast ? 'Enabled ☀️' : 'Disabled 🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Services Status */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-[#1C1917] dark:text-white flex items-center space-x-2">
          <Key className="w-5 h-5 text-[#1C1917] dark:text-white" />
          <span>AI Engine & Service Integrations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-black text-[#1C1917] dark:text-white">Gemini AI Model</p>
              <p className="text-xs text-[#78716C] font-semibold">Server-side cognitive RAG & reasoning</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1 bg-stone-200 dark:bg-stone-700 text-[#1C1917] dark:text-stone-200 border border-stone-300 dark:border-stone-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{healthInfo.geminiConfigured ? 'Active' : 'Offline Fallback'}</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-black text-[#1C1917] dark:text-white">Voice & Speech API</p>
              <p className="text-xs text-[#78716C] font-semibold">Native browser WebSpeech recognition</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-700 text-[#1C1917] dark:text-stone-200 border border-stone-300 dark:border-stone-600 text-xs font-black flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Browser Native</span>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 shadow-xs space-y-6">
        <h2 className="text-xl font-black text-[#1C1917] dark:text-white flex items-center space-x-2">
          <User className="w-5 h-5 text-[#1C1917] dark:text-white" />
          <span>User Profile</span>
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#1C1917] dark:text-stone-300 uppercase mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-2xl text-base font-semibold text-[#1C1917] dark:text-white focus:ring-2 focus:ring-[#1C1917]"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#1C1917] dark:text-stone-300 uppercase mb-1">
              Emergency Contact Information
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full p-3.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-2xl text-base font-semibold text-[#1C1917] dark:text-white focus:ring-2 focus:ring-[#1C1917]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600">Profile saved successfully!</span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-[#1C1917] text-white font-black text-sm shadow-md hover:bg-stone-800 transition-all focus:ring-2 focus:ring-[#1C1917]"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4 shadow-xs">
        <h2 className="text-lg font-black text-rose-600 flex items-center space-x-2">
          <Trash2 className="w-5 h-5" />
          <span>Data Control</span>
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black text-[#1C1917] dark:text-stone-200 text-sm">Clear Chat Dialogue History</p>
            <p className="text-xs text-[#78716C] font-semibold">Resets conversational history while preserving stored memory facts.</p>
          </div>
          <button
            onClick={onClearHistory}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
};
