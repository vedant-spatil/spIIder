'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function Home() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setIsConnecting(true);
    setError(null);
    
    console.log('Attempting to connect in the background...');
    fetch('http://localhost:8000/setup-browser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://www.google.com' }),
    }).catch((error) => {
      console.error('Background browser setup failed:', error);
    });

    setTimeout(() => {
      setIsConnecting(false);
      router.push('/rover');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <SpotlightCard className="w-full max-w-3xl mx-auto p-8 md:p-12">
        <div className="space-y-12">
          {/* Title Section */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#fafae8] tracking-tight">
              Sp//der
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400">
              Your AI Co-pilot for Web Navigation
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center">
              <h3 className="text-lg font-semibold text-[#fafae8]/90">Smart Search</h3>
              <p className="text-zinc-400">Intelligent web navigation and information retrieval</p>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-lg font-semibold text-[#fafae8]/90">AI Powered</h3>
              <p className="text-zinc-400">Advanced language models guide the navigation</p>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-lg font-semibold text-[#fafae8]/90">Real-time</h3>
              <p className="text-zinc-400">Live browser interaction and instant responses</p>
            </div>
          </div>

          {/* Connect Button */}
          <div className="pt-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-8 py-4 bg-[#fafae8] hover:bg-[#fafae8]/90 rounded-full 
                       text-zinc-950 font-medium transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-zinc-800"
            >
              {isConnecting ? 'Connecting...' : 'Connect to Browser'}
            </button>
            {error && (
              <p className="mt-4 text-red-400 text-center">{error}</p>
            )}
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}