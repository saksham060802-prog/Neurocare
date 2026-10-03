import React from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Brain,
  CheckSquare,
  Clock,
  Heart,
  Bell,
  X,
  Lock,
} from 'lucide-react';
import { CaregiverOverview } from '../types';

interface CaregiverViewProps {
  overview: CaregiverOverview;
  onDismissAlert: (id: string) => Promise<void>;
}

export const CaregiverView: React.FC<CaregiverViewProps> = ({
  overview,
  onDismissAlert,
}) => {
  const patientProfile = overview?.patientProfile;
  const metrics = overview?.metrics;
  const alerts = overview?.alerts || [];
  const pendingTasks = overview?.pendingTasks || [];
  const completedTasksCount = overview?.completedTasksCount ?? 0;
  const totalTasksCount = overview?.totalTasksCount ?? 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in text-[#18181B]">
      {/* Header Banner */}
      <div className="bg-[#18181B] rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-[#18181B]" />
            <span>Caregiver & Family Support Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Caregiver Overview: {patientProfile?.name || 'Ramesh Sharma'}
          </h1>
          <p className="text-gray-300 text-sm mt-1 max-w-xl leading-relaxed font-medium">
            Monitor cognitive training scores, task completion status, and automated safety notifications.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-xs font-bold border border-white/20 shrink-0">
          Sync Status: Live Active
        </div>
      </div>

      {/* Privacy Boundary Banner */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] flex items-center space-x-3 text-[#374151] text-sm font-medium shadow-xs">
        <Lock className="w-5 h-5 text-[#18181B] shrink-0" />
        <p>
          <strong className="text-[#111827] font-bold">Confidentiality Guarantee:</strong> Caregivers view high-level cognitive scores, daily reminder logs, and safety alerts. Conversational chat histories remain strictly private.
        </p>
      </div>

      {/* Active Alerts Feed */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#111827] flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#18181B]" />
            <span>Active Safety Alerts ({alerts.length})</span>
          </h2>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <p className="text-sm font-bold text-[#991B1B]">
                    {alert.message}
                  </p>
                </div>

                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="px-4 py-1.5 rounded-full bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] transition-all"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cognitive Performance Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827] flex items-center space-x-2">
              <Brain className="w-5 h-5 text-[#18181B]" />
              <span>Cognitive Domain Status</span>
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#18181B] text-white text-xs font-bold">
              Level: {metrics?.currentLevel ?? 'MEDIUM'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9FAFB] p-3.5 rounded-xl text-center border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] font-bold block">Memory</span>
              <span className="text-2xl font-black text-[#111827]">{metrics?.memoryScore ?? 82}%</span>
            </div>
            <div className="bg-[#F9FAFB] p-3.5 rounded-xl text-center border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] font-bold block">Attention</span>
              <span className="text-2xl font-black text-[#111827]">{metrics?.attentionScore ?? 78}%</span>
            </div>
            <div className="bg-[#F9FAFB] p-3.5 rounded-xl text-center border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] font-bold block">Reasoning</span>
              <span className="text-2xl font-black text-[#111827]">{metrics?.reasoningScore ?? 85}%</span>
            </div>
            <div className="bg-[#F9FAFB] p-3.5 rounded-xl text-center border border-[#E5E7EB]">
              <span className="text-xs text-[#6B7280] font-bold block">Language</span>
              <span className="text-2xl font-black text-[#111827]">{metrics?.languageScore ?? 88}%</span>
            </div>
          </div>
        </div>

        {/* Task Completion Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111827] flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-[#18181B]" />
              <span>Daily Tasks & Reminders</span>
            </h2>
            <span className="text-xs font-bold text-[#6B7280]">
              {completedTasksCount} / {totalTasksCount} Completed
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="p-6 text-center text-[#374151] font-bold text-sm bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              All scheduled reminders for today are completed! 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between text-sm"
                >
                  <span className="font-bold text-[#111827]">{t.title}</span>
                  <span className="text-xs text-[#374151] font-bold bg-white px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                    {new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
