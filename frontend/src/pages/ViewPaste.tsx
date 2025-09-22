import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, ExternalLink, Clock, Eye, Code, Calendar, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, type Paste } from "@/lib/api";

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const loadPaste = async () => {
      try {
        setLoading(true);
        const [pasteData] = await Promise.all([
          api.getPaste(id),
          api.updateViews(id).catch(() => {}) // Don't fail if view update fails
        ]);
        setPaste(pasteData);
      } catch (err) {
        setError("Failed to load paste. It may have expired or doesn't exist.");
      } finally {
        setLoading(false);
      }
    };

    loadPaste();
  }, [id]);

  const copyToClipboard = async (text: string, type: "content" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type === "content" ? "Content" : "Link"} copied to clipboard.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard.",
      });
    }
  };

  const copyRawLink = () => {
    const rawUrl = `${window.location.origin}/api/pastes/${id}/raw`;
    copyToClipboard(rawUrl, "link");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (expiryString?: string) => {
    if (!expiryString) return "Never expires";
    
    const expiry = new Date(expiryString);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading paste...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Paste Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "This paste doesn't exist or has expired."}
              </p>
              <Link to="/">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Paste
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Paste <span className="text-primary font-mono">#{paste.id}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(paste.content, "content")}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyRawLink}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Raw
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <CodeEditor
                  value={paste.content}
                  onChange={() => {}} // Read-only
                  language={paste.language}
                  readOnly
                  className="h-[500px]" 
                />
              </CardContent>
            </Card>
          </div>

          {/* Metadata sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Paste Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Language</span>
                  <Badge variant="secondary">{paste.language}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="w-4 h-4" />
                    {paste.views}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Created
                  </div>
                  <div className="text-sm font-mono bg-muted/30 p-2 rounded">
                    {formatDate(paste.created_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Expires
                  </div>
                  <div className="text-sm font-mono bg-muted/30 p-2 rounded">
                    {getTimeRemaining(paste.expire_at)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Actions</h3>
                <div className="space-y-2">
                  <Link to="/" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Plus className="w-4 h-4" />
                      New Paste
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}