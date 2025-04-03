
import { useState, useEffect } from "react";
import { Slots } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, PlusCircle, Trash } from "lucide-react";
import { setData, updateData, removeData, subscribeToData } from "@/lib/firebase";
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

interface SlotsPanelProps {
  slots: Slots;
}

export function SlotsPanel({ slots: initialSlots }: SlotsPanelProps) {
  const [slots, setSlots] = useState<Slots>(initialSlots);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editedSlotData, setEditedSlotData] = useState<any>({});
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotKey, setNewSlotKey] = useState("");
  const [newSlotData, setNewSlotData] = useState({
    monthly_price: 0,
    num_devices: 0,
    title: "",
    stock: 0
  });
  const [deleteDialog, setDeleteDialog] = useState<{open: boolean; slotKey: string}>({
    open: false,
    slotKey: ""
  });

  // Subscribe to real-time updates for slots
  useEffect(() => {
    const unsubscribe = subscribeToData('/settings/slots', (data) => {
      if (data) {
        setSlots(data);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleEditSlot = (slotKey: string) => {
    setEditingSlot(slotKey);
    setEditedSlotData({...slots[slotKey]});
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditedSlotData({});
  };

  const handleSaveSlot = async (slotKey: string) => {
    try {
      await updateData(`/settings/slots/${slotKey}`, editedSlotData);
      toast.success(`${slotKey} updated successfully`);
      setEditingSlot(null);
    } catch (error) {
      console.error(`Error updating ${slotKey}:`, error);
      toast.error(`Failed to update ${slotKey}`);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedSlotData({
      ...editedSlotData,
      [field]: value
    });
  };

  const handleNewSlotChange = (field: string, value: any) => {
    setNewSlotData({
      ...newSlotData,
      [field]: value
    });
  };

  const handleCreateSlot = async () => {
    if (!newSlotKey || !newSlotData.title) {
      toast.error("Slot key and title are required");
      return;
    }

    try {
      await setData(`/settings/slots/${newSlotKey}`, newSlotData);
      toast.success(`Slot ${newSlotKey} created successfully`);
      
      // Reset form and close dialog
      setNewSlotKey("");
      setNewSlotData({
        monthly_price: 0,
        num_devices: 0,
        title: "",
        stock: 0
      });
      setIsAddingSlot(false);
    } catch (error) {
      console.error("Error creating slot:", error);
      toast.error("Failed to create slot");
    }
  };

  const handleDeleteSlot = (slotKey: string) => {
    setDeleteDialog({
      open: true,
      slotKey
    });
  };

  const confirmDeleteSlot = async (slotKey: string) => {
    try {
      await removeData(`/settings/slots/${slotKey}`);
      toast.success(`${slotKey} deleted successfully`);
      setDeleteDialog({ open: false, slotKey: "" });
    } catch (error) {
      console.error(`Error deleting ${slotKey}:`, error);
      toast.error(`Failed to delete ${slotKey}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slots Management</h2>
        <Button onClick={() => setIsAddingSlot(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Slot
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(slots).map(([slotKey, slot]) => {
          const isEditing = editingSlot === slotKey;
          
          return (
            <DataCard
              key={slotKey}
              title={slotKey}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${slotKey}-title`}>Title</Label>
                    <Input
                      id={`${slotKey}-title`}
                      value={editedSlotData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`${slotKey}-price`}>Monthly Price</Label>
                      <Input
                        id={`${slotKey}-price`}
                        type="number"
                        value={editedSlotData.monthly_price}
                        onChange={(e) => handleInputChange('monthly_price', parseFloat(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${slotKey}-devices`}>Number of Devices</Label>
                      <Input
                        id={`${slotKey}-devices`}
                        type="number"
                        value={editedSlotData.num_devices}
                        onChange={(e) => handleInputChange('num_devices', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${slotKey}-stock`}>Stock</Label>
                      <Input
                        id={`${slotKey}-stock`}
                        type="number"
                        value={editedSlotData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={() => handleSaveSlot(slotKey)}>
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-morphism p-3 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Title</p>
                    <p className="font-medium text-lg">{slot.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="glass-morphism p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">Monthly Price</p>
                      <p className="font-medium text-sm">₹{slot.monthly_price}</p>
                    </div>
                    <div className="glass-morphism p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">Devices</p>
                      <p className="font-medium text-sm">{slot.num_devices}</p>
                    </div>
                    <div className="glass-morphism p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p className="font-medium text-sm">
                        <Badge variant={slot.stock > 0 ? "outline" : "destructive"} className={slot.stock > 0 ? "bg-green-500/20 text-green-600" : ""}>
                          {slot.stock}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSlot(slotKey)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditSlot(slotKey)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </div>
                </div>
              )}
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
              Create a new slot for subscription options
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-slot-key">Slot Key</Label>
              <Input
                id="new-slot-key"
                placeholder="e.g., slot5"
                value={newSlotKey}
                onChange={(e) => setNewSlotKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-slot-title">Title</Label>
              <Input
                id="new-slot-title"
                placeholder="Premium Slot"
                value={newSlotData.title}
                onChange={(e) => handleNewSlotChange('title', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-slot-price">Monthly Price</Label>
                <Input
                  id="new-slot-price"
                  type="number"
                  value={newSlotData.monthly_price}
                  onChange={(e) => handleNewSlotChange('monthly_price', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-slot-devices">Number of Devices</Label>
                <Input
                  id="new-slot-devices"
                  type="number"
                  value={newSlotData.num_devices}
                  onChange={(e) => handleNewSlotChange('num_devices', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-slot-stock">Stock</Label>
                <Input
                  id="new-slot-stock"
                  type="number"
                  value={newSlotData.stock}
                  onChange={(e) => handleNewSlotChange('stock', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateSlot}>
              Create Slot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialog({...deleteDialog, open: false});
          }
        }}
      >
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.slotKey}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This slot will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteSlot(deleteDialog.slotKey)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
