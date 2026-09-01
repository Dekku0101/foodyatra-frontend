import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Centralized Food Type Normalizer
 * Normalizes any string, boolean, number, or food item object to 'veg' or 'non-veg'
 */
export const normalizeFoodType = (input: any): 'veg' | 'non-veg' => {
  if (input === null || input === undefined) return 'veg';

  // If input is an object (e.g. food item or restaurant)
  if (typeof input === 'object') {
    if (input.isVeg === false || input.isVeg === 'false' || input.isVeg === 0) {
      return 'non-veg';
    }
    if (input.isVeg === true || input.isVeg === 'true' || input.isVeg === 1) {
      return 'veg';
    }

    const checkStr = [
      input.foodType,
      input.category,
      input.type,
      input.name,
      input.dishName,
      ...(Array.isArray(input.tags) ? input.tags : [])
    ].filter(Boolean).join(' ').toLowerCase();

    if (
      checkStr.includes('non-veg') ||
      checkStr.includes('non veg') ||
      checkStr.includes('nonveg') ||
      checkStr.includes('chicken') ||
      checkStr.includes('mutton') ||
      checkStr.includes('fish') ||
      checkStr.includes('seafood') ||
      checkStr.includes('kebab') ||
      checkStr.includes('tandoori')
    ) {
      return 'non-veg';
    }

    return 'veg';
  }

  // If input is a raw primitive string/boolean/number
  const str = String(input).trim().toLowerCase();
  if (
    str === 'false' ||
    str === '0' ||
    str === 'non-veg' ||
    str === 'non veg' ||
    str === 'nonveg' ||
    str === 'nonvegetarian' ||
    str === 'non_veg'
  ) {
    return 'non-veg';
  }

  if (
    str === 'true' ||
    str === '1' ||
    str === 'veg' ||
    str === 'vegetarian'
  ) {
    return 'veg';
  }

  return str.includes('non') ? 'non-veg' : 'veg';
};

