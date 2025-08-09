"use client"

import { useState, useCallback } from "react"

interface UseImagePreviewReturn {
  preview: string | null
  createPreview: (file: File) => void
  clearPreview: () => void
}

export const useImagePreview = (): UseImagePreviewReturn => {
  const [preview, setPreview] = useState<string | null>(null)

  const createPreview = useCallback(
    (file: File) => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }

      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
    },
    [preview],
  )

  const clearPreview = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
    }
  }, [preview])

  return {
    preview,
    createPreview,
    clearPreview,
  }
}
