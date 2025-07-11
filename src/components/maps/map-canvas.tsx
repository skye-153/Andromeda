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

const MAP_WIDTH = 1630;
const MAP_HEIGHT = 830;
const NODE_WIDTH = 256;
const NODE_HEIGHT = 56;
const MAX_SCALE = 4;

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

  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 });
  const [minScale, setMinScale] = useState(0.1);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const clampView = useCallback((v: { scale: number, tx: number, ty: number }) => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return v;
    const { offsetWidth: canvasWidth, offsetHeight: canvasHeight } = canvasEl;
    const { scale, tx, ty } = v;

    let newTx = tx;
    let newTy = ty;

    // Clamp X translation
    const mapScaledWidth = MAP_WIDTH * scale;
    if (mapScaledWidth < canvasWidth) { // Map is smaller than canvas, center it
      newTx = (canvasWidth - mapScaledWidth) / 2;
    } else { // Map is larger than canvas, clamp to edges
      newTx = Math.max(canvasWidth - mapScaledWidth, Math.min(newTx, 0));
    }

    // Clamp Y translation
    const mapScaledHeight = MAP_HEIGHT * scale;
    if (mapScaledHeight < canvasHeight) { // Map is smaller than canvas, center it
      newTy = (canvasHeight - mapScaledHeight) / 2;
    } else { // Map is larger than canvas, clamp to edges
      newTy = Math.max(canvasHeight - mapScaledHeight, Math.min(newTy, 0));
    }

    return {
      scale,
      tx: newTx,
      ty: newTy,
    };
  }, []);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;

      const newMinScale = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT);
      setMinScale(newMinScale);

      setView(currentView => {
        let newScale = currentView.scale;
        // If the current scale is larger than what would fit, scale down to fit.
        // Otherwise, keep the current scale (user might have zoomed in).
        if (currentView.scale > newMinScale) {
          newScale = newMinScale;
        }

        // Calculate new tx and ty based on the potentially adjusted newScale
        // and then clamp them.
        const newTx = (width - MAP_WIDTH * newScale) / 2;
        const newTy = (height - MAP_HEIGHT * newScale) / 2;

        return clampView({ scale: newScale, tx: newTx, ty: newTy });
      });
    });

    observer.observe(canvasEl);
    return () => observer.disconnect();
  }, [clampView]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setView(currentView => {
      const newScale = e.deltaY < 0
        ? Math.min(currentView.scale * 1.1, MAX_SCALE)
        : Math.max(currentView.scale / 1.1, minScale);

      if (Math.abs(newScale - currentView.scale) < 0.001) return currentView;

      const mouseMapX = (mouseX - currentView.tx) / currentView.scale;
      const mouseMapY = (mouseY - currentView.ty) / currentView.scale;
      const newTx = mouseX - mouseMapX * newScale;
      const newTy = mouseY - mouseMapY * newScale;

      return clampView({ scale: newScale, tx: newTx, ty: newTy });
    });
  }, [minScale, clampView]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvasEl.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX - view.tx, y: e.clientY - view.ty };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (linkingState.active && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePosition({ x: (e.clientX - rect.left - view.tx) / view.scale, y: (e.clientY - rect.top - view.ty) / view.scale });
    }
    if (isDragging.current) {
      e.preventDefault();
      const newTx = e.clientX - dragStart.current.x;
      const newTy = e.clientY - dragStart.current.y;
      setView(v => clampView({ ...v, tx: newTx, ty: newTy }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      isDragging.current = false;
    }
  };

  const addNode = () => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const { offsetWidth: canvasWidth, offsetHeight: canvasHeight } = canvasEl;

    // Calculate center of the visible canvas area, accounting for pan and zoom
    const centerX = (canvasWidth / 2 - view.tx) / view.scale;
    const centerY = (canvasHeight / 2 - view.ty) / view.scale;

    // Determine the bounds for new node placement
    let boundedX = MAP_WIDTH;
    let boundedY = MAP_HEIGHT;

    // If zoomed out to minScale, allow placement within the visible canvas area
    if (view.scale <= minScale) {
      boundedX = canvasWidth / view.scale;
      boundedY = canvasHeight / view.scale;
    }

    const newNode: Node = {
      id: crypto.randomUUID(),
      position: {
        x: Math.max(0, Math.min(centerX - NODE_WIDTH / 2, boundedX - NODE_WIDTH)),
        y: Math.max(0, Math.min(centerY - NODE_HEIGHT / 2, boundedY - NODE_HEIGHT))
      },
      title: 'New Node', description: '', links: [], files: [], isDone: false, size: "100%", color: "#ffffff",
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNode(newNode);
    setEditorOpen(true);
  };

  const updateNode = (updatedNode: Node) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    if (selectedNode?.id === updatedNode.id) setSelectedNode(updatedNode);
    toast({ title: "Node updated", description: `"${updatedNode.title}" has been saved.` });
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setEditorOpen(false); setSelectedNode(null);
    toast({ title: "Node deleted", variant: "destructive" });
  };

  const handleNodeClick = (node: Node) => {
    if (linkingState.active) {
      if (!linkingState.from) {
        setLinkingState({ ...linkingState, from: node.id });
      } else {
        if (linkingState.from === node.id) {
          setLinkingState({ active: true, from: null }); return;
        }
        const existing = connections.find(c => (c.from === linkingState.from && c.to === node.id) || (c.from === node.id && c.to === linkingState.from));
        if (existing) {
          setConnections(prev => prev.filter(c => c.id !== existing.id));
          toast({ title: "Link removed" });
        } else {
          setConnections(prev => [...prev, { id: crypto.randomUUID(), from: linkingState.from!, to: node.id }]);
          toast({ title: "Nodes linked!" });
        }
        setLinkingState({ active: true, from: null });
      }
    } else {
      setSelectedNode(node); setEditorOpen(true);
    }
  };

  const handleNodeDrag = useCallback((nodeId: string, newPosition: { x: number; y: number }, nodeWidth: number, nodeHeight: number) => {
    const constrainedX = Math.max(0, Math.min(newPosition.x, MAP_WIDTH - nodeWidth));
    const constrainedY = Math.max(0, Math.min(newPosition.y, MAP_HEIGHT - nodeHeight));
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, position: { x: constrainedX, y: constrainedY } } : n));
  }, []);

  const handleSaveMap = () => {
    setIsSaving(true);
    updateMap({ id: map.id, nodes, connections })
      .then(() => toast({ title: "Map Saved!", description: `Your map \"${map.name}\" has been saved successfully.` }))
      .catch(() => toast({ title: 'Error saving map', description: 'Could not save the map. Please try again.', variant: 'destructive' }))
      .finally(() => setIsSaving(false));
  };

  const toggleLinkingMode = () => setLinkingState(prev => ({ active: !prev.active, from: null }));

  const zoomWithCenter = (newScaleTarget: number) => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const { offsetWidth: canvasWidth, offsetHeight: canvasHeight } = canvasEl;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    setView(v => {
      const newScale = Math.max(Math.min(newScaleTarget, MAX_SCALE), minScale);
      const mouseMapX = (centerX - v.tx) / v.scale;
      const mouseMapY = (centerY - v.ty) / v.scale;
      const newTx = centerX - mouseMapX * newScale;
      const newTy = centerY - mouseMapY * newScale;
      return clampView({ scale: newScale, tx: newTx, ty: newTy });
    });
  };

  const zoomIn = () => zoomWithCenter(view.scale * 1.2);
  const zoomOut = () => zoomWithCenter(view.scale / 1.2);

  return (
    <div className="w-full h-full flex-1 flex flex-col relative bg-background border rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button onClick={addNode}><Plus className="mr-2 h-4 w-4" /> Add Node</Button>
        <Button variant={linkingState.active ? "secondary" : "outline"} onClick={toggleLinkingMode}>
          <LinkIcon className="mr-2 h-4 w-4" />
          {linkingState.active ? (linkingState.from ? 'Select node...' : 'Cancel') : 'Link Nodes'}
        </Button>
        <Button variant="outline" onClick={handleSaveMap} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" /> }
          {isSaving ? 'Saving...' : 'Save Map'}
        </Button>
      </div>
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={zoomIn}><ZoomIn className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={zoomOut}><ZoomOut className="h-4 w-4" /></Button>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="origin-top-left"
          style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          <MapConnections nodes={nodes} connections={connections} linkingState={linkingState} mousePosition={mousePosition} scale={view.scale} />
          {nodes.map((node) => (
            <MapNode
              key={node.id}
              node={node}
              onClick={handleNodeClick}
              onDrag={handleNodeDrag}
              isLinking={linkingState.active}
              scale={view.scale}
            />
          ))}
        </div>
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