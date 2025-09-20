import { useState, useEffect, useRef } from "react";
import Prism from "prismjs";

// Import language definitions
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
}

const languageMap: Record<string, string> = {
  javascript: "javascript",
  python: "python", 
  go: "go",
  java: "java",
  c: "c",
  cpp: "cpp",
  json: "json",
  markdown: "markdown",
  plain: "plain",
};

export default function CodeEditor({ 
  value, 
  onChange, 
  language, 
  placeholder = "Paste your code here...",
  readOnly = false 
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  useEffect(() => {
    if (highlightRef.current && language !== "plain") {
      const prismLanguage = languageMap[language] || "plain";
      if (Prism.languages[prismLanguage]) {
        const highlighted = Prism.highlight(value, Prism.languages[prismLanguage], prismLanguage);
        highlightRef.current.innerHTML = highlighted;
      } else {
        highlightRef.current.textContent = value;
      }
    }
  }, [value, language]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const lineNumbers = Array.from({ length: Math.max(lineCount, 10) }, (_, i) => i + 1);

  return (
    <div className="code-editor border border-border rounded-lg overflow-hidden">
      <div className="flex">
        {/* Line numbers */}
        <div className="line-numbers bg-muted/30 px-3 py-4 text-sm font-mono min-w-[3rem] text-right border-r border-border">
          {lineNumbers.map((num) => (
            <div key={num} className={num <= lineCount ? "active" : ""}>
              {num}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 relative">
          {/* Syntax highlighted background */}
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-4 text-sm font-mono leading-relaxed pointer-events-none overflow-auto whitespace-pre-wrap break-words"
            style={{ color: 'transparent' }}
            aria-hidden="true"
          />

          {/* Actual textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-96 p-4 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none placeholder:text-muted-foreground"
            style={{ 
              color: language === "plain" ? 'hsl(var(--foreground))' : 'transparent',
            }}
          />
        </div>
      </div>
    </div>
  );
}