import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sliceText(text: string, length: number) {
  if (text.length < length) return text;
  return text.slice(0, length) + "...";
}

export function formatNumber(value: number): string {
  if (!value) return '0';
  
  if (value < 0.000001) {
    return value.toExponential(4);
  }
  
  if (value < 1) {
    return value.toFixed(6);
  }
  
  if (value < 1000) {
    return value.toFixed(2);
  }
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export const formatCompact = (num: number, toFixed: number = 2, skipLevel: number = 0): string => {
  const toFixedFnc = (num: number, newToFixed?: number): string | number => {
    if (!newToFixed && toFixed === 0) return num;
    return num.toFixed(newToFixed || toFixed);
  }
  
  if (!num) return "--";
  if (num >= 1e9) return `${toFixedFnc(num / 1e9, 2)}B`;
  if (num >= 1e6) return `${toFixedFnc(num / 1e6, 2)}M`;
  if (skipLevel < 3 && num >= 1e3) return `${toFixedFnc(num / 1e3)}K`;
  
  return toFixedFnc(num).toString();
};
