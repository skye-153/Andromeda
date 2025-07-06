import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'; // Correct import for Node.js environment
import path from 'path';
import { MapData } from '@/lib/types'; // Assuming MapData is defined here

// Define the structure of your database
interface Data {
  maps: MapData[];
}

const defaultData: Data = { maps: [] };

// Determine the path for the database file
// In a real Electron app, you'd use app.getPath('userData') for persistent storage
const dbFilePath = path.join(process.cwd(), 'data', 'db.json');

// Configure lowdb to use a JSON file
const adapter = new JSONFile<Data>(dbFilePath);
const db = new Low<Data>(adapter, defaultData);

// Function to initialize the database
export async function initializeLowDb() {
  await db.read();
  // If the database file is empty or doesn't exist, write default data
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = defaultData;
    await db.write();
  }
  console.log(`LowDB initialized. Data file: ${dbFilePath}`);
}

// Export the db instance for use in other services
export default db;