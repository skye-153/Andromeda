'use client';
import React, { useState, useEffect } from 'react';
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
import { Trash2, X, Link as LinkIcon, File } from 'lucide-react';
import { type Node } from '@/lib/types';
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


interface NodeEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  node: Node;
  onUpdate: (node: Node) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeEditor({ isOpen, onOpenChange, node, onUpdate, onDelete }: NodeEditorProps) {
  const [formData, setFormData] = useState<Node>(node);
  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    setFormData(node);
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

  const handleSave = () => {
    onUpdate(formData);
    onOpenChange(false);
  };
  
  const handleDelete = () => {
      onDelete(node.id);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
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
           <div className="space-y-2">
            <Label>Files</Label>
            <Button variant="outline" className="w-full justify-start font-normal" disabled>
                <File className="mr-2 h-4 w-4" /> Attach File
            </Button>
            <p className="text-xs text-muted-foreground text-center">File attachments are not yet implemented.</p>
           </div>
        </div>
        <SheetFooter className="p-6 flex justify-between items-center bg-background border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4"/> Delete Node
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
