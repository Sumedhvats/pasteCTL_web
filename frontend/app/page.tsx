'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send, Code, Clock, Lightbulb, X, Terminal, Download } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { Header } from '@/components/header';
import { toast } from 'sonner';

const LANGUAGES = [
  { value: 'plain', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];

const EXPIRY_OPTIONS = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: 'never', label: 'Never' },
];

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plain');
  const [expiry, setExpiry] = useState('24h');
  const [isCreating, setIsCreating] = useState(false);
  const [showCliPopup, setShowCliPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const router = useRouter();

  // CLI popup timer
  useEffect(() => {
    if (!hasShownPopup) {
      const timer = setTimeout(() => {
        setShowCliPopup(true);
        setHasShownPopup(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [hasShownPopup]);

  const handleCreatePaste = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setIsCreating(true);

    try {
      // Compute expiry for frontend display and backend
      const expireAt = expiry === 'never' ? null : getExpiryDate(expiry);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          language,
          expire: expiry, // optional: send original expiry to backend
        }),
      });

      if (!response.ok) throw new Error('Failed to create paste');

      const paste = await response.json();

      // Set expire_at locally if backend doesn't send it
      if (!paste.expire_at && expireAt) paste.expire_at = expireAt;

      toast.success('Paste created successfully!');
      router.push(`/paste/${paste.id}`);
    } catch (error) {
      toast.error('Failed to create paste');
      console.error('Error creating paste:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getExpiryDate = (expiry: string): string => {
    const now = new Date();
    let expireTime = now.getTime(); // milliseconds

    switch (expiry) {
      case '1h':
        expireTime += 1 * 60 * 60 * 1000;
        break;
      case '24h':
        expireTime += 24 * 60 * 60 * 1000;
        break;
      case '7d':
        expireTime += 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        return '';
    }

    return new Date(expireTime).toISOString();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCreatePaste();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, language, expiry]);

  // CLI Popup Component
  const CliPopup = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-600 max-w-md w-full shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Try pasteCTL CLI</h3>
            </div>
            <button
              onClick={() => setShowCliPopup(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            Create and share pastes directly from your terminal! Our CLI tool makes it easy to share code without leaving your workflow.
          </p>
          
          <div className="bg-slate-900 rounded-lg p-3 mb-4 border border-slate-600">
            <code className="text-emerald-400 text-sm">pasteCTL create -f ./main.go</code>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => window.open('https://github.com/Sumedhvats/pasteCTL', '_blank')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Get CLI
            </Button>
            <Button
              onClick={() => setShowCliPopup(false)}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Paste</h1>
          <p className="text-slate-400">Share code snippets with syntax highlighting and custom expiry.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <CodeEditor
              value={content}
              onChange={setContent}
              language={language}
              placeholder="Paste your code here..."
              height="500px"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Language Selection */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Language</h3>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {LANGUAGES.map((lang) => (
                      <SelectItem 
                        key={lang.value} 
                        value={lang.value}
                        className="text-white hover:bg-slate-600"
                      >
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Expiry Selection */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Expiry</h3>
                </div>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {EXPIRY_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-slate-600"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              onClick={handleCreatePaste}
              disabled={isCreating || !content.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              {isCreating ? 'Creating...' : 'Create Paste'}
            </Button>

            {/* Tips */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-semibold text-white">Tips</h3>
                </div>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>• Choose the right language for syntax highlighting.</li>
                  <li>• Use expiry dates for sensitive content.</li>
                  <li>• You can use Ctrl+Enter to create paste.</li>
                  <li>• Try our <a href="https://github.com/Sumedhvats/pasteCTL" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">CLI tool</a> for terminal usage.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* CLI Popup */}
      {showCliPopup && <CliPopup />}
    </div>
  );
}