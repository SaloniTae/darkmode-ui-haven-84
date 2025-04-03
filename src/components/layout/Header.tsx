
import { useState, useEffect, memo, useRef } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, Lock } from "lucide-react";
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
  const { logout, isAuthenticated, user, currentService, isAdmin, updateUsername, updatePassword } = useAuth();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      // Set to false when component unmounts
      isMounted.current = false;
    };
  }, []);

  // Update displayName when user changes
  useEffect(() => {
    if (user) {
      // Get email for display name
      const username = user.email || user.user_metadata?.username || "";
      // Remove @gmail.com if it exists
      const displayUsername = username.includes('@') ? username.split('@')[0] : username;
      setDisplayName(displayUsername);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine which service logo to show based on the current service
  const getCurrentService = () => {
    if (!currentService) return 'crunchyroll';
    return currentService;
  };

  const handleUpdateUsername = async () => {
    if (newUsername) {
      await updateUsername(newUsername);
      setNewUsername("");
      setShowUserDialog(false);
      // Ensure dropdown is closed after dialog closes
      if (isMounted.current) {
        setDropdownOpen(false);
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword) {
      await updatePassword(newPassword);
      setNewPassword("");
      setShowPasswordDialog(false);
      // Ensure dropdown is closed after dialog closes
      if (isMounted.current) {
        setDropdownOpen(false);
      }
    }
  };

  const handleOpenUserDialog = () => {
    setShowUserDialog(true);
    // Close dropdown when opening dialog
    setDropdownOpen(false);
  };

  const handleOpenPasswordDialog = () => {
    setShowPasswordDialog(true);
    // Close dropdown when opening dialog
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    // Close dropdown before logout
    setDropdownOpen(false);
    
    // Direct logout - no more setTimeout which was causing issues
    logout();
  };

  // Handle dialog close events
  const handleUserDialogClose = (open: boolean) => {
    setShowUserDialog(open);
    if (!open && isMounted.current) {
      // Reset dropdown state when dialog closes
      setDropdownOpen(false);
    }
  };

  const handlePasswordDialogClose = (open: boolean) => {
    setShowPasswordDialog(open);
    if (!open && isMounted.current) {
      // Reset dropdown state when dialog closes
      setDropdownOpen(false);
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
        </div>

        <div className="flex items-center space-x-1 md:space-x-4">
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {displayName} 
                    <span className="block text-xs text-muted-foreground capitalize">
                      {currentService} account
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleOpenUserDialog}>
                    <User className="mr-2 h-4 w-4" />
                    Change Username
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenPasswordDialog}>
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
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
      <Dialog open={showUserDialog} onOpenChange={handleUserDialogClose}>
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
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 gap-4">
            <Button variant="outline" onClick={() => setShowUserDialog(false)} className="w-full sm:w-auto mb-2 sm:mb-0">
              Cancel
            </Button>
            <Button onClick={handleUpdateUsername} className="w-full sm:w-auto">
              Update Username
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={handlePasswordDialogClose}>
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
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 gap-4">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="w-full sm:w-auto mb-2 sm:mb-0">
              Cancel
            </Button>
            <Button onClick={handleUpdatePassword} className="w-full sm:w-auto">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
});
