
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DataCardProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  cardClassName?: string;
  onClick?: () => void;
  onDelete?: () => void;
  deletable?: boolean;
}

export function DataCard({ 
  title, 
  children, 
  footer, 
  className, 
  cardClassName,
  onClick,
  onDelete,
  deletable = false
}: DataCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 glass-morphism", 
        onClick ? "cursor-pointer hover:translate-y-[-4px] hover:shadow-lg" : "",
        cardClassName
      )}
      onClick={onClick ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {deletable && onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("", className)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t border-white/5 pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
