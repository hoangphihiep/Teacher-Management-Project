import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

export function findFractionalIndex(
  scheduleTime: number,
  parsedSlots: number[]
): number {
  for (let i = 0; i < parsedSlots.length - 1; i++) {
    const slotStart = parsedSlots[i];
    const slotEnd = parsedSlots[i + 1];

    if (scheduleTime === slotStart) return i;
    if (scheduleTime > slotStart && scheduleTime < slotEnd) {
      const fraction = (scheduleTime - slotStart) / (slotEnd - slotStart);
      return i + fraction;
    }
  }

  return parsedSlots.length - 1;
}