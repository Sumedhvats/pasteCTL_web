'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Send, Code, Clock, Lightbulb, X, Terminal, Download, Link, Wand2, Upload, FileText } from 'lucide-react';
import { CodeEditor } from '@/components/code-editor';
import { Header } from '@/components/header';
import { toast } from 'sonner';

/**
 * Detects programming language from code content using heuristic pattern matching.
 * Returns a language value matching the LANGUAGES array, or 'plain' if no confident match.
 */
function detectLanguage(code: string): string {
  if (!code || code.trim().length < 10) return 'plain';

  const lines = code.split('\n');
  const trimmed = code.trim();

  // Score each language based on pattern matches
  const scores: Record<string, number> = {
    javascript: 0,
    python: 0,
    java: 0,
    cpp: 0,
    c: 0,
    go: 0,
    sql: 0,
  };

  // --- JavaScript / TypeScript ---
  if (/\b(const|let|var)\s+\w+\s*=/.test(trimmed)) scores.javascript += 3;
  if (/\b(import|export)\s+.*\s+from\s+['"]/.test(trimmed)) scores.javascript += 4;
  if (/\brequire\s*\(/.test(trimmed)) scores.javascript += 3;
  if (/=>/m.test(trimmed)) scores.javascript += 2;
  if (/\bconsole\.(log|error|warn)\b/.test(trimmed)) scores.javascript += 3;
  if (/\b(async|await)\b/.test(trimmed)) scores.javascript += 2;
  if (/\bfunction\s+\w+\s*\(/.test(trimmed)) scores.javascript += 2;
  if (/\bdocument\.|window\.|\$\(/.test(trimmed)) scores.javascript += 3;
  if (/\b(useState|useEffect|useRef)\b/.test(trimmed)) scores.javascript += 4;
  if (/\b(interface|type)\s+\w+\s*[{=]/.test(trimmed)) scores.javascript += 3;

  // --- Python ---
  if (/^(import|from)\s+\w+/m.test(trimmed) && !/[;{}]/.test(trimmed)) scores.python += 4;
  if (/^def\s+\w+\s*\(.*\)\s*(->[^:]*)?:/m.test(trimmed)) scores.python += 5;
  if (/^class\s+\w+.*:/m.test(trimmed)) scores.python += 4;
  if (/\bprint\s*\(/.test(trimmed)) scores.python += 2;
  if (/\bself\b/.test(trimmed)) scores.python += 3;
  if (/^\s*(if|for|while|elif|else)\s+.*:/m.test(trimmed)) scores.python += 3;
  if (/__\w+__/.test(trimmed)) scores.python += 3;
  if (/\b(True|False|None)\b/.test(trimmed)) scores.python += 2;
  if (/\brange\s*\(/.test(trimmed)) scores.python += 2;
  if (/^\s*@\w+/m.test(trimmed)) scores.python += 2;

  // --- Java ---
  if (/^\s*public\s+(static\s+)?(void|class|int|String|boolean)\b/m.test(trimmed)) scores.java += 5;
  if (/\bSystem\.out\.println\b/.test(trimmed)) scores.java += 5;
  if (/^\s*(private|protected|public)\s+\w+\s+\w+\s*[=(]/.test(trimmed)) scores.java += 3;
  if (/^\s*package\s+[\w.]+;/m.test(trimmed)) scores.java += 5;
  if (/^\s*import\s+java\./m.test(trimmed)) scores.java += 5;
  if (/\bnew\s+\w+\s*\(/.test(trimmed) && /;\s*$/.test(lines[0]?.trim() || '')) scores.java += 2;
  if (/\b(ArrayList|HashMap|Scanner|IOException)\b/.test(trimmed)) scores.java += 3;
  if (/@Override/m.test(trimmed)) scores.java += 4;

  // --- C++ ---
  if (/^\s*#include\s*<(iostream|vector|string|algorithm|map|set|queue)>/m.test(trimmed)) scores.cpp += 5;
  if (/\bstd::|cout|cin|endl|cerr\b/.test(trimmed)) scores.cpp += 5;
  if (/\busing\s+namespace\s+std\b/.test(trimmed)) scores.cpp += 5;
  if (/\b(template|typename|nullptr|auto)\b/.test(trimmed)) scores.cpp += 3;
  if (/\bclass\s+\w+\s*(:\s*(public|private|protected))?\s*\{/.test(trimmed)) scores.cpp += 3;
  if (/\bvector\s*</.test(trimmed)) scores.cpp += 3;

  // --- C ---
  if (/^\s*#include\s*<(stdio|stdlib|string|math|unistd|fcntl)\.h>/m.test(trimmed)) scores.c += 5;
  if (/\b(printf|scanf|malloc|free|sizeof)\s*\(/.test(trimmed)) scores.c += 4;
  if (/\bint\s+main\s*\(\s*(void|int\s+argc)/.test(trimmed)) scores.c += 4;
  if (/\b(typedef|struct|enum)\s+\w+/.test(trimmed)) scores.c += 2;
  if (/->\w+/.test(trimmed) && /\bmalloc\b/.test(trimmed)) scores.c += 3;

  // --- Go ---
  if (/^package\s+\w+/m.test(trimmed)) scores.go += 5;
  if (/^\s*func\s+(\(\w+\s+\*?\w+\)\s+)?\w+\s*\(/m.test(trimmed)) scores.go += 4;
  if (/\bfmt\.(Println|Printf|Sprintf|Fprintf)\b/.test(trimmed)) scores.go += 5;
  if (/:=/.test(trimmed)) scores.go += 3;
  if (/^\s*import\s+\(/m.test(trimmed)) scores.go += 4;
  if (/\b(chan|goroutine|go\s+func|defer|select)\b/.test(trimmed)) scores.go += 3;
  if (/\berr\s*!=\s*nil\b/.test(trimmed)) scores.go += 4;
  if (/\binterface\s*\{/.test(trimmed)) scores.go += 2;

  // --- SQL ---
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/im.test(trimmed)) scores.sql += 5;
  if (/\b(FROM|WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT)\b/i.test(trimmed)) scores.sql += 3;
  if (/\b(VARCHAR|INTEGER|BOOLEAN|TIMESTAMP|TEXT|SERIAL|PRIMARY\s+KEY)\b/i.test(trimmed)) scores.sql += 4;
  if (/\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(trimmed)) scores.sql += 5;
  if (/\b(INNER|LEFT|RIGHT|OUTER)\s+JOIN\b/i.test(trimmed)) scores.sql += 4;

  // Find the highest scoring language
  let bestLang = 'plain';
  let bestScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  // Resolve C vs C++ ambiguity — if both score high, prefer C++ (superset)
  if (scores.c > 3 && scores.cpp >= scores.c) bestLang = 'cpp';

  // Only return a detection if we're reasonably confident (score >= 4)
  return bestScore >= 4 ? bestLang : 'plain';
}

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

/** Maps file extensions to language values */
const EXT_TO_LANGUAGE: Record<string, string> = {
  '.js': 'javascript', '.jsx': 'javascript', '.ts': 'javascript', '.tsx': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.py': 'python', '.pyw': 'python',
  '.java': 'java',
  '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hxx': 'cpp', '.h': 'cpp',
  '.c': 'c',
  '.go': 'go',
  '.sql': 'sql',
};

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plain');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [manuallySelected, setManuallySelected] = useState(false);
  const [expiry, setExpiry] = useState('24h');
  const [customId, setCustomId] = useState('');
  const [customIdError, setCustomIdError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCliPopup, setShowCliPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const detectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateCustomId = (id: string) => {
    if (!id) { setCustomIdError(''); return true; }
    if (id.length < 3 || id.length > 30) {
      setCustomIdError('Must be 3-30 characters');
      return false;
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(id)) {
      setCustomIdError('Lowercase letters, numbers, and hyphens only');
      return false;
    }
    const reserved = ['api', 'paste', 'raw', 'ws', 'admin', 'new'];
    if (reserved.includes(id)) {
      setCustomIdError('This URL is reserved');
      return false;
    }
    setCustomIdError('');
    return true;
  };

  // Auto-detect language when content changes (debounced)
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    // Only auto-detect if the user hasn't manually selected a language
    if (!manuallySelected) {
      if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
      detectTimeoutRef.current = setTimeout(() => {
        const detected = detectLanguage(newContent);
        setLanguage(detected);
        setIsAutoDetected(detected !== 'plain');
      }, 500); // 500ms debounce
    }
  }, [manuallySelected]);

  // File upload handler
  const handleFileUpload = useCallback((file: File) => {
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error('File too large. Maximum size is 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error('Could not read file');
        return;
      }

      setContent(text);
      setUploadedFileName(file.name);

      // Detect language from extension
      const dotIndex = file.name.lastIndexOf('.');
      const ext = dotIndex !== -1 ? file.name.slice(dotIndex).toLowerCase() : '';
      const detectedLang = EXT_TO_LANGUAGE[ext];

      if (detectedLang) {
        setLanguage(detectedLang);
        setIsAutoDetected(true);
        setManuallySelected(false);
      } else {
        // Fall back to content-based detection
        const contentDetected = detectLanguage(text);
        setLanguage(contentDetected);
        setIsAutoDetected(contentDetected !== 'plain');
        setManuallySelected(false);
      }

      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // Handle manual language selection
  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value);
    setManuallySelected(true);
    setIsAutoDetected(false);
  }, []);

  // Reset manual override when content is cleared
  useEffect(() => {
    if (!content.trim()) {
      setManuallySelected(false);
      setIsAutoDetected(false);
      setLanguage('plain');
      setUploadedFileName(null);
    }
  }, [content]);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    };
  }, []);

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

    if (customId && !validateCustomId(customId)) {
      toast.error('Invalid custom URL');
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
          expire: expiry,
          ...(customId && { id: customId }),
        }),
      });

      if (response.status === 409) {
        toast.error('This paste URL is already taken');
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Failed to create paste');
      }

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
            {/* Upload bar */}
            <div className="flex items-center gap-3 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.pyw,.java,.cpp,.cc,.cxx,.hpp,.c,.h,.go,.sql,.txt,.md,.json,.xml,.yaml,.yml,.toml,.csv,.sh,.bash,.rb,.rs,.swift,.kt,.cs,.php,.html,.css,.scss,.sass,.less"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = ''; // reset so the same file can be re-uploaded
                }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm h-9"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              {uploadedFileName && (
                <div className="flex items-center gap-2 bg-slate-700 rounded-md px-3 py-1.5 text-sm">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">{uploadedFileName}</span>
                  <button
                    onClick={() => setUploadedFileName(null)}
                    className="text-slate-400 hover:text-white ml-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="text-xs text-slate-500 ml-auto">or drag & drop a file</span>
            </div>

            {/* Editor with drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative transition-all duration-200 rounded-lg ${
                isDragOver ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''
              }`}
            >
              {isDragOver && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center border-2 border-dashed border-emerald-400">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Drop file here</span>
                  </div>
                </div>
              )}
              <CodeEditor
                value={content}
                onChange={handleContentChange}
                language={language}
                placeholder="Paste your code here..."
                height="500px"
              />
            </div>
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
                <Select value={language} onValueChange={handleLanguageChange}>
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
                {isAutoDetected && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Wand2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Auto-detected</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom URL */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-semibold text-white">Custom URL</h3>
                </div>
                <input
                  type="text"
                  value={customId}
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                    setCustomId(val);
                    validateCustomId(val);
                  }}
                  placeholder="e.g. my-snippet"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {customIdError && (
                  <p className="text-red-400 text-xs mt-1">{customIdError}</p>
                )}
                {customId && !customIdError && (
                  <p className="text-slate-400 text-xs mt-1">paste.sumedh.app/paste/{customId}</p>
                )}
                {!customId && (
                  <p className="text-slate-500 text-xs mt-1">Leave empty for a random URL</p>
                )}
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
                  <li>• Language is auto-detected as you type.</li>
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