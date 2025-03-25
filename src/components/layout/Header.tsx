
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Database, Home, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/database", label: "Database", icon: Database },
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
          to="/" 
          className="font-medium text-xl flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <span className="text-gradient font-bold">FirebaseUI</span>
        </Link>

        {isMobile ? (
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-primary"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {isOpen && (
              <div className="fixed inset-0 top-16 z-40 glass-morphism animate-fade-in">
                <nav className="flex flex-col p-6 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        location.pathname === item.path 
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors",
                  location.pathname === item.path 
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
