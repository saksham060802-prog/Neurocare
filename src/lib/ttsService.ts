import { voiceController } from './voice';

export interface TTSState {
  isSpeaking: boolean;
  isFetching: boolean;
  currentId: string | null;
  isEnabled: boolean;
}

class TTSService {
  private audio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private isFetching: boolean = false;
  private currentSpeechId: string | null = null;
  private listeners: Set<(state: TTSState) => void> = new Set();
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('neurocare_tts_enabled');
      this.isEnabled = saved !== null ? saved === 'true' : true;
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setIsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('neurocare_tts_enabled', enabled ? 'true' : 'false');
    }
    if (!enabled) {
      this.stop();
    }
    this.notify();
  }

  public subscribe(listener: (state: TTSState) => void): () => void {
    this.listeners.add(listener);
    listener({
      isSpeaking: this.isSpeaking,
      isFetching: this.isFetching,
      currentId: this.currentSpeechId,
      isEnabled: this.isEnabled,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state: TTSState = {
      isSpeaking: this.isSpeaking,
      isFetching: this.isFetching,
      currentId: this.currentSpeechId,
      isEnabled: this.isEnabled,
    };
    this.listeners.forEach((l) => l(state));
  }

  /**
   * Unlock HTML Audio element during user click/touch/submit gesture to comply with browser autoplay policy.
   */
  public unlockAudio(): void {
    if (typeof window === 'undefined') return;
    if (!this.audio) {
      this.audio = new Audio();
    }
    try {
      this.audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.audio.play().then(() => {
        if (this.audio) {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
      }).catch(() => {
        // Silent catch for initial interaction unlock
      });
    } catch {
      // Ignore initial silent unlock failure
    }
  }

  /**
   * Main TTS method: Attempts ElevenLabs API via /api/tts endpoint first.
   * Silently falls back to browser Web Speech API if ElevenLabs is unconfigured or fails.
   */
  public async speakText(
    text: string,
    speechId?: string,
    langCode: string = 'en-IN',
    onEnd?: () => void
  ): Promise<void> {
    if (!this.isEnabled || !text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    // Stop any currently playing audio or speech
    this.stop();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>|-]/g, ' ')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const id = speechId || `speech_${Date.now()}`;
    this.currentSpeechId = id;
    this.isFetching = true;
    this.notify();

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, languageCode: langCode }),
      });

      if (!response.ok) {
        throw new Error(`TTS API returned HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.type.includes('audio') && blob.size < 100) {
        throw new Error('TTS response payload was not valid audio');
      }

      const audioUrl = URL.createObjectURL(blob);
      if (!this.audio) {
        this.audio = new Audio();
      }

      this.audio.src = audioUrl;
      this.isFetching = false;
      this.isSpeaking = true;
      this.notify();

      this.audio.onended = () => {
        this.isSpeaking = false;
        this.currentSpeechId = null;
        this.notify();
        URL.revokeObjectURL(audioUrl);
        if (onEnd) onEnd();
      };

      this.audio.onerror = () => {
        console.warn('[TTS Service] Audio element error during playback, falling back to browser TTS');
        this.isSpeaking = false;
        this.currentSpeechId = null;
        this.notify();
        URL.revokeObjectURL(audioUrl);
        this.fallbackToBrowserTTS(cleanText, langCode, onEnd);
      };

      await this.audio.play();
    } catch (err) {
      console.warn('[TTS Service] ElevenLabs TTS unavailable or failed, falling back to browser speech synthesis:', err);
      this.isFetching = false;
      this.notify();
      this.fallbackToBrowserTTS(cleanText, langCode, onEnd);
    }
  }

  private fallbackToBrowserTTS(text: string, langCode: string, onEnd?: () => void) {
    this.isSpeaking = true;
    this.notify();
    voiceController.speak(
      text,
      () => {
        this.isSpeaking = false;
        this.currentSpeechId = null;
        this.notify();
        if (onEnd) onEnd();
      },
      langCode
    );
  }

  public stop(): void {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // Ignore audio pause errors
      }
    }
    voiceController.stopSpeaking();
    this.isSpeaking = false;
    this.isFetching = false;
    this.currentSpeechId = null;
    this.notify();
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking || voiceController.getIsSpeaking();
  }

  public getIsFetching(): boolean {
    return this.isFetching;
  }

  public getCurrentSpeechId(): string | null {
    return this.currentSpeechId;
  }
}

export const ttsService = new TTSService();
