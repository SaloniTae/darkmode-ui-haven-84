
import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Shield, Play, Film, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = memo(function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  const currentPath = location.pathname;

  // Determine current dashboard info
  const getDashboardInfo = () => {
    switch(true) {
      case currentPath.includes('crunchyroll'):
        return { 
          name: "Crunchyroll Dashboard", 
          icon: <Play className="h-3.5 w-3.5 text-[#f47521]" />,
          color: "text-[#f47521]",
          bg: "bg-[#f47521]/10" 
        };
      case currentPath.includes('netflix'):
        return { 
          name: "Netflix Dashboard", 
          icon: <Film className="h-3.5 w-3.5 text-[#E50914]" />,
          color: "text-[#E50914]",
          bg: "bg-[#E50914]/10" 
        };
      case currentPath.includes('prime'):
        return { 
          name: "Prime Dashboard", 
          icon: <ShoppingBag className="h-3.5 w-3.5 text-[#00A8E1]" />,
          color: "text-[#00A8E1]",
          bg: "bg-[#00A8E1]/10" 
        };
      default:
        return { 
          name: "Admin Dashboard", 
          icon: <Shield className="h-3.5 w-3.5 text-primary" />,
          color: "text-primary",
          bg: "bg-primary/10" 
        };
    }
  };

  const dashboardInfo = getDashboardInfo();

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 px-4",
        scrolled ? "glass-morphism" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-medium text-lg flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-sm border border-white/10", dashboardInfo.bg)}>
            {dashboardInfo.icon}
          </div>
          <span className="text-gradient font-bold">{dashboardInfo.name}</span>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            to="/admin" 
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white/10",
              currentPath === "/admin" ? "bg-white/10" : "bg-transparent"
            )}
          >
            <Shield className="h-4 w-4 text-primary inline mr-1" />
            Admin
          </Link>
          <Link 
            to="/crunchyroll" 
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white/10",
              currentPath === "/crunchyroll" ? "bg-white/10" : "bg-transparent"
            )}
          >
            <Play className="h-4 w-4 text-[#f47521] inline mr-1" />
            Crunchyroll
          </Link>
          <Link 
            to="/netflix" 
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white/10",
              currentPath === "/netflix" ? "bg-white/10" : "bg-transparent"
            )}
          >
            <Film className="h-4 w-4 text-[#E50914] inline mr-1" />
            Netflix
          </Link>
          <Link 
            to="/prime" 
            className={cn(
              "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-white/10",
              currentPath === "/prime" ? "bg-white/10" : "bg-transparent"
            )}
          >
            <ShoppingBag className="h-4 w-4 text-[#00A8E1] inline mr-1" />
            Prime
          </Link>
        </div>
      </div>
    </header>
  );
});
