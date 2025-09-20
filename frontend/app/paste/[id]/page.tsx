// app/page.tsx

"use client"; // This directive is necessary for client-side components in Next.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Editor } from "@/components/Editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Zap, Shield, Code2 } from "lucide-react";

const Home = () => {
  const router = useRouter();
  const [createdPasteId, setCreatedPasteId] = useState<string | null>(null);

  const handlePasteCreated = (pasteId: string) => {
    setCreatedPasteId(pasteId);
    // Navigate to the paste after a short delay to show success
    setTimeout(() => {
      router.push(`/paste/${pasteId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar component would likely be in a root layout.tsx */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Use Next.js Image component for optimized images */}
        <Image
          src="/hero-code.jpg" // Image from the public directory
          alt="Abstract code background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 opacity-10"
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Share Code Instantly
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The fastest way to share code snippets, logs, and text. Simple, fast, and developer-friendly.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Fast & Simple
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Code2 className="h-3 w-3" />
              Syntax Highlighting
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Auto Expiry
            </Badge>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {createdPasteId && (
        <div className="container mx-auto px-4 mb-8 max-w-4xl">
          <Card className="p-4 bg-success/10 border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-success">Paste Created Successfully! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Your paste is ready at: /paste/{createdPasteId}
                </p>
              </div>
              <Button
                variant="copy"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/paste/${createdPasteId}`);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Editor Section */}
      <section className="container mx-auto px-4 pb-16 max-w-4xl">
        <Editor onPasteCreated={handlePasteCreated} />
      </section>

      {/* Features Section */}
      <section className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose pasteCTL?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Create and share pastes in seconds. No registration required.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Code2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Syntax Highlighting</h3>
              <p className="text-muted-foreground">
                Support for all popular programming languages with beautiful highlighting.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Auto Expiry</h3>
              <p className="text-muted-foreground">
                Set expiration times to keep your pastes secure and ephemeral.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;