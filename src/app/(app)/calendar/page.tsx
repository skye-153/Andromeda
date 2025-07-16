'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AddDatedEventDialog } from '@/components/calendar/add-dated-event-dialog';
import { EditDatedEventDialog } from '@/components/calendar/edit-dated-event-dialog';
import { Plus, Trash2 } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ICalendarEvent } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { useSidebar } from '@/components/ui/sidebar';
import { UndatedEventsPanel } from '@/components/calendar/undated-events-panel';
import { calendarService } from '@/services/calendar-service';
import { initializeLowDb } from '@/lib/lowdb';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<ICalendarEvent[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<ICalendarEvent[]>([]);
  const [isAddDatedDialogOpen, setIsAddDatedDialogOpen] = useState(false);
  const [isEditDatedDialogOpen, setIsEditDatedDialogOpen] = useState(false);
  const [datedEventToEdit, setDatedEventToEdit] = useState<ICalendarEvent | null>(null);
  const { state: sidebarState } = useSidebar();

  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const initAndFetch = async () => {
      await initializeLowDb();
      fetchEvents();
    };
    initAndFetch();
  }, [refetch]);

  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setSelectedDateEvents(events.filter(event => event.dueDate === formattedDate && !event.isUndated));
    } else {
      setSelectedDateEvents([]);
    }
  }, [date, events]);

  const fetchEvents = async () => {
    try {
      const storedEvents = await calendarService.getEvents();
      setEvents(storedEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events.',
        variant: 'destructive',
      });
    }
  };

  const handleAddEvent = async (eventDetails: Partial<ICalendarEvent>) => {
    try {
      const newEvent = await calendarService.addEvent({
        title: eventDetails.title || 'New Event',
        description: eventDetails.description,
        dueDate: date && !eventDetails.isUndated ? format(date, 'yyyy-MM-dd') : undefined,
        isCompleted: false,
        isUndated: eventDetails.isUndated || false,
        importance: eventDetails.importance,
      });
      setEvents(prevEvents => [...prevEvents, newEvent]);
      if (!newEvent.isUndated && date && newEvent.dueDate === format(date, 'yyyy-MM-dd')) {
        setSelectedDateEvents(prevSelected => [...prevSelected, newEvent]);
      }
      if (!newEvent.isUndated) {
        setIsSheetOpen(false);
      }
      toast({
        title: 'Success',
        description: 'Event added successfully!',
      });
      setRefetch(prev => !prev);
    } catch (error) {
      console.error('Failed to add event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add event.',
        variant: 'destructive',
      });
    }
  };

    const handleToggleComplete = async (id: string) => {
    const eventToUpdate = events.find(event => event.id === id);
    if (eventToUpdate) {
      const updatedEvent = { ...eventToUpdate, isCompleted: !eventToUpdate.isCompleted };
      await calendarService.updateEvent(updatedEvent);
      setEvents(prevEvents =>
        prevEvents.map(event => (event.id === id ? updatedEvent : event))
      );
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const success = await calendarService.deleteEvent(id);
      if (success) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
        toast({
          title: 'Success',
          description: 'Event deleted successfully!',
        });
        setRefetch(prev => !prev);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete event.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event.',
        variant: 'destructive',
      });
    }
  };

  const handleEditEvent = async (updatedEvent: ICalendarEvent) => {
    try {
      await calendarService.updateEvent(updatedEvent);
      setEvents(prevEvents =>
        prevEvents.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
      );
      toast({
        title: 'Success',
        description: 'Event updated successfully!',
      });
      setRefetch(prev => !prev);
    } catch (error) {
      console.error('Failed to edit event:', error);
      toast({
        title: 'Error',
        description: 'Failed to edit event.',
        variant: 'destructive',
      });
    }
  };

  const handleEditDatedEventClick = (event: ICalendarEvent) => {
    setDatedEventToEdit(event);
    setIsEditDatedDialogOpen(true);
  };

  const undatedEvents = events.filter(event => event.isUndated);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Calendar</h1>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex-1 flex justify-center items-center overflow-y-auto h-[calc(100vh-10rem)]">
          <ScrollArea className="h-full w-full">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                if (selectedDate) {
                  setIsSheetOpen(true);
                }
              }}
              showOutsideDays={false}
              className="w-full h-full rounded-md border shadow"
              classNames={{
                caption_label: "text-4xl font-bold",
                head_cell: "text-2xl font-semibold w-44",
                cell: "h-36 w-44 text-center text-2xl p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 hover:bg-accent hover:text-accent-foreground rounded-lg",
                day: "h-full w-full p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
              }}
              formatters={{
                formatWeekdayName: (date) => format(date, 'EEE'),
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const formattedDayDate = format(dayDate, 'yyyy-MM-dd');
                  const eventsForDay = events.filter(event => event.dueDate === formattedDayDate && !event.isUndated);
                  const maxTitleLength = 10; // Adjust as needed for desired truncation

                  return (
                    <div
                      className={`relative h-full w-full flex flex-col items-center justify-start p-1 overflow-hidden cursor-pointer ${
                        date && format(dayDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && isSheetOpen ? 'bg-primary text-primary-foreground' : ''
                      } ${
                        isToday(dayDate) ? 'bg-blue-700 text-white font-bold rounded-lg' : ''
                      }`}
                      onClick={() => {
                        setDate(dayDate);
                        setIsSheetOpen(true);
                      }}
                    >
                      <span className="text-xl font-medium">{format(dayDate, 'd')}</span>
                      {eventsForDay.length > 0 && (
                        <div className="mt-1 flex flex-col items-center w-full">
                          {eventsForDay.map(event => (
                            <span
                              key={event.id}
                              className={`text-sm px-1 rounded-full ${event.isCompleted ? 'bg-green-500 opacity-50 line-through' : (event.importance === 'low' ? 'bg-green-500' : event.importance === 'medium' ? 'bg-yellow-500' : event.importance === 'high' ? 'bg-red-500' : 'bg-blue-500')} text-white truncate w-full text-center`}
                              title={event.title} // Show full title on hover
                            >
                              {event.title.length > maxTitleLength
                                ? `${event.title.substring(0, maxTitleLength)}...`
                                : event.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </ScrollArea>
        </div>
        </div>
      </div>

      {/* Event Sheet for Selected Date */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-80 sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Events for {date ? format(date, 'PPP') : 'Selected Date'}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Button onClick={() => setIsAddDatedDialogOpen(true)} className="w-full mb-4">
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>

            <h3 className="text-lg font-semibold mb-2">Existing Events</h3>
            {selectedDateEvents.length === 0 ? (
              <p>No events for this date.</p>
            ) : (
              <ul className="space-y-2">
                {selectedDateEvents.map(event => (
                  <li key={event.id} className="flex items-center justify-between bg-card p-3 rounded-md shadow-sm cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={event.isCompleted}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            handleToggleComplete(event.id);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Label
                        htmlFor={`event-${event.id}`}
                        className={event.isCompleted ? 'line-through text-muted-foreground' : ''}
                        onClick={() => handleEditDatedEventClick(event)}
                      >
                        {event.title}
                      </Label>
                    </div>
                    <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AddDatedEventDialog
        isOpen={isAddDatedDialogOpen}
        onOpenChange={setIsAddDatedDialogOpen}
        onAddEvent={handleAddEvent}
        initialDate={date}
      />

      <EditDatedEventDialog
        isOpen={isEditDatedDialogOpen}
        onOpenChange={setIsEditDatedDialogOpen}
        event={datedEventToEdit}
        onSave={handleEditEvent}
      />

      {/* Undated Events Panel */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarState === 'collapsed' ? 'w-80 p-4 border-l' : 'w-0'
        } overflow-hidden`}
      >
        {sidebarState === 'collapsed' && (
          <UndatedEventsPanel
            events={undatedEvents}
            onAddEvent={handleAddEvent}
            onToggleComplete={handleToggleComplete}
            onDeleteEvent={handleDeleteEvent}
            onEditEvent={handleEditEvent}
          />
        )}
      </div>
    </div>
  );
}
