import { ICalendarEvent } from '../lib/types';
import { invoke } from '@tauri-apps/api/core';

export const calendarService = {
  async getEvents(): Promise<ICalendarEvent[]> {
    return await invoke('get_all_calendar_events_command');
  },

  async addEvent(event: Omit<ICalendarEvent, 'id'>): Promise<ICalendarEvent> {
    return await invoke('add_calendar_event_command', { event });
  },

  async updateEvent(updatedEvent: ICalendarEvent): Promise<ICalendarEvent | null> {
    return await invoke('update_calendar_event_command', { event: updatedEvent });
  },

  async deleteEvent(id: string): Promise<boolean> {
    return await invoke('delete_calendar_event_command', { id });
  },
};