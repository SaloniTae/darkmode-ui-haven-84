
import { Slots } from "@/types/database";

export const updateSlots = (slots: Slots, callback: (slots: Slots) => void) => {
  // Make a deep copy of the slots
  const updatedSlots = JSON.parse(JSON.stringify(slots));
  callback(updatedSlots);
  return updatedSlots;
};
