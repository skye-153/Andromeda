'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '@/lib/types';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isUndatedSheetOpen, setIsUndatedSheetOpen] = useState(false);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      setSelectedDateTasks(tasks.filter(task => task.dueDate === formattedDate && !task.isUndated));
    } else {
      setSelectedDateTasks([]);
    }
  }, [date, tasks]);

  const fetchTasks = async () => {
    try {
      const storedTasks: Task[] = await invoke('get_tasks_command');
      setTasks(storedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks.',
        variant: 'destructive',
      });
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await invoke('save_tasks_command', { tasks: updatedTasks });
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tasks.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      dueDate: date ? format(date, 'yyyy-MM-dd') : undefined,
      isCompleted: false,
      isUndated: !date,
    };

    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setNewTaskTitle('');
    setIsSheetOpen(false);
    setIsUndatedSheetOpen(false);
    toast({
      title: 'Success',
      description: 'Task added successfully!',
    });
  };

  const handleToggleComplete = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    toast({
      title: 'Success',
      description: 'Task deleted successfully!',
    });
  };

  const undatedTasks = tasks.filter(task => task.isUndated);

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
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
              }}
              formatters={{
                formatWeekdayName: (date) => format(date, 'EEE'),
              }}
              components={{
                Day: ({ date: dayDate, ...props }) => {
                  const formattedDayDate = format(dayDate, 'yyyy-MM-dd');
                  const tasksForDay = tasks.filter(task => task.dueDate === formattedDayDate && !task.isUndated);
                  const maxTitleLength = 10; // Adjust as needed for desired truncation

                  return (
                    <div
                      className={`relative h-full w-full flex flex-col items-center justify-start p-1 overflow-hidden cursor-pointer ${date && format(dayDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && isSheetOpen ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => {
                        setDate(dayDate);
                        setIsSheetOpen(true);
                      }}
                    >
                      <span className="text-xl font-medium">{format(dayDate, 'd')}</span>
                      {tasksForDay.length > 0 && (
                        <div className="mt-1 flex flex-col items-center w-full">
                          {tasksForDay.map(task => (
                            <span
                              key={task.id}
                              className={`text-sm px-1 rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-blue-500'} text-white truncate w-full text-center`}
                              title={task.title} // Show full title on hover
                            >
                              {task.title.length > maxTitleLength
                                ? `${task.title.substring(0, maxTitleLength)}...`
                                : task.title}
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

      {/* Task Sheet for Selected Date */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-80 sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Tasks for {date ? format(date, 'PPP') : 'Selected Date'}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="grid gap-4 mb-4">
              <Input
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>

            <h3 className="text-lg font-semibold mb-2">Existing Tasks</h3>
            {selectedDateTasks.length === 0 ? (
              <p>No tasks for this date.</p>
            ) : (
              <ul className="space-y-2">
                {selectedDateTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between bg-card p-3 rounded-md shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.isCompleted}
                        onCheckedChange={() => handleToggleComplete(task.id)}
                      />
                      <Label
                        htmlFor={`task-${task.id}`}
                        className={task.isCompleted ? 'line-through text-muted-foreground' : ''}
                      >
                        {task.title}
                      </Label>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Undated Tasks Sidemenu */}
      <Sheet open={isUndatedSheetOpen} onOpenChange={setIsUndatedSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute top-4 right-4">Undated Tasks</Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Undated Tasks</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <div className="grid gap-4 mb-4">
              <Input
                placeholder="New undated task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button onClick={() => {
                setDate(undefined); // Ensure no date is selected for undated tasks
                handleAddTask();
              }}>Add Undated Task</Button>
            </div>
            {undatedTasks.length === 0 ? (
              <p>No undated tasks.</p>
            ) : (
              <ul className="space-y-2">
                {undatedTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between bg-card p-3 rounded-md shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`undated-task-${task.id}`}
                        checked={task.isCompleted}
                        onCheckedChange={() => handleToggleComplete(task.id)}
                      />
                      <Label
                        htmlFor={`undated-task-${task.id}`}
                        className={task.isCompleted ? 'line-through text-muted-foreground' : ''}
                      >
                        {task.title}
                      </Label>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
