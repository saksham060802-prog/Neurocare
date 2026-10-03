import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckSquare,
  Trash2,
  Brain,
  Calendar,
  PhoneCall,
  Pill,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { voiceController } from '../lib/voice';
import { useLanguage } from '../context/LanguageContext';

interface ChatViewProps {
  profile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string, language?: string, languageCode?: string) => Promise<void>;
  onClearHistory: () => void;
  isLoading: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  profile,
  messages,
  onSendMessage,
  onClearHistory,
  isLoading,
}) => {
  const { currentLanguage, languageCode, speechLocale, t } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: t('quick_medicine', 'Medicine Reminder'), prompt: 'Remind me to take my morning medicine.' },
    { label: t('quick_actions', 'Daily Schedule'), prompt: 'What is my schedule for today?' },
    { label: t('quick_emergency', 'Emergency Contacts'), prompt: 'Show my emergency contacts and doctor info.' },
    { label: t('ask_about_family', "My Daughter's Name"), prompt: 'What is my daughter’s name?' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle auto-speech synthesis for latest assistant message in target speech locale
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.id !== currentlySpeakingId) {
        setCurrentlySpeakingId(lastMsg.id);
        voiceController.speak(lastMsg.content, () => setCurrentlySpeakingId(null), speechLocale);
      }
    }
  }, [messages, autoSpeak, speechLocale]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const textToSend = inputText;
    setInputText('');
    await onSendMessage(textToSend, currentLanguage.name, currentLanguage.code);
  };

  const handleQuickPromptClick = async (promptText: string) => {
    if (isLoading) return;
    await onSendMessage(promptText, currentLanguage.name, currentLanguage.code);
  };

  const toggleMic = () => {
    if (isRecording) {
      voiceController.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceController.startFastListening(
        async (transcript) => {
          setIsRecording(false);
          setInputText(transcript);
          if (transcript.trim()) {
            await onSendMessage(transcript, currentLanguage.name, currentLanguage.code);
          }
        },
        (err) => {
          console.error('Voice input error:', err);
          setIsRecording(false);
        },
        () => setIsRecording(false),
        speechLocale
      );
    }
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    if (voiceController.getIsSpeaking()) {
      voiceController.stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      setCurrentlySpeakingId(msg.id);
      voiceController.speak(msg.content, () => setCurrentlySpeakingId(null), speechLocale);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in text-[#18181B]">
      {/* 1. Header / Control Bar */}
      <section className="bg-white rounded-2xl p-5 border border-[#E5E7EB] flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#18181B] text-white flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#111827]">
                {t('ai_companion_title', 'Voice AI Companion')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#18181B] text-white">
                {isRecording ? t('listening_speak_now', 'Listening') : t('online_badge', 'Ready')}
              </span>
            </div>
            <p className="text-xs font-medium text-[#6B7280]">
              Voice & Personal Memory ({currentLanguage.flag} {currentLanguage.nativeName})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio read-aloud toggle */}
          <button
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next) voiceController.stopSpeaking();
            }}
            title={autoSpeak ? 'Voice Feedback On' : 'Voice Feedback Off'}
            aria-label="Toggle Voice Feedback"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all min-h-[42px] border ${
              autoSpeak
                ? 'bg-[#18181B] text-white border-[#18181B]'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoSpeak ? 'Voice On' : 'Voice Off'}</span>
          </button>

          <button
            onClick={onClearHistory}
            title={t('clear_history', 'Clear Chat History')}
            aria-label="Clear Chat History"
            className="p-2.5 rounded-xl text-[#374151] hover:bg-gray-100 border border-[#E5E7EB] transition-all min-h-[42px] min-w-[42px] flex items-center justify-center font-bold"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* 2. Hero Accessible Voice Interaction Area */}
      <section className="bg-white rounded-2xl p-8 border border-[#E5E7EB] text-center flex flex-col items-center justify-center space-y-4 relative overflow-hidden shadow-xs">
        <div className="absolute top-4 right-4 text-[11px] font-bold uppercase tracking-widest text-[#6B7280]">
          Voice Module
        </div>

        {/* Centerpiece Large Interactive Microphone Button */}
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={toggleMic}
            id="hero-voice-mic-btn"
            aria-label={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 border-4 border-white font-bold shadow-md ${
              isRecording
                ? 'bg-[#18181B] text-white animate-recording-pulse'
                : 'bg-[#18181B] text-white hover:bg-[#27272A]'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>
        </div>

        {/* Clear status text below microphone */}
        <div className="space-y-1">
          <p className="text-lg font-bold text-[#111827]">
            {isRecording ? t('listening_speak_now', 'Listening... Speak Now') : t('tap_to_speak', 'Tap to Speak')}
          </p>
          <p className="text-xs font-medium text-[#6B7280]">
            {isRecording
              ? t('stop_speaking', 'Press button again when finished speaking')
              : `${t('ai_companion_subtitle', 'Hands-free voice assistant in')} ${currentLanguage.nativeName}`}
          </p>
        </div>
      </section>

      {/* 3. Central Conversation / Memory Stream Container */}
      <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-6 min-h-[360px] shadow-xs">
        {messages.length === 0 ? (
          <div className="text-center py-12 space-y-3.5 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-xl bg-[#18181B] text-white flex items-center justify-center mx-auto">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#111827]">
              {t('welcome_greeting', 'Hello')} {(profile?.name || 'Ramesh').split(' ')[0]} 👋
            </h3>
            <p className="text-base text-[#6B7280] leading-relaxed font-medium">
              {t('ai_companion_subtitle', 'I am your NeuroCare voice assistant. Speak or type to discuss your day, recall personal memories, or set daily medicine reminders.')}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const msgKey = msg.id ? `${msg.id}_${idx}` : `msg_idx_${idx}`;

            return (
              <div
                key={msgKey}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[80%] p-5 rounded-2xl text-[16px] leading-[1.6] border ${
                    isUser
                      ? 'bg-[#18181B] text-white font-medium border-[#18181B] rounded-tr-xs'
                      : 'bg-[#F9FAFB] text-[#111827] font-medium border-[#E5E7EB] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {!isUser && msg.memoriesUsed && msg.memoriesUsed.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111827]">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Retrieved Personal Memory:</span>
                      </div>
                      {msg.memoriesUsed.map((mem, mIdx) => (
                        <p
                          key={mem.id ? `${mem.id}_${mIdx}` : `mem_${mIdx}`}
                          className="text-xs text-[#6B7280] italic font-medium"
                        >
                          "{mem.content}"
                        </p>
                      ))}
                    </div>
                  )}

                  {msg.extractedMemory && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-[#111827] text-xs font-bold border border-[#E5E7EB]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Saved fact to Memory Vault!</span>
                    </div>
                  )}

                  {msg.extractedTask && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white text-[#111827] text-xs font-bold border border-[#E5E7EB]">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Added reminder: "{msg.extractedTask.title}"</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#6B7280] font-medium px-2">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleSpeakMessage(msg)}
                      className="text-[#18181B] font-bold hover:underline px-1.5 py-0.5 rounded"
                    >
                      {currentlySpeakingId === msg.id ? 'Stop Speech' : 'Listen'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-[#111827] text-sm p-4 bg-[#F9FAFB] rounded-2xl w-fit border border-[#E5E7EB]">
            <Sparkles className="w-4 h-4 animate-spin text-[#18181B]" />
            <span className="font-bold">{t('processing', 'NeuroCare is processing...')}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </section>

      {/* 4. Text Input & Quick Prompts */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] space-y-3.5 shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPromptClick(item.prompt)}
              className="px-3.5 py-2 rounded-xl bg-[#F9FAFB] text-xs text-[#374151] font-bold border border-[#E5E7EB] hover:border-[#18181B] hover:text-[#111827] transition-all whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('type_message_placeholder', 'Type message or ask anything...')}
            id="chat-text-input"
            aria-label="Type message"
            className="flex-1 px-4 py-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            id="send-chat-btn"
            aria-label="Send Message"
            className="p-3.5 bg-[#18181B] disabled:opacity-50 text-white rounded-xl hover:bg-[#27272A] border border-[#18181B] transition-all font-bold min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </section>
    </div>
  );
};
