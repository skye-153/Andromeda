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
import { Task } from '@/lib/types';

interface EditDatedTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  task: Task | null;
  onSave: (task: Task) => void;
}

export function EditDatedTaskDialog({ isOpen, onOpenChange, task, onSave }: EditDatedTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setEditedTask(task);
    if (task?.dueDate) {
      setDueDate(parseISO(task.dueDate));
    } else {
      setDueDate(undefined);
    }
  }, [task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditedTask(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleImportanceChange = (value: string) => {
    setEditedTask(prev => prev ? { ...prev, importance: parseInt(value, 10) } : null);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
    setEditedTask(prev => prev ? { ...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined } : null);
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
      setDueDate(undefined);
    }
    onOpenChange(open);
  };

  if (!editedTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Modify the details of your task.
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
