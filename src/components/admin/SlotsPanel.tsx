
import { useState, useEffect } from "react";
import { Slot, Slots } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateData, setData, removeData } from "@/lib/firebase";
import { format, parse, addDays } from "date-fns";
import { CalendarIcon, Clock, DollarSign, Edit, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SlotsPanelProps {
  slots: Slots;
}

export function SlotsPanel({ slots }: SlotsPanelProps) {
  const [localSlots, setLocalSlots] = useState<Slots>({ ...slots });
  const [editedSlots, setEditedSlots] = useState<Slots>({ ...slots });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotKey, setNewSlotKey] = useState("");
  const [newSlot, setNewSlot] = useState<Slot>({
    enabled: true,
    frequency: "daily",
    last_update: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    required_amount: 12,
    slot_start: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    slot_end: format(addDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss')
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{open: boolean; slotKey: string}>({
    open: false,
    slotKey: ""
  });
  
  // Update local state when props change
  useEffect(() => {
    setLocalSlots({ ...slots });
    setEditedSlots({ ...slots });
  }, [slots]);
  
  const handleEditSlot = (slotKey: string) => {
    setEditingSlot(slotKey);
    
    try {
      const slot = editedSlots[slotKey];
      setStartDate(parse(slot.slot_start, 'yyyy-MM-dd HH:mm:ss', new Date()));
      setEndDate(parse(slot.slot_end, 'yyyy-MM-dd HH:mm:ss', new Date()));
    } catch (e) {
      console.error("Error parsing dates:", e);
      setStartDate(new Date());
      setEndDate(addDays(new Date(), 1));
    }
  };
  
  const handleCancelEdit = () => {
    setEditedSlots({ ...localSlots });
    setEditingSlot(null);
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  const handleSaveSlot = async (slotKey: string) => {
    try {
      await updateData(`/settings/slots/${slotKey}`, editedSlots[slotKey]);
      toast.success(`${slotKey} updated successfully`);
      
      // Update local state
      setLocalSlots(prev => ({
        ...prev,
        [slotKey]: editedSlots[slotKey]
      }));
      
      setEditingSlot(null);
      setStartDate(undefined);
      setEndDate(undefined);
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
  
  const handleToggleSlot = async (slotKey: string, enabled: boolean) => {
    try {
      await updateData(`/settings/slots/${slotKey}/enabled`, enabled);
      toast.success(`${slotKey} ${enabled ? 'enabled' : 'disabled'} successfully`);
      
      // Update both local states
      const updatedSlot = {
        ...localSlots[slotKey],
        enabled
      };
      
      setLocalSlots(prev => ({
        ...prev,
        [slotKey]: updatedSlot
      }));
      
      setEditedSlots(prev => ({
        ...prev,
        [slotKey]: updatedSlot
      }));
    } catch (error) {
      console.error(`Error updating ${slotKey}:`, error);
      toast.error(`Failed to update ${slotKey}`);
    }
  };
  
  const confirmDeleteSlot = (slotKey: string) => {
    setDeleteConfirmation({
      open: true,
      slotKey
    });
  };
  
  const handleDeleteSlot = async () => {
    const { slotKey } = deleteConfirmation;
    if (!slotKey) return;
    
    try {
      await removeData(`/settings/slots/${slotKey}`);
      toast.success(`${slotKey} deleted successfully`);
      
      // Update local state
      const updatedSlots = { ...localSlots };
      delete updatedSlots[slotKey];
      setLocalSlots(updatedSlots);
      setEditedSlots(updatedSlots);
      
      setDeleteConfirmation({ open: false, slotKey: "" });
    } catch (error) {
      console.error(`Error deleting ${slotKey}:`, error);
      toast.error(`Failed to delete ${slotKey}`);
    }
  };
  
  const formatDateTime = (dateString: string): string => {
    try {
      return format(parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM d, yyyy hh:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  const handleNewSlotChange = (field: keyof Slot, value: any) => {
    setNewSlot({
      ...newSlot,
      [field]: value
    });
  };
  
  const handleCreateSlot = async () => {
    if (!newSlotKey) {
      toast.error("Please provide a slot key");
      return;
    }
    
    try {
      await setData(`/settings/slots/${newSlotKey}`, newSlot);
      toast.success(`${newSlotKey} created successfully`);
      
      // Update local state immediately
      setLocalSlots(prev => ({
        ...prev,
        [newSlotKey]: newSlot
      }));
      
      setEditedSlots(prev => ({
        ...prev,
        [newSlotKey]: newSlot
      }));
      
      // Reset form and close dialog
      setNewSlotKey("");
      setNewSlot({
        enabled: true,
        frequency: "daily",
        last_update: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        required_amount: 12,
        slot_start: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        slot_end: format(addDays(new Date(), 1), 'yyyy-MM-dd HH:mm:ss')
      });
      setIsAddingSlot(false);
    } catch (error) {
      console.error("Error creating slot:", error);
      toast.error("Failed to create slot");
    }
  };
  
  const handleDateChange = (slotKey: string, type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    if (type === 'start') {
      setStartDate(date);
      // Maintain the time part from the existing start time
      try {
        const existingDate = parse(editedSlots[slotKey].slot_start, 'yyyy-MM-dd HH:mm:ss', new Date());
        const hours = existingDate.getHours();
        const minutes = existingDate.getMinutes();
        const seconds = existingDate.getSeconds();
        
        date.setHours(hours, minutes, seconds);
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        
        handleInputChange(slotKey, 'slot_start', formattedDate);
      } catch (e) {
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        handleInputChange(slotKey, 'slot_start', formattedDate);
      }
    } else {
      setEndDate(date);
      // Maintain the time part from the existing end time
      try {
        const existingDate = parse(editedSlots[slotKey].slot_end, 'yyyy-MM-dd HH:mm:ss', new Date());
        const hours = existingDate.getHours();
        const minutes = existingDate.getMinutes();
        const seconds = existingDate.getSeconds();
        
        date.setHours(hours, minutes, seconds);
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        
        handleInputChange(slotKey, 'slot_end', formattedDate);
      } catch (e) {
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        handleInputChange(slotKey, 'slot_end', formattedDate);
      }
    }
  };
  
  // Format time period
  const formatTimePeriod = (startDate: string, endDate: string): string => {
    try {
      const start = format(parse(startDate, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM d, yyyy hh:mm a');
      const end = format(parse(endDate, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM d, yyyy hh:mm a');
      return `${start} - ${end}`;
    } catch (e) {
      return `${startDate} - ${endDate}`;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slots Management</h2>
        <Button onClick={() => setIsAddingSlot(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Slot
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(localSlots).map(([slotKey, slot]) => {
          const isEditing = editingSlot === slotKey;
          const currentSlot = isEditing ? editedSlots[slotKey] : slot;
          
          if (isEditing) {
            return (
              <Card key={slotKey} className="overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-2xl font-semibold">{slotKey}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={currentSlot.enabled}
                        onCheckedChange={(checked) => handleInputChange(slotKey, 'enabled', checked)}
                      />
                      <Label>{currentSlot.enabled ? 'Enabled' : 'Disabled'}</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={currentSlot.frequency}
                        onValueChange={(value) => handleInputChange(slotKey, 'frequency', value)}
                      >
                        <SelectTrigger>
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
                    
                    <div className="space-y-2">
                      <Label>Required Amount</Label>
                      <Input
                        type="number"
                        value={currentSlot.required_amount}
                        onChange={(e) => handleInputChange(slotKey, 'required_amount', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <div className="flex">
                        <Input
                          value={currentSlot.slot_start}
                          onChange={(e) => handleInputChange(slotKey, 'slot_start', e.target.value)}
                          className="flex-1"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="ml-2">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(date) => handleDateChange(slotKey, 'start', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <div className="flex">
                        <Input
                          value={currentSlot.slot_end}
                          onChange={(e) => handleInputChange(slotKey, 'slot_end', e.target.value)}
                          className="flex-1"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="ml-2">
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={(date) => handleDateChange(slotKey, 'end', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    <Button onClick={() => handleSaveSlot(slotKey)}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <Card key={slotKey} className="overflow-hidden bg-card">
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-4">{slotKey}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${currentSlot.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-lg">{currentSlot.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="text-lg">{currentSlot.frequency}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Required Amount</p>
                        <p className="text-lg">₹{currentSlot.required_amount}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time Period</p>
                        <p className="text-sm">{formatTimePeriod(currentSlot.slot_start, currentSlot.slot_end)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p>{formatDateTime(currentSlot.last_update)}</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="destructive"
                      onClick={() => confirmDeleteSlot(slotKey)}
                      className="px-4"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                    
                    <Button 
                      variant={currentSlot.enabled ? "destructive" : "success"}
                      onClick={() => handleToggleSlot(slotKey, !currentSlot.enabled)}
                      className="px-6"
                    >
                      {currentSlot.enabled ? "Disable" : "Enable"}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleEditSlot(slotKey)}
                      className="px-4"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Add Slot Dialog */}
      <AlertDialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new slot for booking
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Slot Key</Label>
              <Input
                placeholder="e.g., slot_4"
                value={newSlotKey}
                onChange={(e) => setNewSlotKey(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newSlot.enabled}
                onCheckedChange={(checked) => handleNewSlotChange('enabled', checked)}
              />
              <Label>{newSlot.enabled ? 'Enabled' : 'Disabled'}</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={newSlot.frequency}
                onValueChange={(value) => handleNewSlotChange('frequency', value)}
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label>Required Amount</Label>
              <Input
                type="number"
                value={newSlot.required_amount}
                onChange={(e) => handleNewSlotChange('required_amount', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                value={newSlot.slot_start}
                onChange={(e) => handleNewSlotChange('slot_start', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                value={newSlot.slot_end}
                onChange={(e) => handleNewSlotChange('slot_end', e.target.value)}
              />
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
        open={deleteConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({open: false, slotKey: ""});
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmation.slotKey}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSlot}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
