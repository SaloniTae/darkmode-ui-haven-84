
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/admin", label: "Admin", icon: Shield },
];

export function Header() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6",
        scrolled ? "glass-morphism" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/admin" 
          className="font-medium text-xl flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="text-gradient font-bold">Admin Dashboard</span>
        </Link>
      </div>
    </header>
  );
}
