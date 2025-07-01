'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type Node, type MapData } from '@/lib/types';
import { updateMap } from '@/services/map-service';
import { MapNode } from './map-node';
import { NodeEditor } from './node-editor';
import { Plus, Save, Loader2 } from 'lucide-react';

export function MapCanvas({ map }: { map: MapData }) {
  const [nodes, setNodes] = useState<Node[]>(map.nodes);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const addNode = () => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    const newNode: Node = {
      id: crypto.randomUUID(),
      position: {
        x: canvasBounds ? canvasBounds.width / 2 - 128 : 200,
        y: canvasBounds ? canvasBounds.height / 2 - 50 : 150
      },
      title: 'New Node',
      description: '',
      links: [],
      files: [],
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
    setEditorOpen(true);
  };

  const updateNode = (updatedNode: Node) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    if (selectedNode?.id === updatedNode.id) {
      setSelectedNode(updatedNode);
    }
    toast({ title: "Node updated", description: `"${updatedNode.title}" has been saved.` });
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEditorOpen(false);
    setSelectedNode(null);
    toast({ title: "Node deleted", variant: "destructive" });
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
    setEditorOpen(true);
  };

  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position: newPosition } : n));
  }, []);

  const handleSaveMap = () => {
    setIsSaving(true);
    updateMap({ id: map.id, nodes })
      .then(() => {
        toast({
          title: "Map Saved!",
          description: `Your map "${map.name}" has been saved successfully.`,
        });
      })
      .catch(() => {
        toast({
          title: 'Error saving map',
          description: 'Could not save the map. Please try again.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-dot-zinc-700/[0.4] border rounded-lg flex-1">
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Button onClick={addNode}>
          <Plus className="mr-2 h-4 w-4" /> Add Node
        </Button>
        <Button variant="outline" onClick={handleSaveMap} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Map'}
        </Button>
      </div>

      <div ref={canvasRef} className="w-full h-full" style={{ backgroundSize: '20px 20px' }}>
        {nodes.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            onDrag={handleNodeDrag}
          />
        ))}
      </div>

      {selectedNode && (
        <NodeEditor
          isOpen={isEditorOpen}
          onOpenChange={setEditorOpen}
          node={selectedNode}
          onUpdate={updateNode}
          onDelete={deleteNode}
        />
      )}
    </div>
  );
}
