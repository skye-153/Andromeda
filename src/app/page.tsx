import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Starfield from '@/components/landing/starfield';

export default function LandingPage() {
  return (
    <div className="bg-background">
      <Starfield />
      <main className="flex h-screen flex-col items-center justify-center isolate">
        <div className="relative text-center">
          <h1 className="font-headline text-7xl md:text-9xl font-bold text-white animate-fade-in-down select-none">
            ANDROMEDA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up [animation-delay:250ms]">Your Cosmic Canvas for Ideas</p>
        </div>
        <div className="mt-8 animate-fade-in-up [animation-delay:500ms]">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 py-6 text-lg font-semibold">
            <Link href="/home">Enter The Void</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
