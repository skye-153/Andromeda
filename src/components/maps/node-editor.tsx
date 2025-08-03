'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Trash2, X, Link as LinkIcon, File, Upload, ExternalLink, Edit2 } from 'lucide-react';
import { type Node, type FileData } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const NODE_COLORS = [
  '#1a1a1a', // Dark Gray (almost black)
  '#333333', // Slightly Lighter Dark Gray
  '#4d4d4d', // Medium Dark Gray
  '#666666', // Light Dark Gray
  '#808080', // Gray
  '#b30000', // Dark Red
  '#b35900', // Dark Orange
  '#b3b300', // Dark Yellow
  '#006600', // Dark Green
  '#006666', // Dark Cyan
  '#0000b3', // Dark Blue
  '#660066', // Dark Purple
  '#b30059', // Dark Pink
  '#090f29',
];

interface NodeEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  node: Node;
  onUpdate: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeEditor({ isOpen, onOpenChange, node, onUpdate, onDelete }: NodeEditorProps) {
  const [formData, setFormData] = useState<Node>({ ...node, isDone: node.isDone ?? false });
  const [newLink, setNewLink] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({ ...node, isDone: node.isDone ?? false });
  }, [node, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddLink = () => {
      if (newLink && !formData.links.includes(newLink)) {
          setFormData(prev => ({ ...prev, links: [...prev.links, newLink] }));
          setNewLink('');
      }
  };

  const handleRemoveLink = (linkToRemove: string) => {
      setFormData(prev => ({...prev, links: prev.links.filter(l => l !== linkToRemove)}));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const fileData: FileData = {
          id: crypto.randomUUID(),
          name: file.name,
          originalName: file.name,
          size: file.size,
          type: file.type,
          content: content.split(',')[1], // Remove the data:application/...;base64, prefix
        };
        
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, fileData]
        }));
      };
      reader.readAsDataURL(file);
    });

    toast({
      title: "Files attached",
      description: `${files.length} file(s) have been attached to this node.`,
    });

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleOpenFile = async (file: FileData) => {
    try {
      // Check if running in Tauri
      if (window.__TAURI__) {
        await invoke('open_file_command', { file });
      } else {
        // Fallback for web environment (e.g., development in browser)
        const byteCharacters = atob(file.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        const url = URL.createObjectURL(blob);

        if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
          window.open(url, '_blank');
          toast({
            title: "File opened",
            description: `"${file.name}" opened in new tab.`,
          });
        } else {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({
            title: "File opened",
            description: `"${file.name}" opened with default application.`,
          });
        }
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      }
    } catch (error) {
      console.error("Error opening file:", error);
      toast({
        title: "Error opening file",
        description: "Could not open the file. Please try again. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
    toast({
      title: "File removed",
      description: "File has been removed from this node.",
    });
  };

  const handleStartRenameFile = (file: FileData) => {
    setEditingFileId(file.id);
    setEditingFileName(file.name);
  };

  const handleSaveFileName = () => {
    if (!editingFileId || !editingFileName.trim()) return;

    setFormData(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === editingFileId ? { ...f, name: editingFileName.trim() } : f
      )
    }));

    setEditingFileId(null);
    setEditingFileName('');
    toast({
      title: "File renamed",
      description: "File name has been updated.",
    });
  };

  const handleCancelRename = () => {
    setEditingFileId(null);
    setEditingFileName('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    onUpdate(formData);
    onOpenChange(false);
  };
  
  const handleDelete = () => {
      onDelete(node.id);
  }

  const handleOpenLink = async (url: string) => {
    try {
      if ((window as any).__TAURI__) {
        await open(url);  // Simplified call, no need for options
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="
          w-full max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl
          left-1/2 transform -translate-x-1/2 right-auto
          h-full max-h-screen flex flex-col
        "
        style={{ maxWidth: '100vw', width: '100vw', height: '100vh', maxHeight: '100vh' }}
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Edit Node</SheetTitle>
          <SheetDescription>Update node properties. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 w-full max-w-full">
          <div className="space-y-2">
            <Label htmlFor="title">Node Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Add details about this node..."/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Node Size</Label>
            <Select
              value={formData.size || '100%'}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, size: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50%">50%</SelectItem>
                <SelectItem value="75%">75%</SelectItem>
                <SelectItem value="100%">100%</SelectItem>
                <SelectItem value="125%">125%</SelectItem>
                <SelectItem value="150%">150%</SelectItem>
                <SelectItem value="200%">200%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Node Color</Label>
            <div className="flex flex-wrap gap-2">
              {NODE_COLORS.map((colorOption) => (
                <div
                  key={colorOption}
                  className={cn(
                    "w-8 h-8 rounded-full cursor-pointer border-2 border-transparent transition-all duration-200",
                    formData.color === colorOption && "border-primary"
                  )}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setFormData((prev) => ({ ...prev, color: colorOption }))}
                />
              ))}
            </div>
          </div>
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label>Mark as Complete</Label>
                <p className="text-sm text-muted-foreground">
                    Completed nodes will be visually distinct on the map.
                </p>
            </div>
            <Switch
                checked={formData.isDone}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isDone: checked }))}
                aria-readonly
            />
          </div>
          <div className="space-y-4">
              <Label>Links</Label>
              <form onSubmit={(e) => { e.preventDefault(); handleAddLink(); }} className="flex gap-2">
                  <Input 
                    placeholder="https://example.com"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    type="url"
                  />
                  <Button type="submit" size="sm">Add</Button>
              </form>
              <ul className="space-y-2">
                  {formData.links.map((link, i) => (
                      <li key={i} className="flex items-center justify-between text-sm bg-secondary p-2 rounded-md">
                          <LinkIcon className="h-4 w-4 mr-2 shrink-0 text-muted-foreground"/>
                          <span
                            className="truncate flex-1 text-primary underline hover:text-blue-600 transition-colors cursor-pointer"
                            title={link}
                            onClick={() => handleOpenLink(link)}
                          >
                            {link}
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveLink(link)}>
                              <X className="h-4 w-4"/>
                          </Button>
                      </li>
                  ))}
              </ul>
          </div>
          <div className="space-y-4">
            <Label>Files</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
              <Button 
                variant="outline" 
                className="w-full justify-start font-normal" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Attach Files
              </Button>
            </div>
            
            {formData.files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attached Files ({formData.files.length})</Label>
                <ul className="space-y-2">
                  {formData.files.map((file, index) => (
                    <li key={file.id} className="flex items-center justify-between text-sm bg-secondary p-3 rounded-md">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <File className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        {editingFileId === file.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingFileName}
                              onChange={(e) => setEditingFileName(e.target.value)}
                              className="flex-1 h-8 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveFileName();
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={handleSaveFileName}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="flex-1 min-w-0 cursor-pointer hover:bg-accent/50 p-1 rounded transition-colors"
                            onClick={() => handleOpenFile(file)}
                            title="Click to open/download file"
                          >
                            <div className="font-medium truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {editingFileId !== file.id && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleStartRenameFile(file)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleOpenFile(file)}
                              title="Open file"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleRemoveFile(file.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <SheetFooter className="p-4 sm:p-6 flex justify-between items-center bg-background border-t w-full max-w-full">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2 h-4"/> Delete Node
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the node and all its contents.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}