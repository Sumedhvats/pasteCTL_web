'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  placeholder = "Start typing your code...",
  readOnly = false,
  height = "400px"
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Configure Monaco theme
    monaco.editor.defineTheme('pastectlTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '10B981' },
        { token: 'string', foreground: 'FDE047' },
        { token: 'number', foreground: 'F472B6' },
        { token: 'type', foreground: '06B6D4' },
        { token: 'function', foreground: 'A78BFA' },
      ],
      colors: {
        'editor.background': '#1E293B',
        'editor.foreground': '#F1F5F9',
        'editor.lineHighlightBackground': '#334155',
        'editor.selectionBackground': '#475569',
        'editorCursor.foreground': '#10B981',
        'editorGutter.background': '#1E293B',
        'editorLineNumber.foreground': '#64748B',
        'editorLineNumber.activeForeground': '#E2E8F0',
        'editor.findMatchBackground': '#374151',
        'editor.findMatchHighlightBackground': '#4B5563',
      }
    });

    monaco.editor.setTheme('pastectlTheme');

    // Add placeholder functionality
    if (!value && placeholder) {
      const placeholderNode = document.createElement('div');
      placeholderNode.style.position = 'absolute';
      placeholderNode.style.top = '0';
      placeholderNode.style.left = '0';
      placeholderNode.style.right = '0';
      placeholderNode.style.bottom = '0';
      placeholderNode.style.color = '#64748B';
      placeholderNode.style.fontSize = '14px';
      placeholderNode.style.fontFamily = 'JetBrains Mono, monospace';
      placeholderNode.style.padding = '15px 0 0 60px';
      placeholderNode.style.pointerEvents = 'none';
      placeholderNode.style.zIndex = '1';
      placeholderNode.textContent = placeholder;

      const editorContainer = editor.getDomNode();
      const editorParent = editorContainer?.parentNode;
      
      if (editorParent) {
        editorParent.style.position = 'relative';
        editorParent.appendChild(placeholderNode);

        const updatePlaceholder = () => {
          const currentValue = editor.getValue();
          placeholderNode.style.display = currentValue ? 'none' : 'block';
        };

        editor.onDidChangeModelContent(updatePlaceholder);
        updatePlaceholder();
      }
    }
  };

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'plain': 'plaintext',
      'javascript': 'javascript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'sql': 'sql',
    };
    return languageMap[lang] || 'plaintext';
  };

  return (
    <div className="relative">
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <Editor
          height={height}
          language={getMonacoLanguage(language)}
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineHeight: 24,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
//@ts-ignore
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
            padding: { top: 15, bottom: 15 },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
          theme="pastectlTheme"
        />
      </div>
    </div>
  );
}