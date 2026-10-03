import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Volume2, VolumeX, Sparkles, Brain, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageOption } from '../i18n/translations';

interface LanguageModalProps {
  onSelectLanguage?: (lang: LanguageOption) => void;
  isFirstVisit?: boolean;
  onClose?: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  onSelectLanguage,
  isFirstVisit = false,
  onClose,
}) => {
  const { languages, currentLanguage, setLanguage, t, closeModal, isModalOpen } = useLanguage();
  const [selectedCode, setSelectedCode] = useState<string>(currentLanguage.code);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    setSelectedCode(currentLanguage.code);
  }, [currentLanguage]);

  const filteredLanguages = languages.filter((lang) => {
    const q = searchTerm.toLowerCase();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.nativeName.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleContinue = () => {
    setLanguage(selectedCode);
    const selectedLangObj = languages.find((l) => l.code === selectedCode) || languages[0];
    if (onSelectLanguage) onSelectLanguage(selectedLangObj);
    if (onClose) onClose();
    else closeModal();
  };

  const handleKeyDown = (e: React.KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedCode(code);
    }
  };

  if (!isModalOpen && !isFirstVisit) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Choose Your Language"
    >
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-[#E7E5E4] dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-[#1C1917] p-6 sm:p-8 text-white text-center shrink-0 relative overflow-hidden">
          {onClose && !isFirstVisit && (
            <button
              onClick={onClose}
              aria-label="Close language selector"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors focus:ring-2 focus:ring-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-stone-200 text-xs font-black uppercase tracking-widest mb-3 backdrop-blur-md">
            <Brain className="w-4 h-4 text-amber-300" />
            <span>NEUROCARE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center justify-center gap-2">
            NeuroCare
          </h1>

          <div className="mt-2 space-y-1">
            <p className="text-xl sm:text-2xl font-black text-white">
              {t('choose_language', 'Choose your language')}
            </p>
            <p className="text-base sm:text-lg font-bold text-stone-300">
              अपनी भाषा चुनें / เลือกภาษา
            </p>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto mt-3 leading-relaxed font-semibold">
            {t(
              'select_language_desc',
              'Select your preferred language for voice assistance, cognitive brain training, and personal memory recall.'
            )}
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E7E5E4] dark:border-stone-800 shrink-0 bg-stone-50 dark:bg-stone-900">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              placeholder={t('search_language_placeholder', 'Search language / भाषा खोजें...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-2xl text-base font-bold text-[#1C1917] dark:text-white placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
            />
          </div>
        </div>

        {/* Language Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 grow max-h-[48vh] scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Languages">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setSelectedCode(lang.code)}
                  onKeyDown={(e) => handleKeyDown(e, lang.code)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 relative focus:ring-2 focus:ring-[#1C1917] focus:outline-none ${
                    isSelected
                      ? 'bg-stone-100 dark:bg-stone-800 border-[#1C1917] ring-2 ring-[#1C1917] shadow-sm'
                      : 'bg-white dark:bg-stone-800/80 border-[#E7E5E4] dark:border-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-lg font-black text-[#1C1917] dark:text-white">
                        {lang.nativeName} ({lang.name})
                      </span>
                    </div>

                    <div className="pt-1">
                      {lang.voiceSupported ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold text-[#1C1917] dark:text-stone-200 bg-stone-200 dark:bg-stone-700 px-2.5 py-0.5 rounded-full border border-stone-300 dark:border-stone-600">
                          <Volume2 className="w-3 h-3 shrink-0 text-[#1C1917] dark:text-stone-200" />
                          <span>{t('voice_supported', 'Voice Supported')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#78716C] bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
                          <VolumeX className="w-3 h-3 shrink-0" />
                          <span>{t('voice_coming_soon', 'Text Only')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-[#1C1917] dark:text-white shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-8 text-[#78716C]">
              <p className="font-bold">No language found matching "{searchTerm}"</p>
              <p className="text-xs mt-1">Try searching by English or script name.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E7E5E4] dark:border-stone-800 bg-stone-50 dark:bg-stone-900 shrink-0 flex items-center justify-between gap-4">
          {!isFirstVisit && onClose && (
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-[#E7E5E4] dark:border-stone-700 text-[#1C1917] dark:text-stone-300 font-bold text-sm hover:bg-stone-100"
            >
              {t('cancel', 'Cancel')}
            </button>
          )}

          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#1C1917] text-white font-black text-base shadow-md hover:bg-stone-800 transition-all flex items-center justify-center space-x-2 shrink-0 ml-auto focus:ring-2 focus:ring-[#1C1917] focus:ring-offset-2"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{t('continue', 'Continue')} / आगे बढ़ें</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const LanguageSelectionScreen = LanguageModal;
