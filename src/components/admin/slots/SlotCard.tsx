
import { useState } from "react";
import { Slot } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Trash2 } from "lucide-react";
import { updateData } from "@/lib/firebase";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface SlotCardProps {
  slotKey: string;
  slotData: Slot;
  onDelete: (slotKey: string) => void;
  refreshData: () => Promise<void>;
  onSelect: (slotKey: string, checked: boolean) => void;
  isSelected: boolean;
}

export function SlotCard({ 
  slotKey, 
  slotData, 
  onDelete, 
  refreshData, 
  onSelect,
  isSelected 
}: SlotCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlot, setEditedSlot] = useState<Slot>({ ...slotData });

  const handleCancelEdit = () => {
    setEditedSlot({ ...slotData });
    setIsEditing(false);
  };

  const handleSaveSlot = async () => {
    try {
      await updateData(`/settings/slots/${slotKey}`, editedSlot);
      toast.success(`${slotKey} updated successfully`);
      setIsEditing(false);
      await refreshData();
    } catch (error) {
      console.error(`Error updating ${slotKey}:`, error);
      toast.error(`Failed to update ${slotKey}`);
    }
  };

  const handleInputChange = (field: keyof Slot, value: string | number | boolean) => {
    setEditedSlot(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DataCard
      title={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`select-${slotKey}`}
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(slotKey, checked === true)}
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
                <Label htmlFor={`${slotKey}-price`}>Required Amount</Label>
                <Input
                  id={`${slotKey}-price`}
                  value={editedSlot.required_amount}
                  onChange={(e) => handleInputChange('required_amount', Number(e.target.value))}
                  type="number"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${slotKey}-enabled`}>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`${slotKey}-enabled`}
                      checked={editedSlot.enabled}
                      onCheckedChange={(checked) => 
                        handleInputChange('enabled', checked === true)
                      }
                    />
                    <span>Enabled</span>
                  </div>
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              <Button onClick={handleSaveSlot}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div className="glass-morphism p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Required Amount</p>
                <p className="font-medium text-lg">{slotData.required_amount}</p>
              </div>
              <div className="glass-morphism p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium text-lg">{slotData.enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(slotKey)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </DataCard>
  );
}
