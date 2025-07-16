'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ICalendarEvent } from '@/lib/types';

interface AddDatedEventDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddEvent: (eventDetails: Partial<ICalendarEvent>) => void;
  initialDate?: Date;
}

export function AddDatedEventDialog({ isOpen, onOpenChange, onAddEvent, initialDate }: AddDatedEventDialogProps) {
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventImportance, setNewEventImportance] = useState<ICalendarEvent['importance']>('low');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);

  useEffect(() => {
    setDueDate(initialDate);
  }, [initialDate]);

  const handleAddEvent = () => {
    if (newEventTitle.trim() === '') return;
    onAddEvent({
      title: newEventTitle,
      description: newEventDescription,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      isCompleted: false,
      isUndated: false,
      importance: newEventImportance,
    });
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventImportance('low');
    setDueDate(undefined);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventImportance('low');
      setDueDate(undefined);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Enter the details for your new event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              placeholder="Description (optional)"
              value={newEventDescription}
              onChange={(e) => setNewEventDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importance" className="text-right">Importance</Label>
            <div className="col-span-3 flex space-x-2">
              <Button
                variant={newEventImportance === 'low' ? 'default' : 'outline'}
                className={`bg-green-500 hover:bg-green-600 ${newEventImportance === 'low' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setNewEventImportance('low')}
              >
                Low
              </Button>
              <Button
                variant={newEventImportance === 'medium' ? 'default' : 'outline'}
                className={`bg-yellow-500 hover:bg-yellow-600 ${newEventImportance === 'medium' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setNewEventImportance('medium')}
              >
                Medium
              </Button>
              <Button
                variant={newEventImportance === 'high' ? 'default' : 'outline'}
                className={`bg-red-500 hover:bg-red-600 ${newEventImportance === 'high' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setNewEventImportance('high')}
              >
                High
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddEvent}>Add Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
