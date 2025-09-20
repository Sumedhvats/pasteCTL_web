import { Link } from "react-router-dom";
import { Plus, Github, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground group-hover:scale-105 transition-transform">
            P
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            PasteGo
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Paste
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open('https://github.com/yourusername/pastectl', '_blank')}
          >
            <Terminal className="w-4 h-4" />
            pasteCTL
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => window.open('https://github.com/yourusername/pastego', '_blank')}
          >
            <Github className="w-4 h-4" />
            GitHub
          </Button>
        </div>
      </div>
    </nav>
  );
}