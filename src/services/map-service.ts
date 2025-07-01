'use server';

import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { MapData, Node } from '@/lib/types';

async function getDb() {
    const client = await clientPromise;
    return client.db();
}

async function getMapsCollection() {
    const db = await getDb();
    return db.collection<Omit<MapData, 'id'>>('maps');
}

export async function getMaps() {
    const collection = await getMapsCollection();
    const maps = await collection.find({}, { projection: { name: 1 } }).sort({ _id: -1 }).toArray();
    
    return maps.map(map => ({
        id: map._id.toString(),
        name: map.name,
    })) as { id: string, name: string }[];
}

export async function createMap(name: string) {
    const collection = await getMapsCollection();
    const newMap = {
        name,
        nodes: [],
    };
    const result = await collection.insertOne(newMap);
    return {
        id: result.insertedId.toString(),
        name,
    };
}

export async function getMap(id: string): Promise<MapData | null> {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    const collection = await getMapsCollection();
    const map = await collection.findOne({ _id: new ObjectId(id) });
    if (!map) {
        return null;
    }
    const { _id, name, nodes } = map;
    return {
        id: _id.toString(),
        name,
        nodes: nodes || []
    };
}

export async function updateMap({ id, nodes }: { id: string, nodes: Node[] }) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid map ID');
    }
    const collection = await getMapsCollection();
    await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { nodes } }
    );
}

export async function deleteMap(id: string) {
    if (!ObjectId.isValid(id)) {
        throw new Error('Invalid map ID');
    }
    const collection = await getMapsCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });
}
