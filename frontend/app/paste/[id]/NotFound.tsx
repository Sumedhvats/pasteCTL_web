'use client'
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="p-8 text-center max-w-md">
        <div className="text-6xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The paste or page you're looking for doesn't exist or may have expired.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="brand" asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Search className="h-4 w-4" />
              Create New Paste
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
