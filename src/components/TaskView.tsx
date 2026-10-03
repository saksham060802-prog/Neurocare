import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Users,
} from 'lucide-react';
import { Task } from '../types';
import { GoogleCalendarWidget } from './GoogleCalendarWidget';
import { GoogleContactsWidget } from './GoogleContactsWidget';
import { GoogleContact } from '../services/GoogleContactsService';

interface TaskViewProps {
  tasks: Task[];
  onAddTask: (title: string, description?: string, dueAt?: string, category?: Task['category']) => Promise<void>;
  onToggleTaskStatus: (id: string, currentStatus: Task['status']) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  accessToken?: string | null;
  onSignInRequired?: () => void;
  onSelectEmergencyContact?: (contactName: string, phone: string) => void;
  onSimulateCall?: (contactName: string, role: string) => void;
}

export const TaskView: React.FC<TaskViewProps> = ({
  tasks,
  onAddTask,
  onToggleTaskStatus,
  onDeleteTask,
  accessToken = null,
  onSignInRequired = () => {},
  onSelectEmergencyContact,
  onSimulateCall,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('pending');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueTime, setDueTime] = useState('18:00');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build ISO timestamp for due time today
    const [hours, minutes] = dueTime.split(':').map(Number);
    const dueDate = new Date();
    dueDate.setHours(hours || 18, minutes || 0, 0, 0);

    await onAddTask(title, description, dueDate.toISOString(), 'health');
    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in text-[#18181B]">
      {/* Header Banner */}
      <div className="bg-[#18181B] rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white text-[#111827] text-xs font-bold uppercase tracking-wider mb-2">
            <CheckSquare className="w-4 h-4 text-[#18181B]" />
            <span>Reminders & Routines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Daily Schedule & Tasks</h1>
          <p className="text-gray-300 text-sm mt-1 max-w-xl leading-relaxed font-medium">
            Stay on track with medications, family check-ins, and daily wellness habits.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          id="add-task-btn"
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-100 text-[#111827] font-bold text-sm transition-all whitespace-nowrap min-h-[44px] shadow-xs"
        >
          <Plus className="w-5 h-5" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB] pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'pending', label: 'Pending Reminders' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All Tasks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] border whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-[#18181B] text-white border-[#18181B]'
                : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E5E7EB] space-y-3 shadow-xs">
          <CheckSquare className="w-12 h-12 text-[#6B7280] mx-auto" />
          <h3 className="text-lg font-bold text-[#111827]">No tasks found</h3>
          <p className="text-sm text-[#6B7280] font-medium">
            {filterStatus === 'pending'
              ? 'Great job! You have completed all pending reminders for today.'
              : 'Click "New Reminder" above to set a task!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-xs ${
                  isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => onToggleTaskStatus(task.id, task.status)}
                    title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    className={`mt-0.5 w-6 h-6 rounded-lg border border-[#E5E7EB] flex items-center justify-center transition-colors min-w-[24px] ${
                      isCompleted ? 'bg-[#18181B] text-white' : 'bg-white text-[#374151] hover:bg-gray-100'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div className="space-y-0.5">
                    <p
                      className={`text-base font-bold text-[#111827] ${
                        isCompleted ? 'line-through text-[#9CA3AF]' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-[#6B7280] font-medium">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0 justify-end">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#F9FAFB] text-[#374151] text-xs font-bold border border-[#E5E7EB]">
                    <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span>
                      {new Date(task.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete Reminder"
                    className="p-2 rounded-xl text-[#6B7280] hover:bg-gray-100 hover:text-[#111827] border border-[#E5E7EB] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Google Workspace Live Integrations Grid */}
      <div className="pt-6 border-t border-[#E5E7EB] space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] text-white text-[10px] font-bold uppercase tracking-wider">
            Google Workspace Services
          </span>
          <h2 className="text-lg font-bold text-[#111827]">Live Calendar & Contacts Sync</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoogleCalendarWidget
            accessToken={accessToken}
            onSignInRequired={onSignInRequired}
            tasks={tasks}
          />

          <GoogleContactsWidget
            accessToken={accessToken}
            onSignInRequired={onSignInRequired}
            onSelectEmergencyContact={onSelectEmergencyContact}
            onSimulateCall={onSimulateCall}
          />
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-[#E5E7EB] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-xl font-bold text-[#111827]">Create New Reminder</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-[#374151] hover:bg-gray-100 border border-[#E5E7EB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Call Priya or Take blood pressure medication"
                  id="task-title-input"
                  className="w-full p-3.5 bg-white border border-[#E5E7EB] rounded-xl text-base font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                  Notes / Details (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 1 tablet with warm water"
                  id="task-desc-input"
                  className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase mb-1">
                  Scheduled Time Today
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-3 bg-white border border-[#E5E7EB] rounded-xl text-base font-bold text-[#111827]"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-[#374151] font-bold text-xs hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#18181B] disabled:opacity-50 text-white font-bold text-xs hover:bg-[#27272A] transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
