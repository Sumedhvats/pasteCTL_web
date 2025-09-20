'use client'
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Import common language support
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

interface PasteData {
  id: string;
  content: string;
  language: string;
  title?: string;
  created_at: string;
  expire_at?: string;
  views: number;
}

interface PasteViewerProps {
  pasteId: string;
}

export const PasteViewer = ({ pasteId }: PasteViewerProps) => {
  const [paste, setPaste] = useState<PasteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaste();
  }, [pasteId]);

  useEffect(() => {
    if (paste) {
      // Trigger Prism highlighting after content is loaded
      Prism.highlightAll();
    }
  }, [paste]);

  const fetchPaste = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/pastes/${pasteId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Paste not found");
        }
        throw new Error("Failed to load paste");
      }

      const data = await response.json();
      setPaste(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load paste");
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    if (paste) {
      navigator.clipboard.writeText(paste.content);
      toast({ title: "Content copied to clipboard!" });
    }
  };

  const copyRawLink = () => {
    const rawUrl = `http://localhost:8080/api/pastes/${pasteId}/raw`;
    navigator.clipboard.writeText(rawUrl);
    toast({ title: "Raw link copied to clipboard!" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Paste Not Found</h2>
        <p className="text-muted-foreground mb-4">{error || "The paste you're looking for doesn't exist."}</p>
        <Button variant="brand" asChild>
          <a href="/">Create New Paste</a>
        </Button>
      </Card>
    );
  }

  const getLanguageForPrism = (language: string) => {
    const langMap: Record<string, string> = {
      javascript: "js",
      cpp: "cpp",
      text: "text",
    };
    return langMap[language] || language;
  };

  // Split content into lines for line numbering
  const codeLines = paste.content.split('\n');

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {paste.title && (
              <h1 className="text-xl font-bold mb-1">{paste.title}</h1>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="capitalize">{paste.language}</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {paste.views} views
              </span>
              <span>Created {new Date(paste.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="copy" size="sm" onClick={copyContent}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button variant="editor" size="sm" onClick={copyRawLink}>
              <ExternalLink className="h-4 w-4" />
              Raw
            </Button>
          </div>
        </div>
      </Card>

      {/* Code content with line numbers */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-code-bg border-b border-code-border p-3 text-sm text-muted-foreground flex items-center justify-between">
          <span className="capitalize font-medium">{paste.language}</span>
          <span className="text-xs">{codeLines.length} lines</span>
        </div>
        <div className="bg-editor-bg">
          <div className="flex text-sm font-mono">
            {/* Line numbers */}
            <div className="code-line-numbers py-4">
              {codeLines.map((_, index) => (
                <div key={index + 1} className="px-3 leading-6">
                  {index + 1}
                </div>
              ))}
            </div>
            
            {/* Code content */}
            <div className="code-content py-4 flex-1 min-w-0">
              <pre className="!m-0 !bg-transparent">
                <code 
                  className={`language-${getLanguageForPrism(paste.language)} !bg-transparent`}
                  style={{ display: 'block', whiteSpace: 'pre' }}
                >
                  {paste.content}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};