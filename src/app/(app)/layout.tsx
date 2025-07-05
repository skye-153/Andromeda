"use client";
import React, { Suspense } from 'react';
import { Home, Map, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
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
import { HeaderTitle } from '@/components/header-title';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <Link href="/home" className="flex items-center gap-3">
                 <BrainCircuit className="w-8 h-8 text-primary"/>
                <span className="text-xl font-semibold">Andromeda</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Home', side: 'right'}}>
                <Link href="/home">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{children: 'Maps', side: 'right'}}>
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
          <Suspense fallback={null}>
            <HeaderTitle />
          </Suspense>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
