import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { MapData } from '@/lib/types';
import { promises as fs } from 'fs';
import { invoke } from '@tauri-apps/api/core'; // Import invoke
import * as path from '@tauri-apps/api/path'; // Import path from tauri-apps/api
import * as nodePath from 'path'; // Import Node.js path module

interface Data {
  maps: MapData[];
}

const defaultData: Data = { maps: [] };

// Function to get the data directory path using Tauri's API
async function getAppDataDirPath(): Promise<string> {
  if (typeof window !== 'undefined' && window.__TAURI__) {
    // Use Tauri's appDataDir for persistent storage
    return await path.appDataDir();
  } else {
    // Fallback for development outside Tauri (e.g., web browser)
    // This will create 'data' in the project root during web development
    return nodePath.join(process.cwd(), 'data');
  }
}

export async function initializeLowDb(): Promise<Low<Data>> {
  const dataDirPath = await getAppDataDirPath();
  const dbFilePath = path.join(dataDirPath, 'db.json');

  // Ensure the data directory exists
  await fs.mkdir(dataDirPath, { recursive: true });

  const adapter = new JSONFile<Data>(await dbFilePath);
  const db = new Low<Data>(adapter, defaultData);

  await db.read();
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = defaultData;
    await db.write();
  }
  console.log(`LowDB initialized. Data file: ${dbFilePath}`);
  return db;
}
 