import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Clock, Code } from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const languages = [
  { value: "plain", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
];

const expiryOptions = [
  { value: "1h", label: "1 Hour" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "never", label: "Never" },
];

export default function CreatePaste() {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plain");
  const [expiry, setExpiry] = useState("24h");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateExpiryDate = (expiry: string): string | undefined => {
    if (expiry === "never") return undefined;
    
    const now = new Date();
    switch (expiry) {
      case "1h":
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case "24h":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case "7d":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return undefined;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some content before submitting.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const paste = await api.createPaste({
        content,
        language,
        expire_at: calculateExpiryDate(expiry),
      });

      toast({
        title: "Success!",
        description: "Your paste has been created successfully.",
      });

      navigate(`/paste/${paste.id}`);
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to create paste. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Create New Paste
          </h1>
          <p className="text-muted-foreground">
            Share your code snippets with syntax highlighting and custom expiry
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language}
                />
              </CardContent>
            </Card>
          </div>

          {/* Settings sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Expiry
                  </Label>
                  <Select value={expiry} onValueChange={setExpiry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expiryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Creating..." : "Create Paste"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Choose the right language for syntax highlighting</li>
                  <li>• Use expiry dates for sensitive content</li>
                  <li>• Line numbers help with debugging</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}