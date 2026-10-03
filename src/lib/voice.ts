/**
 * Client-side Voice Interaction Utility using Web Speech API with multilingual support
 */

export interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

export class VoiceController {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public isSpeechSupported(): boolean {
    return !!this.recognition && typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (text: string) => void,
    onError?: (err: string) => void,
    onEnd?: () => void,
    langCode: string = 'en-IN',
    _onInterimResult?: (interimText: string) => void
  ): boolean {
    return this.startFastListening(onResult, onError, onEnd, langCode);
  }

  public startFastListening(
    onResult: (text: string) => void,
    onError?: (err: string) => void,
    onEnd?: () => void,
    langCode: string = 'en-IN'
  ): boolean {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      this.recognition.lang = langCode || 'en-IN';
      this.recognition.interimResults = false; // Fast endpointing without waiting for interim loops

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (!transcript && event.results[0] && event.results[0][0]) {
          transcript = event.results[0][0].transcript;
        }

        if (transcript.trim()) {
          this.isListening = false;
          onResult(transcript.trim());
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onError) onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      this.isListening = false;
      if (onError) onError(e.message || 'Failed to start microphone');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      this.isListening = false;
    }
  }

  public speak(text: string, onEnd?: () => void, langCode: string = 'en-US'): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown symbols from spoken text
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/https?:\/\/\S+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode || 'en-US';
    utterance.rate = 0.88; // Calm pace for senior accessibility
    utterance.pitch = 1.0;

    // Try to find matching voice for target accent
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchingVoice = voices.find(
        (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceController = new VoiceController();
