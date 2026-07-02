/**
 * Shared helper functions used across the app.
 * Add small, reusable utilities here as the project grows.
 */

/** Joins class names into a single string, skipping empty values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
