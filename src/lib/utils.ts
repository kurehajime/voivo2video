import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // Tailwind の className を安全に結合
  return twMerge(clsx(inputs));
}
