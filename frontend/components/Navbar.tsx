import Link  from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Github } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text">
          <Code2 className="h-6 w-6 text-primary" />
          pasteCTL
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              New Paste
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};