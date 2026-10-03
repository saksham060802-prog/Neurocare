import React from 'react';
import {
  BarChart2,
  Brain,
  Award,
  Flame,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { ProgressMetrics, CognitiveSession } from '../types';

interface ProgressViewProps {
  metrics: ProgressMetrics;
  sessions: CognitiveSession[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ metrics, sessions }) => {
  const m = metrics || {
    memoryScore: 82,
    attentionScore: 78,
    reasoningScore: 85,
    languageScore: 88,
    overallScore: 83,
    currentLevel: 'MEDIUM',
    streakDays: 5,
    totalSessionsCompleted: 14,
    weeklyTrend: [],
  };

  const skillBars = [
    { label: 'Memory Recall', score: m.memoryScore ?? 82 },
    { label: 'Attention & Focus', score: m.attentionScore ?? 78 },
    { label: 'Logical Reasoning', score: m.reasoningScore ?? 85 },
    { label: 'Word Skills & Verbal', score: m.languageScore ?? 88 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in bg-white text-black">
      {/* Header Banner */}
      <div className="bg-black rounded-3xl p-6 sm:p-8 text-white border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider mb-2 border border-white">
            <BarChart2 className="w-4 h-4 text-black" />
            <span>Cognitive Performance Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Progress Dashboard</h1>
          <p className="text-neutral-300 text-sm mt-1 max-w-xl leading-relaxed font-bold">
            Track engagement trends, skill domain improvements, and adaptive difficulty achievements over time.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white text-black px-5 py-3 rounded-2xl border-2 border-white shrink-0">
          <Flame className="w-7 h-7 text-black fill-black" />
          <div>
            <span className="text-xs text-neutral-600 font-black block">Active Streak</span>
            <span className="text-xl font-black text-black">{m.streakDays ?? 5} Days Daily</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border-2 border-black text-center space-y-2">
          <span className="text-xs font-black text-neutral-600 uppercase tracking-wider">Overall Engagement</span>
          <div className="text-4xl font-black text-black">{m.overallScore ?? 83}%</div>
          <p className="text-xs text-neutral-600 font-bold">Average exercise accuracy</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-black text-center space-y-2">
          <span className="text-xs font-black text-neutral-600 uppercase tracking-wider">Adaptive Level</span>
          <div className="text-3xl font-black text-black uppercase">{m.currentLevel ?? 'MEDIUM'}</div>
          <p className="text-xs text-neutral-600 font-bold">Calibrated for comfortable challenge</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-black text-center space-y-2">
          <span className="text-xs font-black text-neutral-600 uppercase tracking-wider">Total Completed</span>
          <div className="text-4xl font-black text-black">{m.totalSessionsCompleted ?? 14}</div>
          <p className="text-xs text-neutral-600 font-bold">Exercises finished to date</p>
        </div>
      </div>

      {/* Skill Breakdown Progress Bars */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black space-y-6">
        <h2 className="text-xl font-black text-black flex items-center space-x-2">
          <Target className="w-5 h-5 text-black" />
          <span>Skill Domain Breakdown</span>
        </h2>

        <div className="space-y-5">
          {skillBars.map((skill, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-black">{skill.label}</span>
                <span className="text-black">{skill.score}% Score</span>
              </div>
              <div className="w-full h-3.5 bg-white rounded-full overflow-hidden border-2 border-black">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${skill.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-black space-y-6">
        <h2 className="text-xl font-black text-black flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-black" />
          <span>Weekly Score Trends</span>
        </h2>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b-2 border-black">
          {(m.weeklyTrend || []).map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-xs font-black text-black">
                {item.score}%
              </span>
              <div
                className="w-full max-w-[42px] bg-black rounded-t-xl transition-all"
                style={{ height: `${(item.score / 100) * 120}px` }}
              />
              <span className="text-xs font-bold text-neutral-600">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white p-6 rounded-3xl border-2 border-black space-y-4">
        <h2 className="text-lg font-black text-black flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-black" />
          <span>Exercise History Log</span>
        </h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-neutral-600 font-bold">No session logs recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border-2 border-black text-sm font-bold"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-black" />
                  <div>
                    <p className="font-black text-black capitalize">
                      {s.activityType} Exercise
                    </p>
                    <p className="text-xs text-neutral-600 font-bold uppercase">Level: {s.difficulty}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-base text-black block">
                    {s.score}%
                  </span>
                  <span className="text-[11px] text-neutral-600 font-bold">
                    {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
