'use client';

import { useState, useEffect } from 'react';
import { CodeEditor } from '@/components/code-editor';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface Paste {
  id: string;
  content: string;
  language: string;
  created_at: string;
  expire_at?: string;
  views: number;
}

export default function EmbedPage({ params }: { params: { id: string } }) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pastes/${params.id}`
        );
        if (!response.ok) {
          setError(response.status === 404 ? 'Paste not found' : 'Failed to load paste');
          return;
        }
        const data = await response.json();
        setPaste(data);
      } catch {
        setError('Failed to load paste');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaste();
  }, [params.id]);

  const pasteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/paste/${params.id}`
      : `https://paste.sumedh.app/paste/${params.id}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-pulse text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-red-400 text-sm">{error || 'Paste not found'}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      {/* Editor — fills all available space */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor
          value={paste.content}
          onChange={() => {}}
          language={paste.language}
          readOnly={true}
          height="100%"
        />
      </div>

      {/* Slim footer */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
            {paste.language}
          </span>
          <span>
            {format(new Date(paste.created_at), 'MMM dd, yyyy')}
          </span>
          <span className="text-slate-600">·</span>
          <span>{paste.views} views</span>
        </div>
        <a
          href={pasteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <ExternalLink className="w-3 h-3" />
          View on pasteCTL
        </a>
      </div>
    </div>
  );
}
