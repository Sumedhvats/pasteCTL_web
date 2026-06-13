'use client';

import { useState, useEffect } from 'react';
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

  // Split into lines for line-number rendering
  const lines = paste.content.split('\n');

  return (
    <div style={styles.wrapper}>
      {/* Scrollable code area */}
      <div style={styles.codeArea}>
        <table style={styles.table} cellSpacing={0} cellPadding={0}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td style={styles.lineNum}>{i + 1}</td>
                <td style={styles.lineContent}>{line || '\u00a0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

const FONT = "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace";

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
    padding: '12px 0',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontFamily: FONT,
    fontSize: 13,
    lineHeight: '22px',
    color: '#f1f5f9',
  },
  lineNum: {
    userSelect: 'none',
    textAlign: 'right',
    paddingRight: 16,
    paddingLeft: 16,
    color: '#64748b',
    minWidth: 48,
    width: 48,
    verticalAlign: 'top',
    fontVariantNumeric: 'tabular-nums',
    borderRight: '1px solid #334155',
  },
  lineContent: {
    paddingLeft: 16,
    paddingRight: 16,
    whiteSpace: 'pre',
    verticalAlign: 'top',
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
