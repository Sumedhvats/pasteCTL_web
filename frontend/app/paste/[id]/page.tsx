'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard as Edit, Copy, Eye, Calendar, Clock, Plus, Download, QrCode, Share2, Code2, X, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState('400');

  const wsRef = useRef<WebSocket | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentContentRef = useRef<string>('');
  const hasIncrementedViews = useRef(false);
  const pasteRef = useRef<Paste | null>(null);

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
      pasteRef.current = pasteData;
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
          body: JSON.stringify({ content, language: pasteRef.current?.language }),
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

  // Download paste as file
  const getFileExtension = (lang: string): string => {
    const extensionMap: Record<string, string> = {
      javascript: '.js',
      python: '.py',
      java: '.java',
      cpp: '.cpp',
      c: '.c',
      go: '.go',
      sql: '.sql',
    };
    return extensionMap[lang] || '.txt';
  };

  const downloadFile = () => {
    const ext = getFileExtension(paste?.language || 'plain');
    const filename = `${pasteId}${ext}`;
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${filename}`);
  };

  // View raw paste
  const viewRaw = () => {
    window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${pasteId}/raw`, '_blank');
  };

  // Embed code helper
  const getEmbedUrl = () => {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://paste.sumedh.app';
    return `${base}/embed/${pasteId}`;
  };

  const getEmbedCode = () =>
    `<iframe\n  src="${getEmbedUrl()}"\n  width="${embedWidth}"\n  height="${embedHeight}"\n  frameborder="0"\n  style="border-radius:8px;overflow:hidden"\n></iframe>`;

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode());
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      // fallback
    }
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
            <Button onClick={downloadFile} variant="secondary" className="bg-slate-700 hover:bg-slate-600 text-white">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button onClick={viewRaw} variant="secondary" className="bg-slate-700 hover:bg-slate-600 text-white">
              Raw
            </Button>
            <Button
              onClick={() => setEmbedModalOpen(true)}
              variant="secondary"
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <Code2 className="w-4 h-4 mr-2" /> Embed
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

            {/* QR Code Share */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Share</h3>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <QRCodeSVG
                      id="paste-qr-code"
                      value={pasteId === 'sumedh' ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : (typeof window !== 'undefined' ? window.location.href : `https://paste.sumedh.app/paste/${pasteId}`)}
                      size={140}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#1e293b"
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">Scan to open this paste</p>
                  <Button
                    onClick={() => {
                      const svg = document.getElementById('paste-qr-code');
                      if (!svg) return;
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      canvas.width = 280;
                      canvas.height = 280;
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      img.onload = () => {
                        ctx!.fillStyle = '#ffffff';
                        ctx!.fillRect(0, 0, 280, 280);
                        ctx!.drawImage(img, 0, 0, 280, 280);
                        const link = document.createElement('a');
                        link.download = `paste-${pasteId}-qr.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        toast.success('QR code downloaded');
                      };
                      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    }}
                    variant="secondary"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
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

      {/* Embed Modal */}
      {embedModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-lg">Embed this Paste</h3>
              </div>
              <button
                onClick={() => setEmbedModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Dimension controls */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1.5">Width</label>
                  <input
                    type="text"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="100% or 800"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1.5">Height (px)</label>
                  <input
                    type="text"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="400"
                  />
                </div>
              </div>

              {/* Generated code */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Embed Code</label>
                <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-emerald-300 font-mono overflow-x-auto whitespace-pre">{getEmbedCode()}</pre>
              </div>

              {/* Live preview */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Preview</label>
                <div className="rounded-lg overflow-hidden border border-slate-700">
                  <iframe
                    src={getEmbedUrl()}
                    width="100%"
                    height={embedHeight}
                    style={{ border: 'none', display: 'block' }}
                    title="Paste embed preview"
                  />
                </div>
              </div>

              {/* Copy button */}
              <Button
                onClick={handleCopyEmbed}
                className={`w-full transition-all ${
                  embedCopied
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {embedCopied ? (
                  <><Check className="w-4 h-4 mr-2" />Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" />Copy Embed Code</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}