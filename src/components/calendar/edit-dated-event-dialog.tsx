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
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ICalendarEvent } from '@/lib/types';

interface EditDatedEventDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: ICalendarEvent | null;
  onSave: (event: ICalendarEvent) => void;
}

export function EditDatedEventDialog({ isOpen, onOpenChange, event, onSave }: EditDatedEventDialogProps) {
  const [editedEvent, setEditedEvent] = useState<ICalendarEvent | null>(event);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setEditedEvent(event);
    if (event?.dueDate) {
      setDueDate(parseISO(event.dueDate));
    } else {
      setDueDate(undefined);
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedEvent(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleImportanceChange = (value: ICalendarEvent['importance']) => {
    setEditedEvent(prev => prev ? { ...prev, importance: value } : null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setEditedEvent(prev => prev ? { ...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined } : null);
  };

  const handleSave = () => {
    if (editedEvent) {
      onSave(editedEvent);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditedEvent(null);
      setDueDate(undefined);
    }
    onOpenChange(open);
  };

  if (!editedEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Modify the details of your event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={editedEvent.title}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={editedEvent.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importance" className="text-right">Importance</Label>
            <div className="col-span-3 flex space-x-2">
              <Button
                variant={editedEvent.importance === 'low' ? 'default' : 'outline'}
                className={`bg-green-500 hover:bg-green-600 ${editedEvent.importance === 'low' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleImportanceChange('low')}
              >
                Low
              </Button>
              <Button
                variant={editedEvent.importance === 'medium' ? 'default' : 'outline'}
                className={`bg-yellow-500 hover:bg-yellow-600 ${editedEvent.importance === 'medium' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleImportanceChange('medium')}
              >
                Medium
              </Button>
              <Button
                variant={editedEvent.importance === 'high' ? 'default' : 'outline'}
                className={`bg-red-500 hover:bg-red-600 ${editedEvent.importance === 'high' ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleImportanceChange('high')}
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
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
