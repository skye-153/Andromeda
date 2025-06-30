'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateMapDialog } from '@/components/maps/create-map-dialog';

interface Map {
  id: string;
  name: string;
}

export default function MapsPage() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateMap = (name: string) => {
    const newMap: Map = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name,
    };
    setMaps((prevMaps) => [...prevMaps, newMap]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Maps</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Map
        </Button>
      </div>

      <CreateMapDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateMap}
      />

      {maps.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          <h3 className="text-xl font-semibold mt-4">No maps yet</h3>
          <p className="text-muted-foreground mt-2">Click "Create Map" to start your first creation.</p>
           <Button onClick={() => setCreateDialogOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" /> Create Map
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Link href={`/maps/${map.id}?name=${encodeURIComponent(map.name)}`} key={map.id}>
              <Card className="hover:border-accent transition-colors h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{map.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">Click to open editor</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
