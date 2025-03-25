
import { useState } from "react";
import { Slots, Slot } from "@/types/database";
import { DataCard } from "@/components/ui/DataCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Save, Calendar, Clock, DollarSign, Check } from "lucide-react";
import { updateData } from "@/lib/firebase";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editedSlots, setEditedSlots] = useState<Slots>({ ...slots });
  const [confirmationDialog, setConfirmationDialog] = useState<{open: boolean; action: () => Promise<void>; title: string; description: string}>({
    open: false,
    action: async () => {},
    title: "",
    description: ""
  });

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
    
    setConfirmationDialog({
      open: true,
      action: async () => {
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
      },
      title: `${newEnabledValue ? 'Enable' : 'Disable'} ${slotKey}`,
      description: `Are you sure you want to ${newEnabledValue ? 'enable' : 'disable'} ${slotKey}?`
    });
  };

  const handleDateTimeSelect = (slotKey: string, field: 'slot_start' | 'slot_end' | 'last_update', date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");
      handleInputChange(slotKey, field, formattedDate);
    }
  };

  const parseSlotDateTime = (dateTimeStr: string): Date => {
    // Handle various date formats
    try {
      return parse(dateTimeStr, 'yyyy-MM-dd HH:mm:ss', new Date());
    } catch (error) {
      return new Date();
    }
  };

  const formatDateTimeForDisplay = (dateTimeStr: string): string => {
    try {
      const date = parse(dateTimeStr, 'yyyy-MM-dd HH:mm:ss', new Date());
      return format(date, 'MMM dd, yyyy hh:mm a'); // 12-hour format with AM/PM
    } catch (error) {
      return dateTimeStr;
    }
  };

  const getTimePickerValues = () => {
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')); // 12-hour format
    const minutes = ['00', '15', '30', '45'];
    const periods = ['AM', 'PM'];
    return { hours, minutes, periods };
  };
  
  const { hours, minutes, periods } = getTimePickerValues();

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
                        <div className="flex items-center gap-2">
                          <Input
                            id={`${slotKey}-start`}
                            value={currentSlot.slot_start}
                            onChange={(e) => handleInputChange(slotKey, 'slot_start', e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <div className="p-3">
                                <CalendarComponent
                                  mode="single"
                                  selected={parseSlotDateTime(currentSlot.slot_start)}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Preserve time when changing date
                                      const currentDateTime = parseSlotDateTime(currentSlot.slot_start);
                                      const newDate = new Date(date);
                                      newDate.setHours(
                                        currentDateTime.getHours(),
                                        currentDateTime.getMinutes()
                                      );
                                      handleDateTimeSelect(slotKey, 'slot_start', newDate);
                                    }
                                  }}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                                <div className="mt-4 p-2 border-t pt-4">
                                  <p className="text-sm font-medium mb-2">Time</p>
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_start), 'h')}
                                      onValueChange={(hour) => {
                                        const date = parseSlotDateTime(currentSlot.slot_start);
                                        const isPM = date.getHours() >= 12;
                                        const hourValue = parseInt(hour);
                                        date.setHours(isPM ? (hourValue === 12 ? 12 : hourValue + 12) : (hourValue === 12 ? 0 : hourValue));
                                        handleDateTimeSelect(slotKey, 'slot_start', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Hour" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {hours.map((hour) => (
                                          <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <span className="flex items-center">:</span>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_start), 'mm')}
                                      onValueChange={(minute) => {
                                        const date = parseSlotDateTime(currentSlot.slot_start);
                                        date.setMinutes(parseInt(minute));
                                        handleDateTimeSelect(slotKey, 'slot_start', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Min" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {minutes.map((minute) => (
                                          <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_start), 'a')}
                                      onValueChange={(period) => {
                                        const date = parseSlotDateTime(currentSlot.slot_start);
                                        const currentHour = date.getHours();
                                        const isPM = period === 'PM';
                                        
                                        if (isPM && currentHour < 12) {
                                          date.setHours(currentHour + 12);
                                        } else if (!isPM && currentHour >= 12) {
                                          date.setHours(currentHour - 12);
                                        }
                                        
                                        handleDateTimeSelect(slotKey, 'slot_start', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="AM/PM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {periods.map((period) => (
                                          <SelectItem key={period} value={period}>{period}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    className="w-full mt-3" 
                                    onClick={() => {
                                      toast.success("Time confirmed");
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Confirm Time
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-end`}>Slot End</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`${slotKey}-end`}
                            value={currentSlot.slot_end}
                            onChange={(e) => handleInputChange(slotKey, 'slot_end', e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <div className="p-3">
                                <CalendarComponent
                                  mode="single"
                                  selected={parseSlotDateTime(currentSlot.slot_end)}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Preserve time when changing date
                                      const currentDateTime = parseSlotDateTime(currentSlot.slot_end);
                                      const newDate = new Date(date);
                                      newDate.setHours(
                                        currentDateTime.getHours(),
                                        currentDateTime.getMinutes()
                                      );
                                      handleDateTimeSelect(slotKey, 'slot_end', newDate);
                                    }
                                  }}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                                <div className="mt-4 p-2 border-t pt-4">
                                  <p className="text-sm font-medium mb-2">Time</p>
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_end), 'h')}
                                      onValueChange={(hour) => {
                                        const date = parseSlotDateTime(currentSlot.slot_end);
                                        const isPM = date.getHours() >= 12;
                                        const hourValue = parseInt(hour);
                                        date.setHours(isPM ? (hourValue === 12 ? 12 : hourValue + 12) : (hourValue === 12 ? 0 : hourValue));
                                        handleDateTimeSelect(slotKey, 'slot_end', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Hour" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {hours.map((hour) => (
                                          <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <span className="flex items-center">:</span>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_end), 'mm')}
                                      onValueChange={(minute) => {
                                        const date = parseSlotDateTime(currentSlot.slot_end);
                                        date.setMinutes(parseInt(minute));
                                        handleDateTimeSelect(slotKey, 'slot_end', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Min" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {minutes.map((minute) => (
                                          <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.slot_end), 'a')}
                                      onValueChange={(period) => {
                                        const date = parseSlotDateTime(currentSlot.slot_end);
                                        const currentHour = date.getHours();
                                        const isPM = period === 'PM';
                                        
                                        if (isPM && currentHour < 12) {
                                          date.setHours(currentHour + 12);
                                        } else if (!isPM && currentHour >= 12) {
                                          date.setHours(currentHour - 12);
                                        }
                                        
                                        handleDateTimeSelect(slotKey, 'slot_end', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="AM/PM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {periods.map((period) => (
                                          <SelectItem key={period} value={period}>{period}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    className="w-full mt-3" 
                                    onClick={() => {
                                      toast.success("Time confirmed");
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Confirm Time
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`${slotKey}-last-update`}>Last Update</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`${slotKey}-last-update`}
                            value={currentSlot.last_update}
                            onChange={(e) => handleInputChange(slotKey, 'last_update', e.target.value)}
                            className="flex-1"
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <div className="p-3">
                                <CalendarComponent
                                  mode="single"
                                  selected={parseSlotDateTime(currentSlot.last_update)}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Preserve time when changing date
                                      const currentDateTime = parseSlotDateTime(currentSlot.last_update);
                                      const newDate = new Date(date);
                                      newDate.setHours(
                                        currentDateTime.getHours(),
                                        currentDateTime.getMinutes()
                                      );
                                      handleDateTimeSelect(slotKey, 'last_update', newDate);
                                    }
                                  }}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                                <div className="mt-4 p-2 border-t pt-4">
                                  <p className="text-sm font-medium mb-2">Time</p>
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.last_update), 'h')}
                                      onValueChange={(hour) => {
                                        const date = parseSlotDateTime(currentSlot.last_update);
                                        const isPM = date.getHours() >= 12;
                                        const hourValue = parseInt(hour);
                                        date.setHours(isPM ? (hourValue === 12 ? 12 : hourValue + 12) : (hourValue === 12 ? 0 : hourValue));
                                        handleDateTimeSelect(slotKey, 'last_update', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Hour" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {hours.map((hour) => (
                                          <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <span className="flex items-center">:</span>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.last_update), 'mm')}
                                      onValueChange={(minute) => {
                                        const date = parseSlotDateTime(currentSlot.last_update);
                                        date.setMinutes(parseInt(minute));
                                        handleDateTimeSelect(slotKey, 'last_update', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="Min" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {minutes.map((minute) => (
                                          <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select 
                                      value={format(parseSlotDateTime(currentSlot.last_update), 'a')}
                                      onValueChange={(period) => {
                                        const date = parseSlotDateTime(currentSlot.last_update);
                                        const currentHour = date.getHours();
                                        const isPM = period === 'PM';
                                        
                                        if (isPM && currentHour < 12) {
                                          date.setHours(currentHour + 12);
                                        } else if (!isPM && currentHour >= 12) {
                                          date.setHours(currentHour - 12);
                                        }
                                        
                                        handleDateTimeSelect(slotKey, 'last_update', date);
                                      }}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue placeholder="AM/PM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {periods.map((period) => (
                                          <SelectItem key={period} value={period}>{period}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button 
                                    className="w-full mt-3" 
                                    onClick={() => {
                                      toast.success("Time confirmed");
                                    }}
                                  >
                                    <Check className="h-4 w-4 mr-2" /> Confirm Time
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
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
                            <p className="font-medium text-base">{currentSlot.frequency}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Required Amount</p>
                            <p className="font-medium text-base">₹{currentSlot.required_amount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Time Period</p>
                            <p className="font-medium text-sm">
                              {formatDateTimeForDisplay(currentSlot.slot_start)} - 
                              {formatDateTimeForDisplay(currentSlot.slot_end)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-gray-700/30">
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="font-medium text-xs">{formatDateTimeForDisplay(currentSlot.last_update)}</p>
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

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmationDialog.open} 
        onOpenChange={(open) => {
          if (!open) {
            setConfirmationDialog({...confirmationDialog, open: false});
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await confirmationDialog.action();
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
