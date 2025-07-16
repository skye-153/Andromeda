'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICalendarEvent } from '@/lib/types';

interface AddUndatedEventDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddEvent: (eventDetails: Partial<ICalendarEvent>) => void;
}

export function AddUndatedEventDialog({ isOpen, onOpenChange, onAddEvent }: AddUndatedEventDialogProps) {
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventImportance, setNewEventImportance] = useState<ICalendarEvent['importance']>('low');

  const handleAddEvent = () => {
    if (newEventTitle.trim() === '') return;
    onAddEvent({
      title: newEventTitle,
      description: newEventDescription,
      isUndated: true,
      importance: newEventImportance,
    });
    setNewEventTitle('');
    setNewEventDescription('');
    setNewEventImportance('low');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventImportance('low');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Undated Event</DialogTitle>
          <DialogDescription>
            Enter the details for your new event without a specific deadline.
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
            <Select onValueChange={(value) => setNewEventImportance(value as ICalendarEvent['importance'])} defaultValue="low">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddEvent}>Add Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
