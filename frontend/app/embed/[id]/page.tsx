'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

/** Maps our language values to Prism language identifiers */
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

  return (
    <div style={styles.wrapper}>
      {/* Scrollable code area */}
      <div style={styles.codeArea}>
        <SyntaxHighlighter
          language={prismLang}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={styles.highlighter}
          lineNumberStyle={styles.lineNumber}
          wrapLines={false}
        >
          {paste.content}
        </SyntaxHighlighter>
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

// Inline styles — no Tailwind dependency needed in embed context
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
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
  highlighter: {
    margin: 0,
    padding: '16px',
    background: '#1e293b',
    fontSize: 13,
    lineHeight: '1.6',
    minHeight: '100%',
    borderRadius: 0,
  },
  lineNumber: {
    color: '#64748b',
    minWidth: '2.5em',
    paddingRight: '1em',
    userSelect: 'none',
  },
  footer: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    backgroundColor: '#0f172a',
    borderTop: '1px solid #1e293b',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 12,
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
