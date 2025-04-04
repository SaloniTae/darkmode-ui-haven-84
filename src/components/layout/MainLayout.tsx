
import { ReactNode } from "react";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className={cn("flex-1 pt-24 px-4 md:px-6 lg:px-8", className)}>
        <div className="max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          &copy; {new Date().getFullYear()} OORverse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
