'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Terminal, Github } from 'lucide-react';

export function Header() {
  const router = useRouter();

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/')}
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-white">pasteCTL</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Paste
          </Button>
          
          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Terminal className="w-4 h-4 mr-2" />
            pasteCTL
          </Button>
          
          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => window.open('https://github.com/Sumedhvats/pasteFE', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </div>
    </header>
  );
}