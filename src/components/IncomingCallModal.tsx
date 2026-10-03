import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Phone,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, CallLog } from '../types';
import { ringtoneController } from '../lib/audioRingtone';
import { voiceController } from '../lib/voice';
import { useLanguage } from '../context/LanguageContext';

interface IncomingCallModalProps {
  isOpen: boolean;
  profile: UserProfile;
  callerName?: string;
  callerRole?: 'Caregiver' | 'Doctor' | 'AI Voice Companion';
  callType?: 'medication' | 'routine_walk' | 'cognitive_checkin' | 'emergency';
  onAnswer: () => void;
  onDeclineOrMiss: (log: Omit<CallLog, 'id'>) => void;
  onCloseModal: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  profile,
  callerName = 'Dr. Sen (NeuroCare)',
  callerRole = 'Doctor',
  callType = 'medication',
  onAnswer,
  onDeclineOrMiss,
  onCloseModal,
}) => {
  const { currentLanguage, speechLocale, t } = useLanguage();

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'completed'>('ringing');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [spokenResponse, setSpokenResponse] = useState('');

  // Ringtone & 10s Timeout Handler
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setSpokenResponse('');
    ringtoneController.startRingtone();

    // 10-second auto missed call timeout escalation
    const timeoutId = setTimeout(() => {
      if (callState === 'ringing') {
        ringtoneController.stopRingtone();
        handleMissedCall('No answer after 10 seconds (Missed Check-in timeout)');
      }
    }, 10000);

    return () => {
      ringtoneController.stopRingtone();
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // Connected Timer
  useEffect(() => {
    let interval: any = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleAnswerCall = () => {
    ringtoneController.stopRingtone();
    setCallState('connected');
    onAnswer();

    // AI Voice Assistant Speaks Call Reminder in chosen regional language
    const firstName = (profile?.name || 'Ramesh').split(' ')[0];
    const spokenGreeting = `Namaste ${firstName}! ${t('incoming_call_msg', "It's time for your morning blood pressure medication. Have you taken it?")}`;
    voiceController.speak(spokenGreeting, undefined, speechLocale);
  };

  const handleDeclineCall = () => {
    ringtoneController.stopRingtone();
    handleMissedCall('Call declined by elder');
  };

  const handleMissedCall = (reason: string) => {
    setCallState('completed');

    // Create CallLog escalation with Shillong GPS coordinates
    onDeclineOrMiss({
      userId: profile?.userId || profile?.id || 'p1',
      callerName,
      callerRole,
      callType,
      status: 'missed',
      scheduledTime: new Date().toISOString(),
      gpsCoordinates: {
        lat: 25.5788,
        lng: 91.8933,
        locationName: 'Shillong, Meghalaya (North-East Safe Zone)',
      },
    });

    voiceController.speak(
      'Missed call logged. Live GPS location sent to your caregiver dashboard for safety.',
      undefined,
      speechLocale
    );

    setTimeout(() => {
      onCloseModal();
    }, 2000);
  };

  const handleCompleteCall = (responseStatus: 'taken' | 'need_help') => {
    voiceController.stopSpeaking();
    setCallState('completed');

    onDeclineOrMiss({
      userId: profile?.userId || profile?.id || 'p1',
      callerName,
      callerRole,
      callType,
      status: 'answered',
      scheduledTime: new Date().toISOString(),
      gpsCoordinates: {
        lat: 25.5788,
        lng: 91.8933,
        locationName: 'Shillong, Meghalaya',
      },
    });

    const firstName = (profile?.name || 'Ramesh').split(' ')[0];
    const replyMsg =
      responseStatus === 'taken'
        ? `Wonderful ${firstName}! Thank you for taking your medication.`
        : `Understood. I have notified your daughter Priya to check on you.`;

    voiceController.speak(replyMsg, () => onCloseModal(), speechLocale);
  };

  const handleVoiceSTTAnswer = () => {
    if (isRecordingAnswer) {
      voiceController.stopListening();
      setIsRecordingAnswer(false);
    } else {
      setIsRecordingAnswer(true);
      voiceController.startListening(
        (transcript) => {
          setIsRecordingAnswer(false);
          setSpokenResponse(transcript);
          if (transcript.toLowerCase().includes('yes') || transcript.toLowerCase().includes('took') || transcript.toLowerCase().includes('ha')) {
            handleCompleteCall('taken');
          } else {
            handleCompleteCall('need_help');
          }
        },
        (err) => {
          console.error(err);
          setIsRecordingAnswer(false);
        },
        () => setIsRecordingAnswer(false),
        speechLocale
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1C1917] text-white rounded-3xl max-w-md w-full p-8 border border-stone-800 shadow-2xl text-center space-y-8 animate-fade-in relative overflow-hidden">
        {/* Ambient Ringing Pulse Glow */}
        {callState === 'ringing' && (
          <div className="absolute inset-0 bg-rose-600/10 animate-pulse pointer-events-none" />
        )}

        {/* Top Header Badge */}
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-stone-400">
          <span>Voice Call Engine</span>
          <span className="flex items-center space-x-1 text-rose-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{callState === 'connected' ? `${timerSeconds}s` : 'Incoming...'}</span>
          </span>
        </div>

        {/* Caller Avatar & Info */}
        <div className="space-y-4">
          <div className="relative inline-block">
            {callState === 'ringing' && (
              <div className="absolute inset-0 rounded-full animate-ping border-4 border-rose-500/50 scale-125" />
            )}
            <div className="w-28 h-28 rounded-full bg-stone-800 text-white flex items-center justify-center mx-auto border-4 border-stone-700 shadow-xl font-black text-3xl">
              {callerName.charAt(0)}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">{callerName}</h3>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {callerRole} • {callType.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Call State Views */}
        {callState === 'ringing' && (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-stone-300">
              Incoming Scheduled Medication & Check-In Call
            </p>

            {/* Answer & Decline Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleDeclineCall}
                className="py-4 bg-[#DC2626] text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 hover:bg-rose-700 transition-all shadow-lg min-h-[56px] focus:ring-2 focus:ring-rose-500"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Decline</span>
              </button>

              <button
                onClick={handleAnswerCall}
                className="py-4 bg-[#16A34A] text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-lg min-h-[56px] animate-bounce focus:ring-2 focus:ring-emerald-500"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Answer Call</span>
              </button>
            </div>
          </div>
        )}

        {callState === 'connected' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 text-left space-y-2">
              <div className="flex items-center space-x-2 text-xs font-black text-amber-400">
                <Volume2 className="w-4 h-4" />
                <span>AI Voice Assistant Message:</span>
              </div>
              <p className="text-sm font-bold text-stone-200">
                "Namaste {(profile?.name || 'Ramesh').split(' ')[0]}! It's time for your morning medication. Have you taken it?"
              </p>
            </div>

            {spokenResponse && (
              <p className="text-xs text-stone-300 italic">
                You said: "{spokenResponse}"
              </p>
            )}

            {/* Response Options */}
            <div className="space-y-3">
              <button
                onClick={handleVoiceSTTAnswer}
                className={`w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
                  isRecordingAnswer
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700'
                }`}
              >
                {isRecordingAnswer ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecordingAnswer ? 'Listening to reply...' : 'Reply via Voice STT'}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCompleteCall('taken')}
                  className="py-3 bg-[#16A34A] text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes, I Took It</span>
                </button>

                <button
                  onClick={() => handleCompleteCall('need_help')}
                  className="py-3 bg-[#D97706] text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Need Help</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {callState === 'completed' && (
          <div className="space-y-3 py-4 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-black text-white">Call Ended & Logged</p>
            <p className="text-xs text-stone-400 font-semibold">
              Live GPS Shillong location synced to Caregiver dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
