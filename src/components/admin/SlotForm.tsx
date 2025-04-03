
import { Slot } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateTimePicker } from "./DateTimePicker";
import { Save } from "lucide-react";

interface SlotFormProps {
  slotData: Slot;
  onSlotChange: (field: keyof Slot, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  slotKey?: string;
}

export function SlotForm({ slotData, onSlotChange, onSave, onCancel, slotKey }: SlotFormProps) {
  const handleDateTimeSelect = (field: 'slot_start' | 'slot_end' | 'last_update', date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd HH:mm:ss");
    onSlotChange(field, formattedDate);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`${slotKey || 'new'}-enabled`}
          checked={slotData.enabled}
          onCheckedChange={(checked) => onSlotChange('enabled', checked === true)}
        />
        <Label htmlFor={`${slotKey || 'new'}-enabled`} className="text-sm font-medium">
          Enabled
        </Label>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`${slotKey || 'new'}-frequency`}>Frequency</Label>
        <Select
          value={slotData.frequency}
          onValueChange={(value) => onSlotChange('frequency', value)}
        >
          <SelectTrigger id={`${slotKey || 'new'}-frequency`}>
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
        <Label htmlFor={`${slotKey || 'new'}-amount`}>Required Amount</Label>
        <Input
          id={`${slotKey || 'new'}-amount`}
          type="number"
          value={slotData.required_amount}
          onChange={(e) => onSlotChange('required_amount', parseInt(e.target.value))}
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`${slotKey || 'new'}-start`}>Slot Start</Label>
        <div className="flex items-center gap-2">
          <Input
            id={`${slotKey || 'new'}-start`}
            value={slotData.slot_start}
            onChange={(e) => onSlotChange('slot_start', e.target.value)}
            className="flex-1"
          />
          <DateTimePicker 
            value={slotData.slot_start}
            onChange={(date) => handleDateTimeSelect('slot_start', date)}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`${slotKey || 'new'}-end`}>Slot End</Label>
        <div className="flex items-center gap-2">
          <Input
            id={`${slotKey || 'new'}-end`}
            value={slotData.slot_end}
            onChange={(e) => onSlotChange('slot_end', e.target.value)}
            className="flex-1"
          />
          <DateTimePicker 
            value={slotData.slot_end}
            onChange={(date) => handleDateTimeSelect('slot_end', date)}
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`${slotKey || 'new'}-last-update`}>Last Update</Label>
        <div className="flex items-center gap-2">
          <Input
            id={`${slotKey || 'new'}-last-update`}
            value={slotData.last_update}
            onChange={(e) => onSlotChange('last_update', e.target.value)}
            className="flex-1"
          />
          <DateTimePicker 
            value={slotData.last_update}
            onChange={(date) => handleDateTimeSelect('last_update', date)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>
    </div>
  );
}
