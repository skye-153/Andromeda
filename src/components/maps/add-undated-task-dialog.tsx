'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task } from '@/lib/types';

interface AddUndatedTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTask: (taskDetails: Partial<Task>) => void;
}

export function AddUndatedTaskDialog({ isOpen, onOpenChange, onAddTask }: AddUndatedTaskDialogProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskImportance, setNewTaskImportance] = useState(1);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;
    onAddTask({
      title: newTaskTitle,
      description: newTaskDescription,
      isUndated: true,
      importance: newTaskImportance,
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskImportance(1);
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskImportance(1);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Undated Task</DialogTitle>
          <DialogDescription>
            Enter the details for your new task without a specific deadline.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Title</Label>
            <Input
              id="title"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Textarea
              id="description"
              placeholder="Description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importance" className="text-right">Importance</Label>
            <Select onValueChange={(value) => setNewTaskImportance(parseInt(value, 10))} defaultValue="1">
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
          <Button type="submit" onClick={handleAddTask}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
