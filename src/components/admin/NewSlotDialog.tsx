
import { useState } from "react";
import { Slot } from "@/types/database";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { SlotForm } from "./SlotForm";

interface NewSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSlot: (key: string, slot: Slot) => Promise<void>;
}

export function NewSlotDialog({ open, onOpenChange, onCreateSlot }: NewSlotDialogProps) {
  const [newSlotKey, setNewSlotKey] = useState("");
  const [newSlot, setNewSlot] = useState<Slot>({
    enabled: true,
    frequency: "daily",
    last_update: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    required_amount: 12,
    slot_end: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss"),
    slot_start: format(new Date(), "yyyy-MM-dd HH:mm:ss")
  });

  const handleNewSlotChange = (field: keyof Slot, value: any) => {
    setNewSlot({
      ...newSlot,
      [field]: value
    });
  };

  const handleCreateSlot = async () => {
    await onCreateSlot(newSlotKey, newSlot);
    resetForm();
  };

  const resetForm = () => {
    setNewSlotKey("");
    setNewSlot({
      enabled: true,
      frequency: "daily",
      last_update: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      required_amount: 12,
      slot_end: format(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss"),
      slot_start: format(new Date(), "yyyy-MM-dd HH:mm:ss")
    });
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
        }
        onOpenChange(isOpen);
      }}
    >
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Slot</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new booking slot
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-slot-key">Slot Key</Label>
            <Input
              id="new-slot-key"
              placeholder="e.g., slot_4"
              value={newSlotKey}
              onChange={(e) => setNewSlotKey(e.target.value)}
            />
          </div>
          
          <SlotForm 
            slotData={newSlot}
            onSlotChange={handleNewSlotChange}
            onSave={handleCreateSlot}
            onCancel={() => onOpenChange(false)}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreateSlot}>
            Create Slot
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
