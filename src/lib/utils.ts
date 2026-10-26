import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names, letting later Tailwind classes win over earlier ones (`cn("px-2", "px-4")` is `"px-4"`). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
