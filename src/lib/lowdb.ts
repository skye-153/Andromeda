import { Low } from 'lowdb';
import { MapData } from '@/lib/types';
import { invoke } from '@tauri-apps/api/core';

interface Data {
  maps: MapData[];
}

const defaultData: Data = { maps: [], tasks: [] };

export async function initializeLowDb(): Promise<Low<Data>> {
  const appCacheDir = await invoke('get_app_cache_dir_command');
  const dbFilePath = `${appCacheDir}/andromeda.json`;

  // The adapter logic will be handled by the Rust backend.
  // This function will now just return a placeholder.
  // The actual data will be fetched and managed through Tauri commands.

  // @ts-ignore
  const db: Low<Data> = {
    data: defaultData,
    read: async () => {},
    write: async () => {},
  };

  return db;
}
 