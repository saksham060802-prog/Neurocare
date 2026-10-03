import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Brain, Radio, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { voiceController } from '../lib/voice';

interface VoiceCompanionProps {
  onSendMessage?: (text: string, language?: string, languageCode?: string) => Promise<void>;
  isLoading?: boolean;
}

export const VoiceCompanion: React.FC<VoiceCompanionProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const { currentLanguage, speechLocale, t } = useLanguage();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeLangName = currentLanguage.name;
  const activeLangCode = currentLanguage.code;

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      voiceController.stopSpeaking();
      voiceController.stopListening();
    };
  }, []);

  const handleStartListening = () => {
    if (isListening) {
      voiceController.stopListening();
      setIsListening(false);
      return;
    }

    voiceController.stopSpeaking();
    setIsSpeaking(false);
    setIsListening(true);
    setLastTranscript('');

    // Fast Endpointing STT with interimResults = false
    const success = voiceController.startFastListening(
      async (transcript: string) => {
        setIsListening(false);
        setLastTranscript(transcript);

        if (transcript.trim()) {
          setIsProcessing(true);
          try {
            if (onSendMessage) {
              await onSendMessage(transcript, activeLangName, activeLangCode);
            } else {
              // Direct API call if standalone
              const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: transcript,
                  language: activeLangName,
                  languageCode: activeLangCode,
                  systemPromptOverride: `You are the NeuroCare Voice Companion. The elder has chosen ${activeLangName}.
1. Respond strictly in ${activeLangName} using natural regional phrasing.
2. Keep every answer ultra-concise (1 to 2 short sentences maximum).
3. Eliminate conversational filler words to ensure instantaneous response delivery.
4. Maintain an empathetic, warm, and clear tone suitable for elderly users.`,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                const replyText = data.response || data.reply || 'I am here with you.';
                setLastResponse(replyText);
                // Immediate Speech Synthesis (TTS)
                triggerImmediateTTS(replyText);
              }
            }
          } catch (err) {
            console.error('Error processing voice turn:', err);
          } finally {
            setIsProcessing(false);
          }
        }
      },
      (err: string) => {
        console.error('Fast speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      speechLocale
    );

    if (!success) {
      setIsListening(false);
    }
  };

  const triggerImmediateTTS = (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    voiceController.speak(
      text,
      () => {
        setIsSpeaking(false);
      },
      speechLocale
    );
  };

  const handleStopSpeaking = () => {
    voiceController.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6 max-w-xl mx-auto text-[#18181B]">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center font-bold">
            <Brain className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              {t('ai_companion_title', 'Voice AI Companion')}
            </h3>
            <p className="text-xs text-[#6B7280] font-medium flex items-center gap-1.5">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName} ({currentLanguage.name})</span>
              <span className="text-emerald-600 font-bold">• Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isListening && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 animate-pulse">
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              <span>Listening</span>
            </span>
          )}
          {isProcessing && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Thinking</span>
            </span>
          )}
          {isSpeaking && (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-pulse">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speaking</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Interactive Mic Button */}
      <div className="text-center py-6 space-y-4">
        <button
          onClick={handleStartListening}
          disabled={isProcessing}
          id="voice-companion-mic-btn"
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto flex items-center justify-center transition-all transform active:scale-95 shadow-md ${
            isListening
              ? 'bg-rose-600 text-white ring-8 ring-rose-100 animate-pulse'
              : isSpeaking
              ? 'bg-emerald-600 text-white ring-8 ring-emerald-100'
              : 'bg-[#18181B] hover:bg-[#27272A] text-white ring-4 ring-gray-100'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
          ) : isSpeaking ? (
            <VolumeX className="w-10 h-10 sm:w-12 sm:h-12" />
          ) : (
            <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
          )}
        </button>

        <div className="space-y-1">
          <p className="text-sm font-bold text-[#111827]">
            {isListening
              ? `${t('listening_speak_now', 'Listening... Speak now')} (${currentLanguage.nativeName})`
              : isSpeaking
              ? 'Speaking response...'
              : isProcessing
              ? 'Processing speech turn...'
              : t('tap_to_speak', 'Tap to Speak')}
          </p>
          <p className="text-xs text-[#6B7280]">
            Ultra-fast low latency speech tuned for {currentLanguage.name}
          </p>
        </div>
      </div>

      {/* Transcript & Response Area */}
      {(lastTranscript || lastResponse) && (
        <div className="space-y-3 pt-2">
          {lastTranscript && (
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <span className="font-bold text-gray-500 block uppercase mb-1 text-[10px]">You Said:</span>
              <p className="font-semibold text-gray-900">"{lastTranscript}"</p>
            </div>
          )}
          {lastResponse && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-800 block uppercase mb-1 text-[10px]">NeuroCare Voice:</span>
                <p className="font-semibold text-emerald-950">"{lastResponse}"</p>
              </div>
              <button
                onClick={() => triggerImmediateTTS(lastResponse)}
                className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                title="Replay Voice"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Regional Voice Prompt Buttons */}
      <div className="pt-2 border-t border-[#E5E7EB]">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Quick Voice Prompts ({currentLanguage.nativeName})
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Medicine Reminder',
            'Daily Schedule',
            'Family Recall',
            'Doctor Contact',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setLastTranscript(prompt);
                if (onSendMessage) {
                  onSendMessage(prompt, activeLangName, activeLangCode);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 flex items-center space-x-1 transition-colors"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-gray-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
