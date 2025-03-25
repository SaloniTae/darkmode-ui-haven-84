
import { useState } from "react";
import { Slots, Slot } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, Calendar, Clock, DollarSign } from "lucide-react";
import { updateData } from "@/lib/firebase";
import { toast } from "sonner";

interface SlotsPanelProps {
  slots: Slots;
}

export function SlotsPanel({ slots }: SlotsPanelProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editedSlots, setEditedSlots] = useState<Slots>({ ...slots });

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
      toast.success(`Slot ${slotKey} updated successfully`);
      setEditingSlot(null);
    } catch (error) {
      console.error(`Error updating ${slotKey}:`, error);
      toast.error(`Failed to update ${slotKey}`);
    }
  };

  const handleInputChange = (slotKey: string, field: keyof Slot, value: any) => {
    setEditedSlots({
      ...editedSlots,
      [slotKey]: {
        ...editedSlots[slotKey],
        [field]: value
      }
    });
  };

  const toggleSlotEnabled = async (slotKey: string) => {
    const currentSlot = editedSlots[slotKey];
    const newEnabledValue = !currentSlot.enabled;
    
    try {
      await updateData(`/settings/slots/${slotKey}/enabled`, newEnabledValue);
      
      setEditedSlots({
        ...editedSlots,
        [slotKey]: {
          ...currentSlot,
          enabled: newEnabledValue
        }
      });
      
      toast.success(`${slotKey} ${newEnabledValue ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error(`Error toggling enabled state for ${slotKey}:`, error);
      toast.error(`Failed to ${newEnabledValue ? 'enable' : 'disable'} ${slotKey}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Slots Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(slots).map(([slotKey, slot]) => {
          const isEditing = editingSlot === slotKey;
          const currentSlot = editedSlots[slotKey];
          
          return (
            <DataCard
              key={slotKey}
              title={slotKey}
              className={currentSlot.enabled ? "border-green-500/30" : "border-red-500/30"}
            >
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${slotKey}-enabled`}
                          checked={currentSlot.enabled}
                          onCheckedChange={(checked) => handleInputChange(slotKey, 'enabled', checked === true)}
                        />
                        <Label htmlFor={`${slotKey}-enabled`} className="text-sm font-medium">
                          Enabled
                        </Label>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-frequency`}>Frequency</Label>
                        <Select
                          value={currentSlot.frequency}
                          onValueChange={(value) => handleInputChange(slotKey, 'frequency', value)}
                        >
                          <SelectTrigger id={`${slotKey}-frequency`}>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="3day">3 Days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-amount`}>Required Amount</Label>
                        <Input
                          id={`${slotKey}-amount`}
                          type="number"
                          value={currentSlot.required_amount}
                          onChange={(e) => handleInputChange(slotKey, 'required_amount', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-start`}>Slot Start</Label>
                        <Input
                          id={`${slotKey}-start`}
                          value={currentSlot.slot_start}
                          onChange={(e) => handleInputChange(slotKey, 'slot_start', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-end`}>Slot End</Label>
                        <Input
                          id={`${slotKey}-end`}
                          value={currentSlot.slot_end}
                          onChange={(e) => handleInputChange(slotKey, 'slot_end', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-last-update`}>Last Update</Label>
                        <Input
                          id={`${slotKey}-last-update`}
                          value={currentSlot.last_update}
                          onChange={(e) => handleInputChange(slotKey, 'last_update', e.target.value)}
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
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${currentSlot.enabled ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className="text-sm font-medium">{currentSlot.enabled ? "Enabled" : "Disabled"}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Frequency</p>
                            <p className="font-medium">{currentSlot.frequency}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Required Amount</p>
                            <p className="font-medium">₹{currentSlot.required_amount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Time Period</p>
                            <p className="font-medium text-xs">
                              {new Date(currentSlot.slot_start).toLocaleString()} - 
                              {new Date(currentSlot.slot_end).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="font-medium text-xs">{currentSlot.last_update}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant={currentSlot.enabled ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleSlotEnabled(slotKey)}
                      >
                        {currentSlot.enabled ? "Disable" : "Enable"}
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
    </div>
  );
}
