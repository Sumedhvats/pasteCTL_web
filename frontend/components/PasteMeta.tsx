import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Calendar, Code2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PasteMetaProps {
  language: string;
  createdAt: string;
  expireAt?: string;
  views: number;
  title?: string;
}

export const PasteMeta = ({ language, createdAt, expireAt, views, title }: PasteMetaProps) => {
  const isExpired = expireAt && new Date(expireAt) < new Date();
  const timeToExpiry = expireAt ? formatDistanceToNow(new Date(expireAt)) : null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Paste Information</h2>
        {isExpired && (
          <Badge variant="destructive">Expired</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="font-medium">Language:</span>
          <Badge variant="secondary" className="capitalize">
            {language}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-medium">Views:</span>
          <span className="text-muted-foreground">{views}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-medium">Created:</span>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>

        {expireAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {isExpired ? "Expired:" : "Expires in:"}
            </span>
            <span className={`${isExpired ? "text-destructive" : "text-warning"}`}>
              {timeToExpiry}
              {!isExpired && " from now"}
            </span>
          </div>
        )}
      </div>

      {title && (
        <div className="pt-2 border-t border-border">
          <span className="font-medium text-sm">Title: </span>
          <span className="text-muted-foreground">{title}</span>
        </div>
      )}
    </Card>
  );
};