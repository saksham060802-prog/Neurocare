import React, { useState } from 'react';
import {
  Stethoscope,
  Upload,
  Brain,
  CheckCircle2,
  FileText,
  Gamepad2,
  Sparkles,
  AlertTriangle,
  Activity,
  User,
  Plus,
} from 'lucide-react';
import { MriScanReport, UserProfile } from '../types';

interface DoctorPortalProps {
  patientProfile: UserProfile;
  onAssignTasks?: (games: string[]) => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ patientProfile, onAssignTasks }) => {
  // Sample Scans Data
  const [scans, setScans] = useState<MriScanReport[]>([
    {
      id: 'mri_1',
      patientId: patientProfile?.userId || patientProfile?.id || 'p1',
      patientName: patientProfile?.name || 'Ramesh Sharma',
      scanDate: '2026-08-20',
      mriImageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
      predictedStage: 'Mild',
      confidence: 94.2,
      hippocampalAtrophy: 18.5,
      ventricularEnlargement: 14.2,
      doctorVerifiedStage: 'Mild',
      doctorNotes: 'Early hippocampal volume reduction observed. Recommend daily Memory & Photo-Recall exercises.',
      assignedGames: ['Photo-Recall Nostalgia', 'Number Sequence Match'],
      status: 'verified',
    },
    {
      id: 'mri_2',
      patientId: patientProfile?.userId || patientProfile?.id || 'p1',
      patientName: patientProfile?.name || 'Ramesh Sharma',
      scanDate: '2026-08-26',
      mriImageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
      predictedStage: 'Normal',
      confidence: 96.8,
      hippocampalAtrophy: 6.1,
      ventricularEnlargement: 4.8,
      status: 'pending_review',
    },
  ]);

  const [selectedScanId, setSelectedScanId] = useState<string>(scans[0].id);
  const [overrideStage, setOverrideStage] = useState<'Normal' | 'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedGames, setSelectedGames] = useState<string[]>(['Photo-Recall Nostalgia', 'Number Sequence Match']);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const currentScan = scans.find((s) => s.id === selectedScanId) || scans[0];

  const availableGames = [
    'Photo-Recall Nostalgia Game',
    'Object Match & Categorization',
    'Number Sequence Recall',
    'Shape & Pattern Recognition',
    'Daily Story Memory Workout',
  ];

  const toggleGameSelection = (gameName: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameName) ? prev.filter((g) => g !== gameName) : [...prev, gameName]
    );
  };

  const handleVerifyScan = () => {
    setScans((prev) =>
      prev.map((s) =>
        s.id === selectedScanId
          ? {
              ...s,
              doctorVerifiedStage: overrideStage,
              doctorNotes: clinicalNotes || s.doctorNotes,
              assignedGames: selectedGames,
              status: 'verified',
            }
          : s
      )
    );

    if (onAssignTasks) {
      onAssignTasks(selectedGames);
    }
  };

  const handleSimulateMriUpload = () => {
    setIsSimulatingUpload(true);
    setTimeout(() => {
      const newReport: MriScanReport = {
        id: `mri_${Date.now()}`,
        patientId: patientProfile?.userId || patientProfile?.id || 'p1',
        patientName: patientProfile?.name || 'Ramesh Sharma',
        scanDate: new Date().toISOString().split('T')[0],
        mriImageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        predictedStage: 'Moderate',
        confidence: 91.5,
        hippocampalAtrophy: 24.8,
        ventricularEnlargement: 21.0,
        status: 'pending_review',
      };
      setScans((prev) => [newReport, ...prev]);
      setSelectedScanId(newReport.id);
      setIsSimulatingUpload(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in text-[#18181B]">
      {/* Header Bar */}
      <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-white flex items-center justify-center border border-[#18181B]">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-[#111827]">
                NeuroCare Doctor Portal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#18181B] text-white">
                Clinical AI Suite
              </span>
            </div>
            <p className="text-xs font-medium text-[#6B7280]">
              Patient: {patientProfile?.name || 'Ramesh Sharma'} • Age {patientProfile?.ageRange || '70-75'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateMriUpload}
          disabled={isSimulatingUpload}
          className="px-5 py-3 bg-[#18181B] text-white rounded-xl text-xs font-bold border border-[#18181B] hover:bg-[#27272A] transition-all flex items-center space-x-2 min-h-[44px]"
        >
          <Upload className="w-4 h-4" />
          <span>{isSimulatingUpload ? 'Analyzing CNN MRI Scan...' : 'Upload New Brain MRI'}</span>
        </button>
      </section>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Scans List & High-Res Image Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] px-1">
            MRI Scan Reports ({scans.length})
          </h3>

          <div className="space-y-3">
            {scans.map((scan) => {
              const isSelected = scan.id === selectedScanId;
              return (
                <button
                  key={scan.id}
                  onClick={() => setSelectedScanId(scan.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center space-x-4 ${
                    isSelected
                      ? 'bg-[#18181B] text-white border-[#18181B]'
                      : 'bg-white text-[#111827] border-[#E5E7EB] hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={scan.mriImageUrl}
                    alt="MRI Thumbnail"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-300"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">
                        Scan Date: {scan.scanDate}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white text-[#18181B]' : 'bg-gray-100 text-[#374151]'
                        }`}
                      >
                        {scan.status}
                      </span>
                    </div>

                    <p className={`text-xs font-medium ${isSelected ? 'text-gray-300' : 'text-[#6B7280]'}`}>
                      CNN Prediction: <span className="font-bold">{scan.predictedStage} ({scan.confidence}%)</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Clinical Evaluation & Task Allocator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-6 shadow-xs">
            {/* Top Scan Info Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">
                  Brain MRI Analysis & Stage Review
                </h3>
                <p className="text-xs font-medium text-[#6B7280]">
                  Deep CNN Volumetric Biomarkers
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F9FAFB] text-[#374151] border border-[#E5E7EB]">
                ID: {currentScan.id}
              </span>
            </div>

            {/* Volumetric Metrics Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-center">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Predicted Stage</p>
                <p className="text-base font-black text-[#111827] mt-0.5">
                  {currentScan.predictedStage}
                </p>
                <p className="text-[10px] font-medium text-[#374151]">{currentScan.confidence}% Conf</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-center">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Hippocampal Atrophy</p>
                <p className="text-base font-black text-[#111827] mt-0.5">
                  {currentScan.hippocampalAtrophy}%
                </p>
                <p className="text-[10px] font-medium text-[#374151]">Mild Volume Loss</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-center">
                <p className="text-[10px] font-bold uppercase text-[#6B7280]">Ventricles Ratio</p>
                <p className="text-base font-black text-[#111827] mt-0.5">
                  {currentScan.ventricularEnlargement}%
                </p>
                <p className="text-[10px] font-medium text-[#374151]">Stable</p>
              </div>
            </div>

            {/* Doctor Stage Override Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-[#374151] block">
                Doctor Stage Verification / Clinical Override
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Normal', 'Mild', 'Moderate', 'Severe'] as const).map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setOverrideStage(stage)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      overrideStage === stage
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Clinical Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#374151] block">
                Doctor Clinical Notes & Observations
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Write medical assessment notes for caregiver & patient record..."
                className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            {/* Task Allocator for Patient */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase text-[#374151] block">
                Assign Stage-Appropriate Cognitive Training Exercises
              </label>

              <div className="space-y-2">
                {availableGames.map((game, idx) => {
                  const isChecked = selectedGames.includes(game);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleGameSelection(game)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-[#18181B] text-white border-[#18181B]'
                          : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Gamepad2 className="w-4 h-4" />
                        <span>{game}</span>
                      </div>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Doctor Assessment Action Button */}
            <button
              onClick={handleVerifyScan}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Clinical Verification & Assign Tasks</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
