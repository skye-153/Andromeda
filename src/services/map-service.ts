

import { MapData, Node, Connection } from '@/lib/types';
import { invoke } from '@tauri-apps/api/core';

export async function getMaps(): Promise<{ id: string; name: string }[]> {
    return await invoke('get_maps');
}

export async function createMap(name: string): Promise<{ id: string; name: string }> {
    return await invoke('create_map', { name });
}

export async function getMap(id: string): Promise<MapData | null> {
    return await invoke('get_map', { id });
}

export async function updateMap({ id, nodes, connections }: { id: string; nodes: Node[]; connections: Connection[] }): Promise<void> {
    return await invoke('update_map', { id, nodes, connections });
}

export async function deleteMap(id: string): Promise<void> {
    return await invoke('delete_map', { id });
}

export async function renameMap(id: string, newName: string): Promise<MapData | null> {
    return await invoke('rename_map', { id, newName });
}
