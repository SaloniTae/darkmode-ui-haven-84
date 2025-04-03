
import { useState } from "react";
import { Slots } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Trash2, Plus } from "lucide-react";
import { updateData, deleteData } from "@/lib/firebase";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface SlotsPanelProps {
  slots: Slots;
  refreshData: () => Promise<void>;
}

export function SlotsPanel({ slots, refreshData }: SlotsPanelProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editedSlots, setEditedSlots] = useState<Slots>({ ...slots });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotName, setNewSlotName] = useState("");
  const [newSlotPrice, setNewSlotPrice] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{open: boolean; slotKey: string}>({
    open: false,
    slotKey: ""
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const handleEditSlot = (slotKey: string) => {
    setEditingSlot(slotKey);
  };

  const handleCancelEdit = () => {
    setEditedSlots({ ...slots });
    setEditingSlot(null);
  };

  const handleSaveSlot = async (slotKey: string) => {
    try {
      await updateData(`/settings/slots/${slotKey}`, editedSlots[slotKey]);
      toast.success(`${slotKey} updated successfully`);
      setEditingSlot(null);
      await refreshData();
    } catch (error) {
      console.error(`Error updating ${slotKey}:`, error);
      toast.error(`Failed to update ${slotKey}`);
    }
  };

  const handleInputChange = (slotKey: string, value: string) => {
    setEditedSlots({
      ...editedSlots,
      [slotKey]: value
    });
  };

  const handleAddSlot = async () => {
    if (!newSlotName || !newSlotPrice) {
      toast.error("Slot name and price are required");
      return;
    }

    try {
      await updateData(`/settings/slots/${newSlotName.trim()}`, newSlotPrice.trim());
      toast.success(`Slot ${newSlotName} added successfully`);
      setIsAddingSlot(false);
      setNewSlotName("");
      setNewSlotPrice("");
      await refreshData();
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("Failed to add slot");
    }
  };

  const handleDeleteSlot = async (slotKey: string) => {
    try {
      await deleteData(`/settings/slots/${slotKey}`);
      toast.success(`${slotKey} deleted successfully`);
      setDeleteConfirmation({open: false, slotKey: ""});
      await refreshData();
    } catch (error) {
      console.error(`Error deleting ${slotKey}:`, error);
      toast.error(`Failed to delete ${slotKey}`);
    }
  };

  const handleSelectSlot = (slotKey: string, checked: boolean) => {
    if (checked) {
      setSelectedSlots([...selectedSlots, slotKey]);
    } else {
      setSelectedSlots(selectedSlots.filter(key => key !== slotKey));
    }
  };

  const handleDeleteSelectedSlots = () => {
    if (selectedSlots.length === 0) {
      toast.error("No slots selected for deletion");
      return;
    }

    setDeleteConfirmation({
      open: true,
      slotKey: `multiple (${selectedSlots.length} slots)`
    });
  };

  const confirmDeleteSelectedSlots = async () => {
    try {
      let successCount = 0;
      for (const slotKey of selectedSlots) {
        await deleteData(`/settings/slots/${slotKey}`);
        successCount++;
      }
      
      toast.success(`${successCount} slot(s) deleted successfully`);
      setSelectedSlots([]);
      setDeleteConfirmation({open: false, slotKey: ""});
      await refreshData();
    } catch (error) {
      console.error("Error deleting selected slots:", error);
      toast.error("Failed to delete some slots");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slots Management</h2>
        <div className="flex space-x-2">
          {selectedSlots.length > 0 && (
            <Button variant="destructive" onClick={handleDeleteSelectedSlots}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedSlots.length})
            </Button>
          )}
          <Button onClick={() => setIsAddingSlot(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Slot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(slots).map(([slotKey, slotPrice]) => {
          const isEditing = editingSlot === slotKey;
          
          return (
            <DataCard
              key={slotKey}
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`select-${slotKey}`}
                      checked={selectedSlots.includes(slotKey)}
                      onCheckedChange={(checked) => handleSelectSlot(slotKey, checked === true)}
                    />
                    <span>{slotKey}</span>
                  </div>
                </div>
              }
              className="border-blue-500/30"
            >
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-price`}>Price</Label>
                        <Input
                          id={`${slotKey}-price`}
                          value={editedSlots[slotKey]}
                          onChange={(e) => handleInputChange(slotKey, e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      <Button onClick={() => handleSaveSlot(slotKey)}>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="glass-morphism p-3 rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">Price</p>
                        <p className="font-medium text-lg">{slotPrice}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="destructive" 
                        size="sm"
                        onClick={() => setDeleteConfirmation({open: true, slotKey})}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSlot(slotKey)}
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

      {/* Add Slot Dialog */}
      <AlertDialog 
        open={isAddingSlot} 
        onOpenChange={setIsAddingSlot}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new slot with name and price
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
              <Label htmlFor="new-slot-price">Slot Price</Label>
              <Input
                id="new-slot-price"
                placeholder="e.g., 299Rs"
                value={newSlotPrice}
                onChange={(e) => setNewSlotPrice(e.target.value)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({...deleteConfirmation, open: false});
          }
        }}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slot?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSlots.length > 0 && deleteConfirmation.slotKey.includes("multiple") ? 
                `This will permanently delete ${selectedSlots.length} selected slots. This action cannot be undone.` :
                `This will permanently delete the slot "${deleteConfirmation.slotKey}". This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (selectedSlots.length > 0 && deleteConfirmation.slotKey.includes("multiple")) {
                  confirmDeleteSelectedSlots();
                } else {
                  handleDeleteSlot(deleteConfirmation.slotKey);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
