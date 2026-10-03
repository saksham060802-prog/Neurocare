import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Trash2, Clock, MapPin, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { GoogleCalendarEvent, GoogleCalendarService } from '../services/GoogleCalendarService';
import { Task } from '../types';

interface GoogleCalendarWidgetProps {
  accessToken: string | null;
  onSignInRequired: () => void;
  tasks?: Task[];
  onTaskSynced?: (taskTitle: string) => void;
}

export const GoogleCalendarWidget: React.FC<GoogleCalendarWidgetProps> = ({
  accessToken,
  onSignInRequired,
  tasks = [],
  onTaskSynced,
}) => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Event Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Mandatory Confirmation Modal States
  const [confirmModalData, setConfirmModalData] = useState<{
    type: 'create' | 'delete';
    title: string;
    details: string;
    actionPayload?: any;
  } | null>(null);

  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Load calendar events when token is present
  const loadEvents = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedEvents = await GoogleCalendarService.fetchUpcomingEvents(accessToken);
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Failed to load Google Calendar events:', err);
      setError(err.message || 'Could not fetch Google Calendar events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadEvents();
    }
  }, [accessToken]);

  // Request Confirmation before Creating Event
  const handleInitiateCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim() || !newDateTime) return;

    const startTime = new Date(newDateTime);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    setConfirmModalData({
      type: 'create',
      title: 'Confirm New Google Calendar Event',
      details: `Title: "${newSummary}"\nStart: ${startTime.toLocaleString()}\nEnd: ${endTime.toLocaleString()}${
        newLocation ? `\nLocation: ${newLocation}` : ''
      }`,
      actionPayload: {
        summary: newSummary,
        description: newDescription,
        location: newLocation,
        startDateTime: startTime.toISOString(),
        endDateTime: endTime.toISOString(),
      },
    });
  };

  // Request Confirmation before Deleting Event
  const handleInitiateDeleteEvent = (event: GoogleCalendarEvent) => {
    setConfirmModalData({
      type: 'delete',
      title: 'Confirm Delete Calendar Event',
      details: `Are you sure you want to delete "${event.summary}" from your Google Calendar? This action cannot be undone.`,
      actionPayload: event.id,
    });
  };

  // Execute Confirmed Action
  const handleExecuteConfirmedAction = async () => {
    if (!confirmModalData || !accessToken) return;

    setIsSubmittingAction(true);
    try {
      if (confirmModalData.type === 'create') {
        await GoogleCalendarService.createEvent(accessToken, confirmModalData.actionPayload);
        setIsCreateModalOpen(false);
        setNewSummary('');
        setNewDescription('');
        setNewLocation('');
        setNewDateTime('');
      } else if (confirmModalData.type === 'delete') {
        await GoogleCalendarService.deleteEvent(accessToken, confirmModalData.actionPayload);
      }
      setConfirmModalData(null);
      await loadEvents();
    } catch (err: any) {
      alert(`Calendar action failed: ${err.message}`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Sync an existing local Task to Google Calendar
  const handleSyncTaskToCalendar = (task: Task) => {
    const taskDue = task.dueAt ? new Date(task.dueAt) : new Date(Date.now() + 3600000);
    const taskEnd = new Date(taskDue.getTime() + 30 * 60000);

    setConfirmModalData({
      type: 'create',
      title: 'Sync Task to Google Calendar',
      details: `Title: "${task.title}"\nScheduled: ${taskDue.toLocaleString()}\nCategory: ${task.category || 'Health/Routine'}`,
      actionPayload: {
        summary: task.title,
        description: `Synced from NeuroCare Task Manager\nCategory: ${task.category || 'general'}`,
        startDateTime: taskDue.toISOString(),
        endDateTime: taskEnd.toISOString(),
      },
    });
  };

  if (!accessToken) {
    return (
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs text-center">
        <div className="w-12 h-12 mx-auto bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">Google Calendar Sync</h3>
        <p className="text-xs text-stone-600 mb-4 max-w-md mx-auto">
          Connect your Google Calendar to view medical appointments, family visits, and automatically sync medication reminders.
        </p>
        <button
          onClick={onSignInRequired}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-xs"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">Google Calendar Events</h3>
            <p className="text-[11px] text-stone-500">Live synced from your primary Google Calendar</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadEvents}
            disabled={isLoading}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Events List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Fetching events from Google Calendar...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="py-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <p className="text-xs text-stone-500">No upcoming events scheduled on your Google Calendar.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {events.map((event) => {
            const startDisplay = event.start.dateTime
              ? new Date(event.start.dateTime).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : event.start.date || 'All Day';

            return (
              <div
                key={event.id}
                className="flex items-start justify-between p-3.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl transition-all group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">{event.summary}</span>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-stone-400 hover:text-emerald-600"
                        title="Open in Google Calendar"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-stone-500">
                    <span className="flex items-center space-x-1 font-semibold text-emerald-800">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>{startDisplay}</span>
                    </span>

                    {event.location && (
                      <span className="flex items-center space-x-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{event.location}</span>
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-[11px] text-stone-600 line-clamp-1 italic">{event.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleInitiateDeleteEvent(event)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sync Local Tasks Bar */}
      {tasks.length > 0 && (
        <div className="pt-3 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-700 block mb-2">Quick Sync App Tasks to Google Calendar</span>
          <div className="flex flex-wrap gap-2">
            {tasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                onClick={() => handleSyncTaskToCalendar(task)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium transition-all"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[140px]">{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-stone-900">Add Event to Google Calendar</h3>

            <form onSubmit={handleInitiateCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="e.g. Memory Checkup with Dr. Sen"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Duration (Minutes)</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Shillong NeuroCare Hospital"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Notes / Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Remember to bring medical history report"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Proceed to Confirmation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Explicit User Confirmation Dialog for Mutating Google Workspace Data */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-stone-900 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-stone-900">{confirmModalData.title}</h3>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-800 whitespace-pre-wrap font-mono border border-stone-200">
              {confirmModalData.details}
            </div>

            <p className="text-xs text-stone-500">
              This action will directly modify your Google Workspace Calendar data.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmModalData(null)}
                disabled={isSubmittingAction}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteConfirmedAction}
                disabled={isSubmittingAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-bold shadow-sm ${
                  confirmModalData.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isSubmittingAction ? 'Updating Calendar...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
