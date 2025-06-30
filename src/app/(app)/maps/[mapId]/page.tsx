'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapCanvas } from '@/components/maps/map-canvas';

function MapEditorContent() {
    const searchParams = useSearchParams();
    const mapName = searchParams.get('name') || 'Untitled Map';

    return <MapCanvas mapName={mapName} />;
}

export default function MapEditorPage() {
    return (
        <div className="w-full h-[calc(100vh-120px)] flex flex-col">
            <Suspense fallback={<div>Loading...</div>}>
                <MapEditorContent />
            </Suspense>
        </div>
    );
}
