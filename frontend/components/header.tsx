'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Terminal, Github, Search } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  const router = useRouter();
  const [pasteId, setPasteId] = useState('');
  
  const handleNavigate = () => {
    const trimmedId = pasteId.trim();
    if (trimmedId) {
      router.push(`/paste/${trimmedId}`);
      setPasteId('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };
  
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/')}
        >
          <img 
            src="/favicon.svg" 
            alt="pasteCTL logo" 
            className="w-20 h-20"
          />
          <span className="text-xl font-bold text-white">pasteCTL</span>
        </div>
        
        {/* Quick Navigate */}
        <div className="flex items-center gap-2 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={pasteId}
              onChange={(e) => setPasteId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Go to paste ID..."
              className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleNavigate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go
          </Button>
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
            onClick={() => window.open('https://github.com/Sumedhvats/pasteCTL_cli', '_blank')}
          >
            <Terminal className="w-4 h-4 mr-2" />
            pasteCTL CLI
          </Button>
          
          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => window.open('https://github.com/Sumedhvats/pasteCTL', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </div>
    </header>
  );
}