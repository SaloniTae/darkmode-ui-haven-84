
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  LogOut, 
  Settings, 
  User, 
  KeyRound, 
  Check,
  Loader2 
} from "lucide-react";
import { 
  Menubar, 
  MenubarContent, 
  MenubarItem, 
  MenubarMenu, 
  MenubarSeparator, 
  MenubarTrigger 
} from "@/components/ui/menubar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const UserSettingsMenu = () => {
  const { logout, user, updateUsername, updatePassword, user_metadata, email } = useAuth();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUsernameUpdate = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await updateUsername(newUsername);
      toast.success("Username updated successfully");
      setShowUsernameDialog(false);
      setNewUsername("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update username");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      toast.error("New password cannot be empty");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success("Password updated successfully");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get the display name from either user_metadata or the user string
  const displayName = user_metadata?.username || email || user;

  return (
    <>
      <Menubar className="border-none bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="p-2 cursor-pointer">
            <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </MenubarTrigger>
          <MenubarContent align="end" className="min-w-[200px]">
            <MenubarItem disabled className="font-medium">
              <User className="mr-2 h-4 w-4" />
              {displayName}
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setShowUsernameDialog(true)}>
              <User className="mr-2 h-4 w-4" />
              Change Username
            </MenubarItem>
            <MenubarItem onClick={() => setShowPasswordDialog(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Change Username Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Enter your new username below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUsernameUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
