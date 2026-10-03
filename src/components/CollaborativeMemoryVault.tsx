import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Mic,
  MicOff,
  User,
  MapPin,
  Calendar,
  Sparkles,
  Tag,
  Plus,
  Volume2,
  Trash2,
  CheckCircle2,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { PhotoMemory, UserProfile } from '../types';
import { voiceController } from '../lib/voice';
import { useLanguage } from '../context/LanguageContext';

interface CollaborativeMemoryVaultProps {
  profile: UserProfile;
  photos: PhotoMemory[];
  onAddPhoto: (photo: Omit<PhotoMemory, 'id' | 'createdAt'>) => void;
  onDeletePhoto: (id: string) => void;
  onStartPhotoRecallGame?: () => void;
}

export const CollaborativeMemoryVault: React.FC<CollaborativeMemoryVaultProps> = ({
  profile,
  photos,
  onAddPhoto,
  onDeletePhoto,
  onStartPhotoRecallGame,
}) => {
  const { currentLanguage, speechLocale, t } = useLanguage();

  const [viewRole, setViewRole] = useState<'elder' | 'caregiver'>('caregiver');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form States
  const [photoUrl, setPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [relationTag, setRelationTag] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [contextHint, setContextHint] = useState('');
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecordingNote, setIsRecordingNote] = useState(false);

  // Preset sample photos for North-East India context
  const samplePresets = [
    {
      title: 'Granddaughter Riya in Shillong',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      relationTag: 'Granddaughter',
      location: 'Shillong, Meghalaya',
      date: 'Diwali 2024',
      contextHint: 'Riya wore her yellow traditional dress and brought marigold flowers.',
    },
    {
      title: 'Family Trip to Kaziranga National Park',
      photoUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      relationTag: 'Family Outing',
      location: 'Kaziranga, Assam',
      date: 'November 2023',
      contextHint: 'We rode on elephant safari in the early morning fog.',
    },
    {
      title: 'Son Amit at Tea Garden Estate',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      relationTag: 'Son Amit',
      location: 'Dibrugarh, Assam',
      date: 'Bihu Festival 2023',
      contextHint: 'Amit bought Assam fresh CTC tea packets for everyone.',
    },
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setPhotoUrl(preset.photoUrl);
    setTitle(preset.title);
    setRelationTag(preset.relationTag);
    setLocation(preset.location);
    setDate(preset.date);
    setContextHint(preset.contextHint);
  };

  const handleVoiceNoteRecord = () => {
    if (isRecordingNote) {
      voiceController.stopListening();
      setIsRecordingNote(false);
    } else {
      setIsRecordingNote(true);
      voiceController.startListening(
        (transcript) => {
          setVoiceNote(transcript);
          setIsRecordingNote(false);
        },
        (err) => {
          console.error(err);
          setIsRecordingNote(false);
        },
        () => setIsRecordingNote(false),
        speechLocale
      );
    }
  };

  const handleSubmitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !photoUrl) return;

    onAddPhoto({
      userId: profile.userId,
      photoUrl,
      title,
      relationTag: relationTag || 'Family Member',
      location: location || 'Home',
      date: date || 'Recent',
      contextHint: contextHint || 'Special family memory',
      uploadedBy: viewRole,
      voiceNote: voiceNote || undefined,
    });

    // Reset Form
    setPhotoUrl('');
    setTitle('');
    setRelationTag('');
    setLocation('');
    setDate('');
    setContextHint('');
    setVoiceNote('');
    setShowUploadModal(false);
  };

  const handlePlayVoiceHint = (text: string) => {
    voiceController.speak(text, undefined, speechLocale);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Bar with Role Switcher */}
      <section className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-[#E7E5E4] dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-[#1C1917] dark:text-white">
              Collaborative Memory Vault
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1C1917] text-white">
              Two-Way Sync
            </span>
          </div>
          <p className="text-xs font-semibold text-[#78716C] dark:text-stone-400 mt-0.5">
            Remote caregiver photo tagger & elder tap-to-record voice memory cards
          </p>
        </div>

        {/* Segmented Control for Elder vs Caregiver Vault View */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-[#E7E5E4] dark:border-stone-700 w-full sm:w-56">
            <button
              onClick={() => setViewRole('elder')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                viewRole === 'elder'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Elder Mode
            </button>
            <button
              onClick={() => setViewRole('caregiver')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                viewRole === 'caregiver'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Caregiver Portal
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="py-2.5 px-4 bg-[#1C1917] text-white rounded-2xl text-xs font-black flex items-center space-x-2 hover:bg-stone-800 transition-all shadow-sm shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Upload Photo</span>
          </button>
        </div>
      </section>

      {/* Start Photo Recall Nostalgia Game Banner */}
      {onStartPhotoRecallGame && photos.length > 0 && (
        <section className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white">
                Play Photo-Recall Nostalgia Game
              </h3>
            </div>
            <p className="text-xs text-stone-300 font-semibold">
              Test cognitive recall using your {photos.length} uploaded family photos!
            </p>
          </div>
          <button
            onClick={onStartPhotoRecallGame}
            className="px-5 py-3 bg-white text-[#1C1917] rounded-2xl text-xs font-black hover:bg-stone-100 transition-all shadow-sm"
          >
            Start Trivia Game
          </button>
        </section>
      )}

      {/* Grid of Photo Memories */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {photos.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E5E4] dark:border-stone-800 p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-stone-800 text-[#1C1917] flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#1C1917] dark:text-white">
              No Family Photos Uploaded Yet
            </h3>
            <p className="text-sm font-semibold text-[#78716C] max-w-md mx-auto">
              Caregivers and elders can upload family photos with relationship tags and voice context hints to train memory recall.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-[#1C1917] text-white rounded-2xl text-xs font-black hover:bg-stone-800 transition-all"
            >
              Add First Family Photo
            </button>
          </div>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-[#E7E5E4] dark:border-stone-800 shadow-sm flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative h-64 bg-stone-100 dark:bg-stone-800 overflow-hidden group">
                <img
                  src={photo.photoUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1C1917]/90 text-white backdrop-blur-md">
                    {photo.relationTag}
                  </span>
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-all"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {photo.uploadedBy === 'caregiver' && (
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-[10px] font-extrabold text-[#1C1917] dark:text-stone-200 border border-[#E7E5E4]">
                    Caregiver Sync: {photo.date || 'Recent'}
                  </div>
                )}
              </div>

              {/* Photo Details & Voice Tagging */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-base font-black text-[#1C1917] dark:text-white">
                    {photo.title}
                  </h4>

                  {photo.location && (
                    <div className="flex items-center space-x-1.5 text-xs text-[#78716C] dark:text-stone-400 font-semibold mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1C1917]" />
                      <span>{photo.location}</span>
                    </div>
                  )}

                  {photo.contextHint && (
                    <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-[#E7E5E4] dark:border-stone-700 text-xs text-[#1C1917] dark:text-stone-300 font-semibold">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#78716C] block mb-1">
                        Cognitive Memory Hint:
                      </span>
                      "{photo.contextHint}"
                    </div>
                  )}
                </div>

                {/* Elder Voice Tagging & Listen Action */}
                <div className="pt-3 border-t border-[#E7E5E4] dark:border-stone-800 flex items-center justify-between">
                  <button
                    onClick={() =>
                      handlePlayVoiceHint(
                        `This is a picture of ${photo.relationTag}, ${photo.title}. ${photo.contextHint || ''}`
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-black text-[#1C1917] dark:text-stone-200 border border-[#E7E5E4] dark:border-stone-700 hover:bg-[#1C1917] hover:text-white transition-all flex items-center space-x-1.5"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen Story</span>
                  </button>

                  <div className="text-[10px] font-bold text-[#78716C]">
                    Uploaded by {photo.uploadedBy === 'caregiver' ? 'Family/Caregiver' : 'Elder'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* ==========================================
          UPLOAD PHOTO MODAL OVERLAY
      ========================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 border border-[#E7E5E4] dark:border-stone-800 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] dark:border-stone-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1C1917] dark:text-white">
                  Add Family Memory Photo
                </h3>
                <p className="text-xs font-semibold text-[#78716C]">
                  {viewRole === 'caregiver' ? 'Caregiver Remote Upload' : 'Elder Direct Upload'}
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-xs font-bold p-2 text-[#78716C] hover:text-[#1C1917]"
              >
                ✕
              </button>
            </div>

            {/* Presets Quick Pick */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#78716C]">
                Quick North-East India Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {samplePresets.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] rounded-xl text-[10px] font-extrabold text-[#1C1917] dark:text-stone-300 text-left hover:bg-stone-100"
                  >
                    {p.relationTag}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-4">
              <div>
                <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                  Photo URL *
                </label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                    Title / Caption *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Riya in Shillong"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                    Relation Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={relationTag}
                    onChange={(e) => setRelationTag(e.target.value)}
                    placeholder="e.g. Granddaughter / Son"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Shillong, Meghalaya"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                    Date / Occasion
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Diwali 2024"
                    className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                  Memory Hint Prompt (For Photo-Recall Trivia Game)
                </label>
                <textarea
                  rows={2}
                  value={contextHint}
                  onChange={(e) => setContextHint(e.target.value)}
                  placeholder="e.g. She visited last Diwali wearing yellow marigolds."
                  className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold text-[#1C1917] dark:text-white"
                />
              </div>

              {/* Voice Note Recorder Tag */}
              <div>
                <label className="text-xs font-black text-[#1C1917] dark:text-stone-300 block mb-1">
                  Optional Audio Voice Tagging
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleVoiceNoteRecord}
                    className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 border transition-all ${
                      isRecordingNote
                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                        : 'bg-stone-100 text-[#1C1917] border-[#E7E5E4]'
                    }`}
                  >
                    {isRecordingNote ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecordingNote ? 'Recording...' : 'Voice Tag'}</span>
                  </button>
                  <input
                    type="text"
                    value={voiceNote}
                    onChange={(e) => setVoiceNote(e.target.value)}
                    placeholder="Spoken description transcript..."
                    className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E5E4] dark:border-stone-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-xs font-extrabold text-[#78716C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1C1917] text-white rounded-2xl text-xs font-black hover:bg-stone-800 shadow-sm"
                >
                  Save Photo Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
