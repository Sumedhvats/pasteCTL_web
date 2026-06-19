'use client';

import { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-sql';
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

/** Maps pasteCTL language values to Prism language identifiers */
const PRISM_LANGUAGE_MAP: Record<string, string> = {
  plain: 'text',
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  sql: 'sql',
};

export default function EmbedPage({ params }: { params: { id: string } }) {
  const [paste, setPaste] = useState<Paste | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const codeRef = useRef<HTMLElement>(null);

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

  // Highlight code after paste loads (and Prism is ready)
  useEffect(() => {
    if (paste && codeRef.current) {
      try {
        Prism.highlightElement(codeRef.current);
      } catch {
        // ignore highlight errors
      }
    }
  }, [paste]);

  const pasteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/paste/${params.id}`
      : `https://paste.sumedh.app/paste/${params.id}`;

  if (isLoading) {
    return (
      <div style={styles.center}>
        <span style={styles.mutedText}>Loading…</span>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div style={styles.center}>
        <span style={{ color: '#f87171', fontSize: 14 }}>{error || 'Paste not found'}</span>
      </div>
    );
  }

  const prismLang = PRISM_LANGUAGE_MAP[paste.language] || 'text';
  const languageClass = prismLang === 'text' ? 'language-text' : `language-${prismLang}`;

  return (
    <div style={styles.wrapper}>
      {/* Syntax-highlighted code area */}
      <div style={styles.codeArea}>
        <pre className="language-text" style={{ margin: 0, padding: '16px', background: '#1e293b', minHeight: '100%' }}>
          <code ref={codeRef} className={languageClass} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: '1.6' }}>
            {paste.content}
          </code>
        </pre>
      </div>

      {/* Slim footer */}
      <div style={styles.footer}>
        <div style={styles.footerLeft}>
          <span style={styles.langBadge}>{paste.language}</span>
          <span style={styles.mutedText}>
            {format(new Date(paste.created_at), 'MMM dd, yyyy')}
          </span>
          <span style={{ color: '#334155' }}>·</span>
          <span style={styles.mutedText}>{paste.views} views</span>
        </div>
        <a href={pasteUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
          <ExternalLink size={12} style={{ marginRight: 4 }} />
          View on pasteCTL
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#1e293b',
  },
  codeArea: {
    flex: 1,
    overflow: 'auto',
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#0f172a',
    borderTop: '1px solid #334155',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  langBadge: {
    background: '#1e293b',
    color: '#cbd5e1',
    padding: '2px 8px',
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    border: '1px solid #334155',
  },
  mutedText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    color: '#34d399',
    fontSize: 12,
    textDecoration: 'none',
    fontFamily: 'system-ui, sans-serif',
  },
};
