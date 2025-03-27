
import { useState, useEffect, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, KeyRound, Lock } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Header = memo(function Header() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { logout, isAuthenticated, user, currentService, isAdmin, updateUsername, updatePassword } = useAuth();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

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

  const handleUpdateUsername = async () => {
    if (newUsername) {
      await updateUsername(newUsername);
      setNewUsername("");
      setShowUserDialog(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword) {
      await updatePassword(newPassword);
      setNewPassword("");
      setShowPasswordDialog(false);
    }
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
            <nav className="mr-2">
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
                {isAdmin && (
                  <>
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
                  </>
                )}
              </ul>
            </nav>
          )}
          
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.user_metadata?.username || 'User'} 
                    <span className="block text-xs text-muted-foreground capitalize">
                      {currentService} account
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowUserDialog(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Change Username
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPasswordDialog(true)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Username Change Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">New Username</Label>
              <Input 
                id="username" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                placeholder="Enter new username"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUsername}>
              Update Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input 
                id="password" 
                type="password"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
});
