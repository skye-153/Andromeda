'use server';

import { MapData, Node, Connection, FileData } from '@/lib/types';
import db, { initializeLowDb } from '@/lib/lowdb';

// Initialize maps from file on server start
(async () => {
    await initializeLowDb();
    // If no maps exist, seed with initial data
    if (db.data.maps.length === 0) {
        console.log('No maps found, seeding initial data.');
        db.data.maps = [
            {
                id: '1',
                name: 'Getting Started',
                nodes: [
                    { id: 'node-1', title: 'Welcome to Idea Map!', description: 'This is your first node. You can edit it by clicking on it.', position: { x: 100, y: 100 }, links: [], files: [], isDone: false },
                    { id: 'node-2', title: 'Create Your Own Nodes', description: 'Add more nodes to build your map. Click "Add Node" to start.', position: { x: 400, y: 250 }, links: [], files: [], isDone: true },
                ],
                connections: [
                    { id: 'conn-1', from: 'node-1', to: 'node-2' }
                ]
            }
        ];
        await db.write();
    }
})();


export async function getMaps(): Promise<{ id: string, name: string }[]> {
    // Return a list of map names and IDs from the in-memory store.
    return Promise.resolve(db.data.maps.map(map => ({ id: map.id, name: map.name })));
}

export async function createMap(name: string): Promise<{ id: string, name: string }> {
    // Create a new map and add it to the in-memory store.
    const newMap: MapData = {
        id: crypto.randomUUID(),
        name,
        nodes: [],
        connections: [],
    };
    db.data.maps.push(newMap);
    await db.write(); // Persist changes
    return Promise.resolve({ id: newMap.id, name: newMap.name });
}

export async function getMap(id: string): Promise<MapData | null> {
    // Find and return a single map by its ID from the in-memory store.
    const map = db.data.maps.find(m => m.id === id);
    if (map && !map.connections) {
        map.connections = [];
    }
    return Promise.resolve(map || null);
}

export async function updateMap({ id, nodes, connections }: { id: string, nodes: Node[], connections: Connection[] }): Promise<void> {
    // Update the nodes and connections for a specific map in the in-memory store.
    const mapIndex = db.data.maps.findIndex(m => m.id === id);
    if (mapIndex !== -1) {
        db.data.maps[mapIndex].nodes = nodes;
        db.data.maps[mapIndex].connections = connections;
        await db.write(); // Persist changes
    } else {
        // In a real app, you might want more robust error handling.
        console.error(`Map with id ${id} not found.`);
    }
    return Promise.resolve();
}

export async function deleteMap(id: string): Promise<void> {
    // Remove a map from the in-memory store.
    db.data.maps = db.data.maps.filter(m => m.id !== id);
    await db.write(); // Persist changes
    return Promise.resolve();
}

export async function renameMap(id: string, newName: string): Promise<MapData | null> {
    // Find the map and update its name in the in-memory store.
    const mapIndex = db.data.maps.findIndex(m => m.id === id);
    if (mapIndex !== -1) {
        db.data.maps[mapIndex].name = newName;
        await db.write(); // Persist changes
        return Promise.resolve(db.data.maps[mapIndex]);
    }
    return Promise.resolve(null);
}
