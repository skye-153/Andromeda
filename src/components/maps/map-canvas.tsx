'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type Node, type Connection, type MapData } from '@/lib/types';
import { updateMap } from '@/services/map-service';
import { MapNode } from './map-node';
import { NodeEditor } from './node-editor';
import { MapConnections } from './map-connections';
import { Plus, Save, Link2, Link2Off, Loader2 } from 'lucide-react';

export function MapCanvas({ map }: { map: MapData }) {
  const [nodes, setNodes] = useState<Node[]>(map.nodes);
  const [connections, setConnections] = useState<Connection[]>(map.connections);
  const [linkingState, setLinkingState] = useState<{ active: boolean; from: string | null }>({ active: false, from: null });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    };
    if (linkingState.active && linkingState.from) {
      document.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [linkingState.active, linkingState.from]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && linkingState.active) {
        setLinkingState({ active: false, from: null });
        toast({ title: "Linking cancelled" });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [linkingState.active, toast]);

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
    setConnections((prev) => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setEditorOpen(false);
    setSelectedNode(null);
    toast({ title: "Node deleted", variant: "destructive" });
  };

  const handleToggleLinking = () => {
    setLinkingState(prev => {
      const isActive = !prev.active;
      if (isActive) {
        toast({ title: "Linking mode enabled", description: "Click a node to start a link." });
      } else {
        toast({ title: "Linking mode disabled" });
      }
      return { active: isActive, from: null };
    });
  };

  const handleNodeClick = (node: Node) => {
    if (linkingState.active) {
      if (!linkingState.from) {
        setLinkingState({ active: true, from: node.id });
        toast({ title: "Node selected", description: `Select a second node to link to "${node.title}".` });
      } else {
        if (linkingState.from === node.id) return;

        const existingConnection = connections.find(c =>
          (c.from === linkingState.from && c.to === node.id) ||
          (c.from === node.id && c.to === linkingState.from)
        );

        if (existingConnection) {
          setConnections(prev => prev.filter(c => c.id !== existingConnection.id));
          toast({ title: "Link removed" });
        } else {
          const newConnection: Connection = {
            id: crypto.randomUUID(),
            from: linkingState.from,
            to: node.id,
          };
          setConnections(prev => [...prev, newConnection]);
          toast({ title: "Link created!" });
        }
        setLinkingState({ active: false, from: null });
      }
    } else {
      setSelectedNode(node);
      setEditorOpen(true);
    }
  };

  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position: newPosition } : n));
  }, []);

  const handleSaveMap = () => {
    setIsSaving(true);
    updateMap({ id: map.id, nodes, connections })
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
        <Button onClick={handleToggleLinking} variant={linkingState.active ? "secondary" : "outline"}>
          {linkingState.active ? <Link2Off className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
          {linkingState.active ? "Cancel Linking" : "Link Nodes"}
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
        <MapConnections
          nodes={nodes}
          connections={connections}
          linkingState={linkingState}
          mousePosition={mousePosition}
        />
        {nodes.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            onDrag={handleNodeDrag}
            isLinkingFrom={linkingState.from === node.id}
            isLinkingActive={linkingState.active}
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
