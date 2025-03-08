"use client"

import { useState, useEffect, useRef } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true)

  // Initialize the state
  useEffect(() => {
    try {
      // Only try to get from localStorage on first render
      if (isFirstRender.current) {
        isFirstRender.current = false

        // Get from local storage by key
        const item = window.localStorage.getItem(key)
        // Parse stored json or if none return initialValue
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (error) {
      // If error also return initialValue
      console.error(error)
    }
  }, [key, initialValue])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Only update state if value is different
      if (JSON.stringify(valueToStore) !== JSON.stringify(storedValue)) {
        // Save state
        setStoredValue(valueToStore)
      }

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

