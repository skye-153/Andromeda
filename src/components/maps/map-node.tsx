'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { type Node } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MapNodeProps {
    node: Node;
    onClick: (node: Node) => void;
    onDrag: (nodeId: string, position: { x: number, y: number }) => void;
    isLinkingFrom?: boolean;
    isLinkingActive?: boolean;
}

export const MapNode = ({ node, onClick, onDrag, isLinkingFrom = false, isLinkingActive = false }: MapNodeProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = React.useRef({ x: 0, y: 0 });
    const nodeStartPos = React.useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        nodeStartPos.current = { x: node.position.x, y: node.position.y };
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        onDrag(node.id, {
            x: nodeStartPos.current.x + dx,
            y: nodeStartPos.current.y + dy,
        });
    }, [isDragging, node.id, onDrag]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;
            if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                onClick(node);
            }
        }
        setIsDragging(false);
    }, [isDragging, node, onClick]);
    
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    const cursorStyle = isDragging ? 'grabbing' : (isLinkingActive ? 'crosshair' : 'grab');

    return (
        <div
            className={cn(
                "absolute transition-shadow duration-200 rounded-lg",
                isDragging ? 'shadow-2xl scale-105 z-40' : 'z-10',
                isLinkingFrom && 'ring-2 ring-accent ring-offset-2 ring-offset-background'
            )}
            style={{ left: node.position.x, top: node.position.y, cursor: cursorStyle }}
            onMouseDown={handleMouseDown}
        >
            <Card className={cn(
                "w-64 bg-card shadow-lg border-2 border-primary/50 hover:border-primary transition-colors duration-200",
                isLinkingFrom && "border-accent"
            )}>
                <CardHeader className="p-4">
                    <CardTitle className="text-base truncate">{node.title}</CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
};
