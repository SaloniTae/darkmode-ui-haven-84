
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { parseSlotDateTime, getTimePickerValues } from "@/utils/dateFormatUtils";

interface DateTimePickerProps {
  value: string;
  onChange: (date: Date) => void;
  align?: "start" | "center" | "end";
}

export function DateTimePicker({ value, onChange, align = "end" }: DateTimePickerProps) {
  const { hours, minutes, periods } = getTimePickerValues();
  const selectedDate = parseSlotDateTime(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                const currentDateTime = selectedDate;
                const newDate = new Date(date);
                newDate.setHours(
                  currentDateTime.getHours(),
                  currentDateTime.getMinutes()
                );
                onChange(newDate);
              }
            }}
            initialFocus
            className="pointer-events-auto"
          />
          <div className="mt-4 p-2 border-t pt-4">
            <p className="text-sm font-medium mb-2">Time</p>
            <div className="flex items-center gap-2">
              <div className="relative w-20">
                <Select 
                  value={format(selectedDate, 'h')}
                  onValueChange={(hour) => {
                    const date = new Date(selectedDate);
                    const isPM = date.getHours() >= 12;
                    const hourValue = parseInt(hour);
                    date.setHours(isPM ? (hourValue === 12 ? 12 : hourValue + 12) : (hourValue === 12 ? 0 : hourValue));
                    onChange(date);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-52">
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <span className="flex items-center">:</span>
              <div className="relative w-20">
                <Select 
                  value={format(selectedDate, 'mm')}
                  onValueChange={(minute) => {
                    const date = new Date(selectedDate);
                    date.setMinutes(parseInt(minute));
                    onChange(date);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-52">
                      {minutes.map((minute) => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-20">
                <Select 
                  value={format(selectedDate, 'a')}
                  onValueChange={(period) => {
                    const date = new Date(selectedDate);
                    const currentHour = date.getHours();
                    const isPM = period === 'PM';
                    
                    if (isPM && currentHour < 12) {
                      date.setHours(currentHour + 12);
                    } else if (!isPM && currentHour >= 12) {
                      date.setHours(currentHour - 12);
                    }
                    
                    onChange(date);
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
  );
}
