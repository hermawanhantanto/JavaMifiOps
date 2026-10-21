import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce search input values.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to delay updating the value (default: 350ms)
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
