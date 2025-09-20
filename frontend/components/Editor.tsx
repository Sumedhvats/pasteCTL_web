'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { value: "go", label: "Go" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "markdown", label: "Markdown" },
  { value: "json", label: "JSON" },
  { value: "text", label: "Plain Text" },
];

const EXPIRY_OPTIONS = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "never", label: "Never" },
];

interface EditorProps {
  onPasteCreated?: (pasteId: string) => void;
}

export const Editor = ({ onPasteCreated }: EditorProps) => {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("text");
  const [expiry, setExpiry] = useState("never");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:8080/api/pastes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          language,
          expiry_time: expiry === "never" ? null : expiry,
          title: title || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create paste");
      }

      const data = await response.json();
      toast({
        title: "Success!",
        description: "Paste created successfully",
      });
      
      if (onPasteCreated && data.id) {
        onPasteCreated(data.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create paste. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              placeholder="My awesome code..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiry">Expiry</Label>
            <Select value={expiry} onValueChange={setExpiry}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Paste your code here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 min-h-[400px] font-mono text-sm code-editor"
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !content.trim()}
          variant="paste"
          className="flex-1 md:flex-none"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create Paste"}
        </Button>
        
        <Button 
          variant="editor" 
          onClick={() => {
            navigator.clipboard.writeText(content);
            toast({ title: "Copied to clipboard!" });
          }}
          disabled={!content.trim()}
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
    </Card>
  );
};