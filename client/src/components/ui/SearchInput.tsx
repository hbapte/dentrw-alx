"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
  autoFocus?: boolean
  debounceTime?: number
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  className = "",
  autoFocus = false,
  debounceTime = 300,
}) => {
  const [localValue, setLocalValue] = useState(value)

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce the onChange handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceTime)

    return () => {
      clearTimeout(handler)
    }
  }, [localValue, onChange, value, debounceTime])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(localValue)
    }
  }

  const handleClear = () => {
    setLocalValue("")
    onChange("")
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      {localValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
          onClick={handleClear}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
