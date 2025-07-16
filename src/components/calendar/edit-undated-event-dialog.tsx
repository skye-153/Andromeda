'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICalendarEvent } from '@/lib/types';

interface EditUndatedEventDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: ICalendarEvent | null;
  onSave: (event: ICalendarEvent) => void;
}

export function EditUndatedEventDialog({ isOpen, onOpenChange, event, onSave }: EditUndatedEventDialogProps) {
  const [editedEvent, setEditedEvent] = useState<ICalendarEvent | null>(event);

  useEffect(() => {
    setEditedEvent(event);
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedEvent(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleImportanceChange = (value: ICalendarEvent['importance']) => {
    setEditedEvent(prev => prev ? { ...prev, importance: value } : null);
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
    }
    onOpenChange(open);
  };

  if (!editedEvent) return null; // Don't render if no event is being edited

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Undated Event</DialogTitle>
          <DialogDescription>
            Modify the details of your undated event.
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
            <Select onValueChange={(value) => handleImportanceChange(value as ICalendarEvent['importance'])} value={editedEvent.importance || 'low'}>
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
          <Button type="submit" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
