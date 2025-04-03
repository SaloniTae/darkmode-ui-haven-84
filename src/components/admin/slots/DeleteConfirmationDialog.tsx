
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
import { deleteData } from "@/lib/firebase";
import { toast } from "sonner";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  slotKey: string;
  selectedSlots: string[];
  refreshData: () => Promise<void>;
  onDeleteComplete: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  slotKey,
  selectedSlots,
  refreshData,
  onDeleteComplete
}: DeleteConfirmationDialogProps) {
  
  const isMultiDelete = slotKey.includes("multiple");
  
  const handleDeleteSlot = async (slotKey: string) => {
    try {
      await deleteData(`/settings/slots/${slotKey}`);
      toast.success(`Slot "${slotKey}" deleted successfully`);
      onOpenChange(false);
      await refreshData();
    } catch (error) {
      console.error(`Error deleting slot "${slotKey}":`, error);
      toast.error(`Failed to delete slot "${slotKey}"`);
    }
  };
  
  const handleDeleteSelectedSlots = async () => {
    try {
      let successCount = 0;
      for (const slotKey of selectedSlots) {
        await deleteData(`/settings/slots/${slotKey}`);
        successCount++;
      }
      
      toast.success(`${successCount} slot(s) deleted successfully`);
      onOpenChange(false);
      onDeleteComplete();
      await refreshData();
    } catch (error) {
      console.error("Error deleting selected slots:", error);
      toast.error("Failed to delete some slots");
    }
  };

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Slot?</AlertDialogTitle>
          <AlertDialogDescription>
            {isMultiDelete ? 
              `This will permanently delete ${selectedSlots.length} selected slots. This action cannot be undone.` :
              `This will permanently delete the slot "${slotKey}". This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (isMultiDelete) {
                handleDeleteSelectedSlots();
              } else {
                handleDeleteSlot(slotKey);
              }
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
