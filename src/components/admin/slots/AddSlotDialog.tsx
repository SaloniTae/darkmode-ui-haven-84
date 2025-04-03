
import { useState } from "react";
import { Slot } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateData } from "@/lib/firebase";
import { toast } from "sonner";
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

interface AddSlotDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData: () => Promise<void>;
}

export function AddSlotDialog({ isOpen, onOpenChange, refreshData }: AddSlotDialogProps) {
  const [newSlotName, setNewSlotName] = useState("");
  const [newSlotPrice, setNewSlotPrice] = useState("");

  const handleAddSlot = async () => {
    if (!newSlotName || !newSlotPrice) {
      toast.error("Slot name and price are required");
      return;
    }

    try {
      // Create a proper Slot object
      const newSlot: Slot = {
        enabled: true,
        frequency: "monthly",
        last_update: new Date().toISOString(),
        required_amount: Number(newSlotPrice) || 0,
        slot_end: new Date().toISOString(),
        slot_start: new Date().toISOString()
      };
      
      await updateData(`/settings/slots/${newSlotName.trim()}`, newSlot);
      toast.success(`Slot ${newSlotName} added successfully`);
      onOpenChange(false);
      setNewSlotName("");
      setNewSlotPrice("");
      await refreshData();
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("Failed to add slot");
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Slot</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new slot with name and required amount
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-slot-name">Slot Name</Label>
            <Input
              id="new-slot-name"
              placeholder="e.g., slot5"
              value={newSlotName}
              onChange={(e) => setNewSlotName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-slot-price">Required Amount</Label>
            <Input
              id="new-slot-price"
              placeholder="e.g., 299"
              value={newSlotPrice}
              onChange={(e) => setNewSlotPrice(e.target.value)}
              type="number"
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddSlot}>
            Add Slot
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
