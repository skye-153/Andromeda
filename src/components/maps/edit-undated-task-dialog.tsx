'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/lib/types';

interface EditUndatedTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task | null;
  onSave: (task: Task) => void;
}

export function EditUndatedTaskDialog({ isOpen, onOpenChange, task, onSave }: EditUndatedTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedTask(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleImportanceChange = (value: string) => {
    setEditedTask(prev => prev ? { ...prev, importance: parseInt(value, 10) } : null);
  };

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditedTask(null);
    }
    onOpenChange(open);
  };

  if (!editedTask) return null; // Don't render if no task is being edited

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Undated Task</DialogTitle>
          <DialogDescription>
            Modify the details of your undated task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importance" className="text-right">Importance</Label>
            <Select onValueChange={handleImportanceChange} value={editedTask.importance?.toString() || '1'}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium-Low</SelectItem>
                <SelectItem value="3">Medium</SelectItem>
                <SelectItem value="4">Medium-High</SelectItem>
                <SelectItem value="5">High</SelectItem>
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
