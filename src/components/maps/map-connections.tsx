'use client';

import React from 'react';
import { type Node, type Connection } from '@/lib/types';

interface MapConnectionsProps {
    nodes: Node[];
    connections: Connection[];
    linkingState: { active: boolean; from: string | null };
    mousePosition: { x: number; y: number } | null;
    scale: number;
    translateX: number;
    translateY: number;
}

const NODE_WIDTH = 256;
const NODE_HEIGHT = 56; // Approximated from MapNode styling

export function MapConnections({ nodes, connections, linkingState, mousePosition, scale, translateX, translateY }: MapConnectionsProps) {
    const getNodeById = (id: string | null): Node | undefined => nodes.find(n => n.id === id);

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            {connections.map(conn => {
                const fromNode = getNodeById(conn.from);
                const toNode =getNodeById(conn.to);
                if (!fromNode || !toNode) return null;

                const p1 = { x: fromNode.position.x + NODE_WIDTH / 2, y: fromNode.position.y + NODE_HEIGHT / 2 };
                const p2 = { x: toNode.position.x + NODE_WIDTH / 2, y: toNode.position.y + NODE_HEIGHT / 2 };

                return <line key={conn.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-primary/50" strokeWidth="2" />;
            })}
            {linkingState.active && linkingState.from && mousePosition && (
                (() => {
                    const fromNode = getNodeById(linkingState.from);
                    if (!fromNode) return null;
                    const p1 = { x: fromNode.position.x + NODE_WIDTH / 2, y: fromNode.position.y + NODE_HEIGHT / 2 };
                    return (
                        <line
                            x1={p1.x}
                            y1={p1.y}
                            x2={mousePosition.x}
                            y2={mousePosition.y}
                            className="stroke-accent"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                        />
                    );
                })()
            )}
        </svg>
    );
}


