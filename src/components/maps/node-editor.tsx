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

  const handleOpenFile = (file: FileData) => {
    try {
      // Convert base64 back to blob
      const byteCharacters = atob(file.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      // Create object URL for opening
      const url = URL.createObjectURL(blob);
      
      // For images, PDFs, and text files, try to open in new tab
      if (file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/')) {
        window.open(url, '_blank');
        toast({
          title: "File opened",
          description: `"${file.name}" opened in new tab.`,
        });
      } else {
        // For other file types, try to open with default application
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

      // Clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error opening file",
        description: "Could not open the file. Please try again.",
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

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="md:max-w-3xl lg:max-w-4xl w-[90vw] flex flex-col left-1/2 transform -translate-x-1/2 right-auto">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Edit Node</SheetTitle>
          <SheetDescription>Update node properties. Click save when you're done.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Node Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Add details about this node..."/>
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
              <Label>YouTube Links</Label>
              <form onSubmit={(e) => { e.preventDefault(); handleAddLink(); }} className="flex gap-2">
                  <Input 
                    placeholder="https://youtube.com/watch?v=..."
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
                          <span className="truncate flex-1">{link}</span>
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
              <p className="text-xs text-muted-foreground text-center">
                Files are stored locally and will be lost when you refresh the page.
              </p>
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
        <SheetFooter className="p-6 flex justify-between items-center bg-background border-t">
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
