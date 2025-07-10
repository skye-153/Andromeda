'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type Node, type Connection, type MapData } from '@/lib/types';
import { updateMap } from '@/services/map-service';
import { MapNode } from './map-node';
import { NodeEditor } from './node-editor';
import { MapConnections } from './map-connections';
import { Plus, Save, Loader2, Link as LinkIcon, ZoomIn, ZoomOut } from 'lucide-react';

export function MapCanvas({ map }: { map: MapData }) {
  const [nodes, setNodes] = useState<Node[]>(map.nodes);
  const [connections, setConnections] = useState<Connection[]>(map.connections || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [linkingState, setLinkingState] = useState({ active: false, from: null as string | null });
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!linkingState.active) {
        setMousePosition(null);
    }
  }, [linkingState.active]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const scaleAmount = 0.1;
    const newScale = event.deltaY < 0 ? scale + scaleAmount : scale - scaleAmount;
    setScale(Math.max(0.1, Math.min(newScale, 4))); // Limit zoom between 0.1 and 4
  }, [scale]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (linkingState.active && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePosition({ x: (event.clientX - rect.left - translateX) / scale, y: (event.clientY - rect.top - translateY) / scale });
    }

    if (isDragging) {
      const dx = event.clientX - lastMousePos.current.x;
      const dy = event.clientY - lastMousePos.current.y;
      setTranslateX(prev => prev + dx);
      setTranslateY(prev => prev + dy);
      lastMousePos.current = { x: event.clientX, y: event.clientY };
    }
  }, [isDragging, linkingState.active, scale, translateX, translateY]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const addNode = () => {
    const canvasBounds = canvasRef.current?.getBoundingClientRect();
    if (!canvasBounds) return;

    // Calculate center of the visible canvas area, accounting for pan and zoom
    const centerX = (canvasBounds.width / 2 - translateX) / scale;
    const centerY = (canvasBounds.height / 2 - translateY) / scale;

    const newNode: Node = {
      id: crypto.randomUUID(),
      position: {
        x: centerX - 128 / 2, // Adjust for node width
        y: centerY - 50 / 2 // Adjust for node height
      },
      title: 'New Node',
      description: '',
      links: [],
      files: [],
      isDone: false,
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
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setEditorOpen(false);
    setSelectedNode(null);
    toast({ title: "Node deleted", variant: "destructive" });
  };

  const handleNodeClick = (node: Node) => {
    if (linkingState.active) {
        if (!linkingState.from) {
            setLinkingState({ ...linkingState, from: node.id });
        } else {
            if (linkingState.from === node.id) {
                setLinkingState({ active: true, from: null });
                return;
            }

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
                toast({ title: "Nodes linked!" });
            }
            setLinkingState({ active: true, from: null });
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

  const toggleLinkingMode = () => {
      setLinkingState(prev => ({ active: !prev.active, from: null }));
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden bg-dot-zinc-700/[0.4] border rounded-lg flex-1"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // End drag if mouse leaves canvas
    >
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Button onClick={addNode}>
          <Plus className="mr-2 h-4 w-4" /> Add Node
        </Button>
        <Button variant={linkingState.active ? "secondary" : "outline"} onClick={toggleLinkingMode}>
          <LinkIcon className="mr-2 h-4 w-4" />
          {linkingState.active ? (linkingState.from ? 'Select node...' : 'Cancel') : 'Link Nodes'}
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

      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="w-full h-full origin-top-left"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
        }}
      >
        <MapConnections nodes={nodes} connections={connections} linkingState={linkingState} mousePosition={mousePosition} scale={scale} translateX={translateX} translateY={translateY} />
        {nodes.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            onClick={handleNodeClick}
            onDrag={handleNodeDrag}
            isLinking={linkingState.active}
            scale={scale}
            translateX={translateX}
            translateY={translateY}
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

