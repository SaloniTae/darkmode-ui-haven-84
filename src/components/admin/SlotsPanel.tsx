
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
import { CalendarIcon, CheckCircle, Clock, XCircle, Edit, Save, PlusCircle, Trash2 } from "lucide-react";
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
      return format(parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date()), 'PPP p');
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
  
  const handleNewSlotDateChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    if (type === 'start') {
      // Maintain the time part from the existing start time
      try {
        const existingDate = parse(newSlot.slot_start, 'yyyy-MM-dd HH:mm:ss', new Date());
        const hours = existingDate.getHours();
        const minutes = existingDate.getMinutes();
        const seconds = existingDate.getSeconds();
        
        date.setHours(hours, minutes, seconds);
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        
        handleNewSlotChange('slot_start', formattedDate);
      } catch (e) {
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        handleNewSlotChange('slot_start', formattedDate);
      }
    } else {
      // Maintain the time part from the existing end time
      try {
        const existingDate = parse(newSlot.slot_end, 'yyyy-MM-dd HH:mm:ss', new Date());
        const hours = existingDate.getHours();
        const minutes = existingDate.getMinutes();
        const seconds = existingDate.getSeconds();
        
        date.setHours(hours, minutes, seconds);
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        
        handleNewSlotChange('slot_end', formattedDate);
      } catch (e) {
        const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
        handleNewSlotChange('slot_end', formattedDate);
      }
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slots Management</h2>
        <Button onClick={() => setIsAddingSlot(true)}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Slot
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(localSlots).map(([slotKey, slot]) => {
          const isEditing = editingSlot === slotKey;
          const currentSlot = isEditing ? editedSlots[slotKey] : slot;
          
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
                        <Switch
                          checked={currentSlot.enabled}
                          onCheckedChange={(checked) => handleInputChange(slotKey, 'enabled', checked)}
                          id={`${slotKey}-enabled`}
                        />
                        <Label htmlFor={`${slotKey}-enabled`}>{currentSlot.enabled ? 'Enabled' : 'Disabled'}</Label>
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
                          <SelectContent className="bg-background border border-input">
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="3day">3 Days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-required-amount`}>Required Amount</Label>
                        <Input
                          id={`${slotKey}-required-amount`}
                          type="number"
                          value={currentSlot.required_amount}
                          onChange={(e) => handleInputChange(slotKey, 'required_amount', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`${slotKey}-start-date`}>Start Date</Label>
                          <div className="flex">
                            <Input
                              id={`${slotKey}-start-date`}
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
                              <PopoverContent className="w-auto p-0 bg-popover">
                                <Calendar
                                  mode="single"
                                  selected={startDate}
                                  onSelect={(date) => handleDateChange(slotKey, 'start', date)}
                                  initialFocus
                                  className="bg-background"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor={`${slotKey}-end-date`}>End Date</Label>
                          <div className="flex">
                            <Input
                              id={`${slotKey}-end-date`}
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
                              <PopoverContent className="w-auto p-0 bg-popover">
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={(date) => handleDateChange(slotKey, 'end', date)}
                                  initialFocus
                                  className="bg-background"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {currentSlot.enabled ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium">Enabled</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium">Disabled</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{currentSlot.frequency}</span>
                      </div>
                    </div>
                    
                    <div className="glass-morphism p-3 rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Required Amount</p>
                      <p className="font-medium text-lg">₹{currentSlot.required_amount}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="glass-morphism p-3 rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">Start Time</p>
                        <p className="font-medium text-sm">{formatDateTime(currentSlot.slot_start)}</p>
                      </div>
                      
                      <div className="glass-morphism p-3 rounded-md">
                        <p className="text-sm text-muted-foreground mb-1">End Time</p>
                        <p className="font-medium text-sm">{formatDateTime(currentSlot.slot_end)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDeleteSlot(slotKey)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                      </Button>
                      <Button 
                        variant={currentSlot.enabled ? "destructive" : "outline"} 
                        size="sm"
                        onClick={() => handleToggleSlot(slotKey, !currentSlot.enabled)}
                      >
                        {currentSlot.enabled ? "Disable" : "Enable"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditSlot(slotKey)}
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" /> Edit
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
      <AlertDialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new slot for booking
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
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newSlot.enabled}
                onCheckedChange={(checked) => handleNewSlotChange('enabled', checked)}
                id="new-slot-enabled"
              />
              <Label htmlFor="new-slot-enabled">{newSlot.enabled ? 'Enabled' : 'Disabled'}</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-slot-frequency">Frequency</Label>
              <Select
                value={newSlot.frequency}
                onValueChange={(value) => handleNewSlotChange('frequency', value)}
              >
                <SelectTrigger id="new-slot-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-input">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="3day">3 Days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-slot-required-amount">Required Amount</Label>
              <Input
                id="new-slot-required-amount"
                type="number"
                value={newSlot.required_amount}
                onChange={(e) => handleNewSlotChange('required_amount', parseInt(e.target.value))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-slot-start-date">Start Date</Label>
                <div className="flex">
                  <Input
                    id="new-slot-start-date"
                    value={newSlot.slot_start}
                    onChange={(e) => handleNewSlotChange('slot_start', e.target.value)}
                    className="flex-1"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="ml-2">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover">
                      <Calendar
                        mode="single"
                        selected={parse(newSlot.slot_start, 'yyyy-MM-dd HH:mm:ss', new Date())}
                        onSelect={(date) => handleNewSlotDateChange('start', date)}
                        initialFocus
                        className="bg-background"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-slot-end-date">End Date</Label>
                <div className="flex">
                  <Input
                    id="new-slot-end-date"
                    value={newSlot.slot_end}
                    onChange={(e) => handleNewSlotChange('slot_end', e.target.value)}
                    className="flex-1"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="ml-2">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover">
                      <Calendar
                        mode="single"
                        selected={parse(newSlot.slot_end, 'yyyy-MM-dd HH:mm:ss', new Date())}
                        onSelect={(date) => handleNewSlotDateChange('end', date)}
                        initialFocus
                        className="bg-background"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
        open={deleteConfirmation.open} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmation({open: false, slotKey: ""});
          }
        }}
      >
        <AlertDialogContent className="bg-background">
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
