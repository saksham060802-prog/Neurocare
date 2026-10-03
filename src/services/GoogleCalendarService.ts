export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
  status?: string;
}

export class GoogleCalendarService {
  private static BASE_URL = 'https://www.googleapis.com/calendar/v3';

  static async fetchUpcomingEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
    const now = new Date().toISOString();
    const url = `${this.BASE_URL}/calendars/primary/events?timeMin=${encodeURIComponent(
      now
    )}&maxResults=15&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Calendar API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  static async createEvent(
    accessToken: string,
    event: {
      summary: string;
      description?: string;
      location?: string;
      startDateTime: string;
      endDateTime: string;
    }
  ): Promise<GoogleCalendarEvent> {
    const url = `${this.BASE_URL}/calendars/primary/events`;

    const body = {
      summary: event.summary,
      description: event.description || 'Added via NeuroCare Assistive App',
      location: event.location,
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create Google Calendar event (${response.status}): ${errText}`);
    }

    return await response.json();
  }

  static async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    const url = `${this.BASE_URL}/calendars/primary/events/${eventId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errText = await response.text();
      throw new Error(`Failed to delete Google Calendar event (${response.status}): ${errText}`);
    }
  }
}
