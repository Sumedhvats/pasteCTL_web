import { useState, useEffect, useRef } from "react";
import Prism from "prismjs";

// Import desired language components from Prism
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
  className?: string; // Allows passing custom classes for sizing (e.g., height)
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
};

export default function CodeEditor({
  value,
  onChange,
  language,
  placeholder = "Paste your code here...",
  readOnly = false,
  className = "",
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  // Update line count as code changes
  useEffect(() => {
    const count = value.split("\n").length;
    setLineCount(count);
  }, [value]);

  // Apply syntax highlighting
  useEffect(() => {
    if (highlightRef.current && language !== "plain") {
      const prismLanguage = languageMap[language];
      if (prismLanguage && Prism.languages[prismLanguage]) {
        const highlighted = Prism.highlight(
          value,
          Prism.languages[prismLanguage],
          prismLanguage
        );
        highlightRef.current.innerHTML = highlighted;
      } else {
        highlightRef.current.textContent = value;
      }
    }
  }, [value, language]);

  // Synchronize the internal heights of all columns to make scrolling work correctly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      
      textareaRef.current.style.height = scrollHeight + "px";

      if (highlightRef.current) {
        highlightRef.current.style.height = scrollHeight + "px";
      }
      if (lineNumbersRef.current) {
        lineNumbersRef.current.style.height = scrollHeight + "px";
      }
    }
  }, [value]);

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    // Main container controls the overall size and scrolling behavior
    <div
      className={`code-editor border border-border rounded-lg overflow-y-auto ${className}`}
    >
      {/* Inner container has bottom padding to create extra scrollable space */}
      <div className="flex items-start pb-48">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="line-numbers sticky top-0 bg-muted/30 px-3 py-4 text-sm font-mono min-w-[3rem] text-right border-r border-border select-none leading-relaxed"
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Editor Column */}
        <div className="flex-1 relative">
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-4 text-sm font-mono leading-relaxed pointer-events-none whitespace-pre-wrap break-words"
            aria-hidden="true"
          />
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            spellCheck="false"
            className="w-full p-4 bg-transparent text-foreground font-mono text-sm leading-relaxed resize-none outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}