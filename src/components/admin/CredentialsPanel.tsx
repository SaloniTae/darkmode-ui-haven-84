
import { useState } from "react";
import { Credential, Slots } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, Lock, Unlock, Calendar } from "lucide-react";
import { updateData } from "@/lib/firebase";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CredentialsPanelProps {
  credentials: {
    cred1: Credential;
    cred2: Credential;
    cred3: Credential;
    cred4: Credential;
  };
  slots: Slots;
}

export function CredentialsPanel({ credentials, slots }: CredentialsPanelProps) {
  const [editingCred, setEditingCred] = useState<string | null>(null);
  const [editedCredentials, setEditedCredentials] = useState({ ...credentials });
  const [confirmationDialog, setConfirmationDialog] = useState<{open: boolean; action: () => Promise<void>; title: string; description: string}>({
    open: false,
    action: async () => {},
    title: "",
    description: ""
  });

  const handleEditCred = (credKey: string) => {
    setEditingCred(credKey);
  };

  const handleCancelEdit = () => {
    setEditedCredentials({ ...credentials });
    setEditingCred(null);
  };

  const handleSaveCred = async (credKey: string) => {
    try {
      await updateData(`/${credKey}`, editedCredentials[credKey as keyof typeof editedCredentials]);
      toast.success(`Credential ${credKey} updated successfully`);
      setEditingCred(null);
    } catch (error) {
      console.error(`Error updating ${credKey}:`, error);
      toast.error(`Failed to update ${credKey}`);
    }
  };

  const handleInputChange = (credKey: string, field: keyof Credential, value: any) => {
    setEditedCredentials({
      ...editedCredentials,
      [credKey]: {
        ...editedCredentials[credKey as keyof typeof editedCredentials],
        [field]: value
      }
    });
  };

  const toggleLock = async (credKey: string) => {
    const currentCred = editedCredentials[credKey as keyof typeof editedCredentials];
    const newLockedValue = currentCred.locked === 1 ? 0 : 1;
    
    setConfirmationDialog({
      open: true,
      action: async () => {
        try {
          await updateData(`/${credKey}/locked`, newLockedValue);
          
          setEditedCredentials({
            ...editedCredentials,
            [credKey]: {
              ...currentCred,
              locked: newLockedValue
            }
          });
          
          toast.success(`${credKey} ${newLockedValue === 1 ? 'locked' : 'unlocked'} successfully`);
        } catch (error) {
          console.error(`Error toggling lock for ${credKey}:`, error);
          toast.error(`Failed to ${newLockedValue === 1 ? 'lock' : 'unlock'} ${credKey}`);
        }
      },
      title: `${newLockedValue === 1 ? 'Lock' : 'Unlock'} ${credKey}`,
      description: `Are you sure you want to ${newLockedValue === 1 ? 'lock' : 'unlock'} ${credKey}?`
    });
  };

  const handleDateSelect = (credKey: string, date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      handleInputChange(credKey, 'expiry_date', formattedDate);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Credentials Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(credentials).map(([credKey, cred]) => {
          const isEditing = editingCred === credKey;
          const currentCred = editedCredentials[credKey as keyof typeof editedCredentials];
          
          return (
            <DataCard
              key={credKey}
              title={`${credKey.toUpperCase()}`}
              className={currentCred.locked === 1 ? "border-red-500/30" : ""}
            >
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${credKey}-email`}>Email</Label>
                        <Input
                          id={`${credKey}-email`}
                          value={currentCred.email}
                          onChange={(e) => handleInputChange(credKey, 'email', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${credKey}-password`}>Password</Label>
                        <Input
                          id={`${credKey}-password`}
                          value={currentCred.password}
                          onChange={(e) => handleInputChange(credKey, 'password', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${credKey}-slot`}>Belongs to Slot</Label>
                        <Select
                          value={currentCred.belongs_to_slot}
                          onValueChange={(value) => handleInputChange(credKey, 'belongs_to_slot', value)}
                        >
                          <SelectTrigger id={`${credKey}-slot`}>
                            <SelectValue placeholder="Select slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(slots).map((slotKey) => (
                              <SelectItem key={slotKey} value={slotKey}>{slotKey}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${credKey}-expiry`}>Expiry Date</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`${credKey}-expiry`}
                            value={currentCred.expiry_date}
                            onChange={(e) => handleInputChange(credKey, 'expiry_date', e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <CalendarComponent
                                mode="single"
                                selected={new Date(currentCred.expiry_date)}
                                onSelect={(date) => handleDateSelect(credKey, date)}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`${credKey}-max`}>Max Usage</Label>
                          <Input
                            id={`${credKey}-max`}
                            type="number"
                            value={currentCred.max_usage}
                            onChange={(e) => handleInputChange(credKey, 'max_usage', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor={`${credKey}-current`}>Current Usage</Label>
                          <Input
                            id={`${credKey}-current`}
                            type="number"
                            value={currentCred.usage_count}
                            onChange={(e) => handleInputChange(credKey, 'usage_count', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${credKey}-locked`}
                          checked={currentCred.locked === 1}
                          onCheckedChange={(checked) => handleInputChange(credKey, 'locked', checked ? 1 : 0)}
                        />
                        <Label htmlFor={`${credKey}-locked`} className="text-sm font-medium">
                          Locked
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      <Button onClick={() => handleSaveCred(credKey)}>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="overflow-hidden">
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-sm truncate" title={currentCred.email}>{currentCred.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Password</p>
                          <p className="font-medium text-sm">{currentCred.password}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Slot</p>
                          <p className="font-medium text-sm">{currentCred.belongs_to_slot}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                          <p className="font-medium text-sm">{currentCred.expiry_date}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Usage</p>
                          <p className="font-medium text-sm">{currentCred.usage_count} / {currentCred.max_usage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className={`font-medium text-sm ${currentCred.locked === 1 ? "text-red-400" : "text-green-400"}`}>
                            {currentCred.locked === 1 ? "Locked" : "Unlocked"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant={currentCred.locked === 1 ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => toggleLock(credKey)}
                      >
                        {currentCred.locked === 1 ? (
                          <><Unlock className="mr-2 h-4 w-4" /> Unlock</>
                        ) : (
                          <><Lock className="mr-2 h-4 w-4" /> Lock</>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCred(credKey)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DataCard>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmationDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationDialog({...confirmationDialog, open: false});
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await confirmationDialog.action();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
