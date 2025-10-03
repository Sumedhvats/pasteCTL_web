'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard as Edit, Copy, Eye, Calendar, Clock, Plus } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { Header } from '@/components/header';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Paste {
  id: string;
  content: string;
  language: string;
  created_at: string;
  expire_at?: string;
  views: number;
}

export default function PastePage() {
  const params = useParams();
  const router = useRouter();
  const pasteId = params.id as string;

  const [paste, setPaste] = useState<Paste | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentContentRef = useRef<string>('');
  const hasIncrementedViews = useRef(false);

  // Fetch paste from backend
  const fetchPaste = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${pasteId}`);
      if (!response.ok) {
        if (response.status === 404) setError('Paste not found');
        else setError('Failed to load paste');
        return;
      }

      const pasteData = await response.json();
      setPaste(pasteData);
      setEditedContent(pasteData.content);

      if (!hasIncrementedViews.current) {
        hasIncrementedViews.current = true;
        await incrementViews();
      }
      setError(null);
    } catch (err) {
      setError('Failed to load paste');
      console.error('Error fetching paste:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pasteId]);

  // Increment views
  const incrementViews = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${pasteId}/view`, {
        method: 'PUT',
      });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  // Initialize always-connected WebSocket
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/api/ws/${pasteId}`);

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'content_update' && data.content !== lastSentContentRef.current) {
          setEditedContent(data.content);
          setPaste(prev => prev ? { ...prev, content: data.content } : null);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => console.error('WebSocket error:', err);

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting in 2s...');
      setTimeout(() => initializeWebSocket(), 2000);
    };

    wsRef.current = ws;
  }, [pasteId]);

  // Debounced auto-save + WebSocket update
  const sendContentUpdate = useCallback((content: string) => {
    if (content === lastSentContentRef.current) return;

    lastSentContentRef.current = content;

    // WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'content_update', content }));
    }

    // Debounced backend save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${pasteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        console.log('Auto-saved paste to backend');
      } catch (err) {
        console.error('Error auto-saving paste:', err);
      }
    }, 1000);
  }, [pasteId]);

  // Handle editor change
  const handleContentChange = useCallback((value: string) => {
    setEditedContent(value);
    sendContentUpdate(value);
  }, [sendContentUpdate]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // View raw paste
  const viewRaw = () => {
    window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${pasteId}/raw`, '_blank');
  };

  // Create new paste
  const createNewPaste = () => router.push('/');

  // Format expiry
  const formatExpiry = (expireAt?: string) => {
    if (!expireAt) return 'Never expires';
    const date = new Date(expireAt);
    if (isNaN(date.getTime())) return 'Never expires';
    return format(date, 'MMM dd, yyyy, hh:mm a');
  };

  // Initialize everything on mount
  useEffect(() => {
    fetchPaste();
    initializeWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchPaste, initializeWebSocket]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-slate-400">Loading paste...</div>
        </div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-red-400 text-xl mb-4">{error || 'Paste not found'}</div>
          <Button onClick={createNewPaste} className="bg-emerald-600 hover:bg-emerald-700">
            Create New Paste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paste #{paste.id}</h1>
          <div className="flex items-center gap-3">
            <Button onClick={copyToClipboard} variant="secondary" className="bg-slate-700 hover:bg-slate-600 text-white">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button onClick={viewRaw} variant="secondary" className="bg-slate-700 hover:bg-slate-600 text-white">
              Raw
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CodeEditor
              value={editedContent}
              onChange={handleContentChange}
              language={paste.language}
              readOnly={false}
              height="500px"
            />
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Paste Info</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Language</div>
                    <Badge variant="secondary" className="bg-slate-700 text-white">{paste.language}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                      <Eye className="w-3 h-3" /> Views
                    </div>
                    <div className="text-white font-semibold">{paste.views}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Created
                    </div>
                    <div className="text-sm text-white">{format(new Date(paste.created_at), 'MMM dd, yyyy, hh:mm a')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Expires
                    </div>
                    <div className="text-sm text-white">{formatExpiry(paste.expire_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Quick Navigate</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter paste ID"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value) router.push(`/paste/${value}`);
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector<HTMLInputElement>('input[placeholder="Enter paste ID"]');
                      const value = input?.value.trim();
                      if (value) router.push(`/paste/${value}`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                  >
                    Go
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="font-semibold text-white mb-4">Actions</h3>
                <Button onClick={createNewPaste} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> New paste
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400">Live editing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}