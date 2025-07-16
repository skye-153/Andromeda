'use client';

import { useState } from 'react';
import { ICalendarEvent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddUndatedEventDialog } from './add-undated-event-dialog';
import { EditUndatedEventDialog } from './edit-undated-event-dialog';
import { Plus, Trash2 } from 'lucide-react';

interface UndatedEventsPanelProps {
  events: ICalendarEvent[];
  onAddEvent: (eventDetails: Partial<ICalendarEvent>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: ICalendarEvent) => void;
}

export function UndatedEventsPanel({ events, onAddEvent, onToggleComplete, onDeleteEvent, onEditEvent }: UndatedEventsPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ICalendarEvent | null>(null);

  const getImportanceColor = (importance: 'low' | 'medium' | 'high' | undefined) => {
    switch (importance) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleEditClick = (event: ICalendarEvent) => {
    setEventToEdit(event);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold">Undated Events</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {events.length === 0 ? (
          <p className="text-lg">No undated events.</p>
        ) : (
          <ul className="space-y-2">
            {events.map(event => (
              <li key={event.id} className="flex items-start justify-between bg-card p-3 rounded-md shadow-sm cursor-pointer" onClick={() => handleEditClick(event)}>
                <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full mt-1 ${getImportanceColor(event.importance)}`}></div>
                    <Checkbox
                        id={`undated-event-${event.id}`}
                        checked={event.isCompleted}
                        onCheckedChange={() => onToggleComplete(event.id)}
                        className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                        <Label
                            htmlFor={`undated-event-${event.id}`}
                            className={`text-base ${event.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                        >
                            {event.title}
                        </Label>
                        {event.description && (
                            <p className="text-sm text-muted-foreground">
                                {event.description}
                            </p>
                        )}
                    </div>
                </div>
                <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <AddUndatedEventDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddEvent={onAddEvent}
      />
      <EditUndatedEventDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        event={eventToEdit}
        onSave={onEditEvent}
      />
    </div>
  );
}
