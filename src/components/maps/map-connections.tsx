'use client';

import React from 'react';
import { type Node, type Connection } from '@/lib/types';

interface MapConnectionsProps {
    nodes: Node[];
    connections: Connection[];
    linkingState: { active: boolean; from: string | null };
    mousePosition: { x: number; y: number } | null;
    scale: number;
}

const getScaledDimensions = (size: string | undefined) => {
    const baseWidth = 256;
    const baseHeight = 56;
    let scaleFactor = 1;
    switch (size) {
        case "50%": scaleFactor = 0.5; break;
        case "75%": scaleFactor = 0.75; break;
        case "125%": scaleFactor = 1.25; break;
        case "150%": scaleFactor = 1.5; break;
        case "200%": scaleFactor = 2.0; break;
        default: scaleFactor = 1.0; break;
    }
    return { width: baseWidth * scaleFactor, height: baseHeight * scaleFactor };
};

export function MapConnections({ nodes, connections, linkingState, mousePosition, scale }: MapConnectionsProps) {
    const getNodeById = (id: string | null): Node | undefined => nodes.find(n => n.id === id);

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <g>
                {connections.map(conn => {
                    const fromNode = getNodeById(conn.from);
                    const toNode = getNodeById(conn.to);
                    if (!fromNode || !toNode) return null;

                    const { width: fromNodeWidth, height: fromNodeHeight } = getScaledDimensions(fromNode.size);
                    const { width: toNodeWidth, height: toNodeHeight } = getScaledDimensions(toNode.size);

                    const p1 = { x: fromNode.position.x + fromNodeWidth / 2, y: fromNode.position.y + fromNodeHeight / 2 };
                    const p2 = { x: toNode.position.x + toNodeWidth / 2, y: toNode.position.y + toNodeHeight / 2 };

                    return <line key={conn.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-primary/50" strokeWidth={2 / scale} />;
                })}
                {linkingState.active && linkingState.from && mousePosition && (
                    (() => {
                        const fromNode = getNodeById(linkingState.from);
                        if (!fromNode) return null;
                        const { width: fromNodeWidth, height: fromNodeHeight } = getScaledDimensions(fromNode.size);
                        const p1 = { x: fromNode.position.x + fromNodeWidth / 2, y: fromNode.position.y + fromNodeHeight / 2 };
                        return (
                            <line
                                x1={p1.x}
                                y1={p1.y}
                                x2={mousePosition.x}
                                y2={mousePosition.y}
                                className="stroke-accent"
                                strokeWidth={2 / scale}
                                strokeDasharray={`${5 / scale},${5 / scale}`}
                            />
                        );
                    })()
                )}
            </g>
        </svg>
    );
}