
import { useState, useEffect, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserSettingsMenu } from "@/components/UserSettingsMenu";

export const Header = memo(function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine which service logo to show based on the current route
  const getCurrentService = () => {
    if (location.pathname.includes('/netflix')) return 'netflix';
    if (location.pathname.includes('/prime')) return 'prime';
    return 'crunchyroll';
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 px-4",
        scrolled ? "glass-morphism" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="font-medium text-lg flex items-center gap-2">
          <Logo size="md" service={getCurrentService()} />
          <span className="text-gradient font-bold hidden md:inline-block">
            Admin Dashboard
          </span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-4">
          {isAuthenticated && (
            <>
              {/* Desktop Navigation */}
              <nav className="mr-2 hidden md:block">
                <ul className="flex items-center space-x-1 md:space-x-2">
                  <li>
                    <Link
                      to="/crunchyroll"
                      className={cn(
                        "px-2 py-1 md:px-3 md:py-2 rounded-md text-sm transition-colors",
                        isActive("/crunchyroll")
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-primary/10 text-primary/80"
                      )}
                    >
                      Crunchyroll
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/netflix"
                      className={cn(
                        "px-2 py-1 md:px-3 md:py-2 rounded-md text-sm transition-colors",
                        isActive("/netflix")
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-primary/10 text-primary/80"
                      )}
                    >
                      Netflix
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/prime"
                      className={cn(
                        "px-2 py-1 md:px-3 md:py-2 rounded-md text-sm transition-colors",
                        isActive("/prime")
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-primary/10 text-primary/80"
                      )}
                    >
                      Prime
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Mobile Navigation */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link 
                      to="/crunchyroll" 
                      className={cn(
                        "px-4 py-2 rounded-md text-lg transition-colors",
                        isActive("/crunchyroll") ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Crunchyroll
                    </Link>
                    <Link 
                      to="/netflix" 
                      className={cn(
                        "px-4 py-2 rounded-md text-lg transition-colors",
                        isActive("/netflix") ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Netflix
                    </Link>
                    <Link 
                      to="/prime" 
                      className={cn(
                        "px-4 py-2 rounded-md text-lg transition-colors",
                        isActive("/prime") ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Prime
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
          
          <div className="flex items-center gap-2">
            {isAuthenticated && <UserSettingsMenu />}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
});
