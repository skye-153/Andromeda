import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Plus } from "lucide-react";
import Link from "next/link";


export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Cosmic Canvas</h1>
        <p className="mt-2 text-muted-foreground">Your journey into the cosmos of creativity begins here. What will you create today?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Start a New Map</CardTitle>
                <CardDescription>Begin charting a new galaxy of ideas with a blank canvas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                <Link href="/maps" className="flex flex-col items-center gap-2 text-accent hover:text-accent/90 transition-colors">
                    <Plus className="h-16 w-16" />
                    <span className="font-semibold">Create Map</span>
                </Link>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Explore Your Maps</CardTitle>
                <CardDescription>Revisit your existing creations and continue your cosmic exploration.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center">
                 <Link href="/maps" className="flex flex-col items-center gap-2 text-primary hover:text-primary/90 transition-colors">
                    <Map className="h-16 w-16" />
                    <span className="font-semibold">View Maps</span>
                </Link>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
