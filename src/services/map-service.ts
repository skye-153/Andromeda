'use server';

import { MapData, Node, Connection } from '@/lib/types';

// In-memory store for maps, seeded with some initial data for testing.
let maps: MapData[] = [
    {
        id: '1',
        name: 'My First Map',
        nodes: [
            { id: 'node-1', title: 'Welcome!', description: 'This is your first node.', position: { x: 100, y: 100 }, links: [], files: [], isDone: false },
            { id: 'node-2', title: 'Get Started', description: 'Add more nodes to build your map.', position: { x: 400, y: 250 }, links: [], files: [], isDone: true },
        ],
        connections: [
            { id: 'conn-1', from: 'node-1', to: 'node-2' }
        ]
    }
];

export async function getMaps(): Promise<{ id: string, name: string }[]> {
    // Return a list of map names and IDs from the in-memory store.
    return Promise.resolve(maps.map(map => ({ id: map.id, name: map.name })));
}

export async function createMap(name: string): Promise<{ id: string, name: string }> {
    // Create a new map and add it to the in-memory store.
    const newMap: MapData = {
        id: crypto.randomUUID(),
        name,
        nodes: [],
        connections: [],
    };
    maps.push(newMap);
    return Promise.resolve({ id: newMap.id, name: newMap.name });
}

export async function getMap(id: string): Promise<MapData | null> {
    // Find and return a single map by its ID from the in-memory store.
    const map = maps.find(m => m.id === id);
    if (map && !map.connections) {
        map.connections = [];
    }
    return Promise.resolve(map || null);
}

export async function updateMap({ id, nodes, connections }: { id: string, nodes: Node[], connections: Connection[] }): Promise<void> {
    // Update the nodes and connections for a specific map in the in-memory store.
    const mapIndex = maps.findIndex(m => m.id === id);
    if (mapIndex !== -1) {
        maps[mapIndex].nodes = nodes;
        maps[mapIndex].connections = connections;
    } else {
        // In a real app, you might want more robust error handling.
        console.error(`Map with id ${id} not found.`);
    }
    return Promise.resolve();
}

export async function deleteMap(id: string): Promise<void> {
    // Remove a map from the in-memory store.
    maps = maps.filter(m => m.id !== id);
    return Promise.resolve();
}
