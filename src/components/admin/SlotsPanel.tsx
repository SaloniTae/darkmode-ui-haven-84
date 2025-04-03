
import { useState } from "react";
import { Slots } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { SlotCard } from "./slots/SlotCard";
import { AddSlotDialog } from "./slots/AddSlotDialog";
import { DeleteConfirmationDialog } from "./slots/DeleteConfirmationDialog";

interface SlotsPanelProps {
  slots: Slots;
  refreshData: () => Promise<void>;
}

export function SlotsPanel({ slots, refreshData }: SlotsPanelProps) {
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{open: boolean; slotKey: string}>({
    open: false,
    slotKey: ""
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

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
        {Object.entries(slots).map(([slotKey, slotData]) => (
          <SlotCard
            key={slotKey}
            slotKey={slotKey}
            slotData={slotData}
            onDelete={(key) => setDeleteConfirmation({open: true, slotKey: key})}
            refreshData={refreshData}
            onSelect={handleSelectSlot}
            isSelected={selectedSlots.includes(slotKey)}
          />
        ))}
      </div>

      {/* Add Slot Dialog */}
      <AddSlotDialog
        isOpen={isAddingSlot}
        onOpenChange={setIsAddingSlot}
        refreshData={refreshData}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({...deleteConfirmation, open: false});
          }
        }}
        slotKey={deleteConfirmation.slotKey}
        selectedSlots={selectedSlots}
        refreshData={refreshData}
        onDeleteComplete={() => setSelectedSlots([])}
      />
    </div>
  );
}
