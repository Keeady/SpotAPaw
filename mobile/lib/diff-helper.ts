/*import isEqual from "lodash/isEqual";

export function getChanges<T extends Record<string, any>>(
  saved: T,
  current: T
): Partial<T> {
  const changes: Partial<T> = {};
  for (const key of Object.keys(current) as (keyof T)[]) {
    if (!isEqual(saved[key], current[key])) {
      changes[key] = current[key];
    }
  }
  return changes;
}
*/