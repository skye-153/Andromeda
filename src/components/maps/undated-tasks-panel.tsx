'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddUndatedTaskDialog } from './add-undated-task-dialog';
import { EditUndatedTaskDialog } from './edit-undated-task-dialog';
import { Plus, Trash2 } from 'lucide-react';

interface UndatedTasksPanelProps {
  tasks: Task[];
  onAddTask: (taskDetails: Partial<Task>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

export function UndatedTasksPanel({ tasks, onAddTask, onToggleComplete, onDeleteTask, onEditTask }: UndatedTasksPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const getImportanceColor = (importance: number | undefined) => {
    switch (importance) {
      case 5: return 'bg-red-900';
      case 4: return 'bg-red-700';
      case 3: return 'bg-red-500';
      case 2: return 'bg-red-300';
      case 1: return 'bg-red-100';
      default: return 'bg-gray-400';
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-4xl font-bold">Undated Tasks</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {tasks.length === 0 ? (
          <p className="text-lg">No undated tasks.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md shadow-sm cursor-pointer" onClick={() => handleEditClick(task)}>
                <div className="flex items-start space-x-3">
                    <div className={`w-4 h-4 rounded-full mt-1 ${getImportanceColor(task.importance)}`}></div>
                    <Checkbox
                        id={`undated-task-${task.id}`}
                        checked={task.isCompleted}
                        onCheckedChange={() => onToggleComplete(task.id)}
                        className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                        <Label
                            htmlFor={`undated-task-${task.id}`}
                            className={`text-base ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                        >
                            {task.title}
                        </Label>
                        {task.description && (
                            <p className="text-sm text-muted-foreground">
                                {task.description}
                            </p>
                        )}
                    </div>
                </div>
                <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <AddUndatedTaskDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTask={onAddTask}
      />
      <EditUndatedTaskDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={taskToEdit}
        onSave={onEditTask}
      />
    </div>
  );
}