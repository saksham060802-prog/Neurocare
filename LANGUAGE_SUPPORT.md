# LANGUAGE SUPPORT MATRIX — MINDSAATHI / COGNITIVE COMPANION

This document defines the language capabilities, internationalization architecture, voice locales, and fallback matrix for MindSaathi.

## Supported Languages & Capability Matrix

| Language | Language Code | Native Script Name | UI Support | AI Support | Voice Input | Voice Output | Game Support |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **English** | `en` | English | ✅ Full | ✅ Full | ✅ Full (`en-IN`) | ✅ Full (`en-IN`) | ✅ Full |
| **Hindi** | `hi` | हिंदी | ✅ Full | ✅ Full | ✅ Full (`hi-IN`) | ✅ Full (`hi-IN`) | ✅ Full |
| **Assamese** | `as` | অসমীয়া | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Full |
| **Bengali** | `bn` | বাংলা | ✅ Full | ✅ Full | ✅ Full (`bn-IN`) | ✅ Full (`bn-IN`) | ✅ Full |
| **Bodo** | `brx` | बड़ो / बर' | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Nepali** | `ne` | नेपाली | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Full |
| **Meitei / Manipuri** | `mni` | ꯃꯤꯇꯩ ꯂꯣꯟ | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Mizo** | `lus` | মিজো | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Khasi** | `kha` | खासी | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Garo** | `grt` | গারো | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Tripuri / Kokborok** | `trp` | Tripuri / Kokborok | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Nagamese** | `nag` | Nagamese | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Ao** | `ao` | Ao | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Angami** | `njm` | Angami | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Sumi** | `nsm` | Sumi | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Mishing** | `mrg` | Mishing | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Karbi** | `mjw` | Karbi | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Dimasa** | `dis` | Dimasa | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Rabha** | `rah` | Rabha | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Hmar** | `hmr` | Hmar | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |
| **Kuki** | `kzb` | Kuki | ✅ Full | ✅ Full | ⚠️ Text Fallback | ⚠️ Text Fallback | ✅ Visual / Standard |

## Architectural Fallback Rules
1. **Voice Input/Output Fallback**: If browser WebSpeech or TTS does not reliably support a specific regional language locale, voice options display "Voice support coming soon" while **text mode remains 100% operational**. The application will never crash or hang.
2. **AI Multilingual Prompting**: System instructions explicitly send the target language name & code to Gemini backend (`language`, `language_code`) so the AI responds natively in simple, elder-friendly vocabulary for that language.
3. **i18n Translation Dictionary**: All UI labels, navigation titles, accessibility labels, game instructions, and settings text are driven by a centralized internationalization service (`src/services/LanguageService.ts` and `src/i18n/translations.ts`).
