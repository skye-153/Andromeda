"use client";

import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export function HeaderTitle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getTitle = () => {
    if (pathname.startsWith('/maps/') && pathname.split('/').length > 2) {
      const mapName = searchParams.get('name');
      if (mapName) {
        return decodeURIComponent(mapName);
      }
      return 'Map';
    }
    return pathname.split('/').pop()?.replace('-', ' ') || 'Home';
  };

  return (
    <h2 className="text-xl font-semibold capitalize">
      {getTitle()}
    </h2>
  );
}
