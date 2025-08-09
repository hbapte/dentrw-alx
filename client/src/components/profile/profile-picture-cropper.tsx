// components\profile\profile-picture-cropper.tsx
"use client"

import React, { type SyntheticEvent } from "react"
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CropIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import "react-image-crop/dist/ReactCrop.css"

interface ProfilePictureCropperProps {
  dialogOpen: boolean
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  imageUrl: string | null
  onCropComplete: (croppedFile: File) => Promise<void>
  firstName: string
  lastName: string
  isUploading?: boolean
}

export function ProfilePictureCropper({
  dialogOpen,
  setDialogOpen,
  imageUrl,
  onCropComplete,
  firstName,
  lastName,
  isUploading = false,
}: ProfilePictureCropperProps) {
  const aspect = 1 // Square aspect ratio for profile pictures
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>("")

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  function onCropChange(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop)
      setCroppedImageUrl(croppedImageUrl)
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Set canvas size to desired output size (300x300 for profile pictures)
    const outputSize = 300
    canvas.width = outputSize
    canvas.height = outputSize

    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        outputSize,
        outputSize,
      )
    }

    return canvas.toDataURL("image/jpeg", 0.9) // High quality JPEG
  }

  // Convert data URL to File
  function dataURLToFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  async function onCrop() {
    try {
      if (!croppedImageUrl) {
        toast.error("Please select a crop area")
        return
      }

      // Convert the cropped image to a File
      const croppedFile = dataURLToFile(croppedImageUrl, `${firstName}-${lastName}-profile.jpg`)

      // Call the upload function
      await onCropComplete(croppedFile)

      // Close dialog and reset state
      setDialogOpen(false)
      setCrop(undefined)
      setCroppedImageUrl("")
    } catch (error) {
      console.error("Error during crop:", error)
      toast.error("Failed to process image. Please try again.")
    }
  }

  const handleCancel = () => {
    setDialogOpen(false)
    setCrop(undefined)
    setCroppedImageUrl("")
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>

        <div className="p-6 w-full">
          {imageUrl && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => onCropChange(c)}
              aspect={aspect}
              className="w-full max-w-full"
              minWidth={50}
              minHeight={50}
            >
              <img
                ref={imgRef}
                className="max-w-full max-h-96 object-contain"
                alt="Crop preview"
                src={imageUrl || "/placeholder.svg"}
                onLoad={onImageLoad}
                style={{ display: "block" }}
              />
            </ReactCrop>
          )}

          {!imageUrl && (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <Avatar className="size-24">
                <AvatarFallback className="text-2xl">{getInitials(firstName, lastName)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 justify-center gap-3">
          <DialogClose asChild>
            <Button size="sm" type="button" variant="outline" onClick={handleCancel} disabled={isUploading}>
              <Trash2Icon className="mr-1.5 size-4" />
              Cancel
            </Button>
          </DialogClose>

          <Button type="button" size="sm" onClick={onCrop} disabled={!croppedImageUrl || isUploading}>
            <CropIcon className="mr-1.5 size-4" />
            {isUploading ? "Uploading..." : "Crop & Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to center the crop
export function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 80, // Start with 80% of the image
        height: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}
