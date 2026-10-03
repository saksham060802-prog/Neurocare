import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from '../i18n/translations';
import { LanguageService } from '../services/LanguageService';

interface LanguageContextType {
  currentLanguage: LanguageOption;
  languageCode: string;
  speechLocale: string;
  setLanguage: (code: string) => void;
  t: (key: string, defaultText?: string) => string;
  isModalOpen: boolean;
  openLanguageModal: () => void;
  closeModal: () => void;
  closeLanguageModal: () => void;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'neurocare_lang';

function normalizeLangCode(inputCode: string): string {
  if (!inputCode) return 'en-IN';
  const matchDirect = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === inputCode.toLowerCase()
  );
  if (matchDirect) return matchDirect.code;

  const prefix = inputCode.split('-')[0].toLowerCase();
  if (prefix === 'as') return 'as-IN';
  if (prefix === 'bn') return 'bn-IN';
  if (prefix === 'mni' || prefix === 'meitei') return 'mni-IN';
  if (prefix === 'lus' || prefix === 'mizo') return 'lus-IN';
  if (prefix === 'kha' || prefix === 'khasi') return 'kha-IN';
  if (prefix === 'grt' || prefix === 'garo') return 'grt-IN';
  if (prefix === 'hi') return 'hi-IN';
  if (prefix === 'en') return 'en-IN';

  return 'en-IN';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mindsaathi_language');
      if (saved) return normalizeLangCode(saved);
    }
    return 'en-IN';
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mindsaathi_language');
      return !saved;
    }
    return true;
  });

  useEffect(() => {
    LanguageService.setLanguage(currentCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, currentCode);
    }
  }, [currentCode]);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentCode) || SUPPORTED_LANGUAGES[0];

  const speechLocale = currentLanguage.speechLocale || `${currentCode}`;

  const handleSetLanguage = (code: string) => {
    const validCode = normalizeLangCode(code);
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === validCode) || SUPPORTED_LANGUAGES[0];
    setCurrentCode(lang.code);
    LanguageService.setLanguage(lang.code);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang.code);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const code = currentCode;
    const shortCode = code.split('-')[0];
    if (TRANSLATIONS[code] && TRANSLATIONS[code][key]) {
      return TRANSLATIONS[code][key];
    }
    if (TRANSLATIONS[shortCode] && TRANSLATIONS[shortCode][key]) {
      return TRANSLATIONS[shortCode][key];
    }
    if (TRANSLATIONS['en-IN'] && TRANSLATIONS['en-IN'][key]) {
      return TRANSLATIONS['en-IN'][key];
    }
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return defaultText || key;
  };

  const openLanguageModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageCode: currentCode,
        speechLocale,
        setLanguage: handleSetLanguage,
        t,
        isModalOpen,
        openLanguageModal,
        closeModal,
        closeLanguageModal: closeModal,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

