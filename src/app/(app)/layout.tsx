"use client";
import React from 'react';
import { Home, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
} from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <Link href="/home" className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent"><path d="m12 3-1.9 4.3-4.4.6 3.2 2.8-.8 4.3 3.9-2.3 3.9 2.3-.8-4.3 3.2-2.8-4.4-.6Z"/><path d="m12 3-1.9 4.3-4.4.6 3.2 2.8-.8 4.3 3.9-2.3 3.9 2.3-.8-4.3 3.2-2.8-4.4-.6Z"/><path d="M5 12.5c0 .6.4 1.1 1 1.5l3.5 2L8 20l4-2.3 4 2.3-1.5-3.5 3.5-2c.6-.4 1-.9 1-1.5s-.4-1.1-1-1.5L12 9l-7 1.5c-.6.1-1 .6-1 1.3Z"/></svg>
                <span className="text-xl font-semibold">Cosmic Canvas</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/home'} tooltip={{children: 'Home', side: 'right'}}>
                <Link href="/home">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/maps')} tooltip={{children: 'Maps', side: 'right'}}>
                <Link href="/maps">
                  <Map />
                  <span>Maps</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 border-b flex items-center gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-20">
          <SidebarTrigger />
          <h2 className="text-xl font-semibold capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Home'}
          </h2>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
