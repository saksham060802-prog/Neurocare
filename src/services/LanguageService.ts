import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from '../i18n/translations';

const STORAGE_KEY = 'neurocare_lang';

export class LanguageService {
  private static currentLangCode: string = 'en-IN';

  public static initLanguage(preferredLanguageNameOrCode?: string): string {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('mindsaathi_language');
      if (saved) {
        this.currentLangCode = saved;
        return saved;
      }
    }

    if (preferredLanguageNameOrCode) {
      const match = SUPPORTED_LANGUAGES.find(
        (l) =>
          l.code.toLowerCase() === preferredLanguageNameOrCode.toLowerCase() ||
          l.name.toLowerCase() === preferredLanguageNameOrCode.toLowerCase()
      );
      if (match) {
        this.currentLangCode = match.code;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, match.code);
        }
        return match.code;
      }
    }

    this.currentLangCode = 'en-IN';
    return 'en-IN';
  }

  public static getSupportedLanguages(): LanguageOption[] {
    return SUPPORTED_LANGUAGES;
  }

  public static getCurrentLanguage(): LanguageOption {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLangCode) ||
      SUPPORTED_LANGUAGES[0]
    );
  }

  public static getCurrentLanguageCode(): string {
    return this.currentLangCode;
  }

  public static setLanguage(code: string): LanguageOption {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
    this.currentLangCode = lang.code;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang.code);
    }
    return lang;
  }

  public static t(key: string, defaultText?: string): string {
    const code = this.currentLangCode;
    if (TRANSLATIONS[code] && TRANSLATIONS[code][key]) {
      return TRANSLATIONS[code][key];
    }
    // Fallback to English
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return defaultText || key;
  }

  public static getVoiceLanguage(code?: string): string {
    const targetCode = code || this.currentLangCode;
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === targetCode);
    if (lang && lang.speechLocale) {
      return lang.speechLocale;
    }
    return `${targetCode}-IN`;
  }

  public static getAILanguageInstruction(code?: string): string {
    const targetCode = code || this.currentLangCode;
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === targetCode) || SUPPORTED_LANGUAGES[0];

    return `You are NeuroCare. The user has selected ${lang.name} (${lang.nativeName}). You must speak, respond, and process memory logs strictly in ${lang.name} (${lang.nativeName}) with natural, empathetic, and culturally appropriate phrasing.`;
  }
}
