
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled ? "glass-morphism" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-medium text-xl flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-gradient font-bold">Admin Dashboard</span>
        </div>
      </div>
    </header>
  );
}
