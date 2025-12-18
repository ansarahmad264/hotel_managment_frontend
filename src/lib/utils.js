import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Shorten text
export function shortText(text, limit) {
  if (text.length > 0) {
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  }
}
