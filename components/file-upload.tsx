"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, FileText, ImageIcon, Code, File } from "lucide-react"
import Image from "next/image"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onCancel: () => void
  allowedTypes?: string
  maxSize?: number // in MB
}

export function FileUpload({ onFileSelect, onCancel, allowedTypes = "*", maxSize = 10 }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the ${maxSize}MB limit`)
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const createDownloadLink = (file: File): string => {
    // In a real app, you would upload this to your server and return a URL
    // For this demo, we're creating a local object URL
    return URL.createObjectURL(file)
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)

        // Create a downloadable URL for the file
        const downloadUrl = createDownloadLink(file)

        // In a real app, you'd send both the file name and the download URL
        onFileSelect(file)

        // For demo purposes, add the URL to the file object
        // In a real implementation, you'd send this URL to your server
        Object.assign(file, { downloadUrl })
      }
    }, 200)
  }

  const getFileIcon = () => {
    if (!file) return <File className="h-8 w-8" />

    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    } else if (
      file.name.endsWith(".js") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".jsx") ||
      file.name.endsWith(".tsx")
    ) {
      return <Code className="h-8 w-8 text-yellow-500" />
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const getFileTypeLabel = () => {
    if (!file) return "No file selected"

    if (file.type.startsWith("image/")) {
      return "Image"
    } else if (file.name.match(/\.(js|ts|jsx|tsx)$/)) {
      return "JavaScript/TypeScript"
    } else if (file.name.match(/\.(py)$/)) {
      return "Python"
    } else if (file.name.match(/\.(java)$/)) {
      return "Java"
    } else if (file.name.match(/\.(html|css)$/)) {
      return "Web"
    } else {
      return "Document"
    }
  }

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Upload File</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {!file ? (
        <div
          className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept={allowedTypes} />
          <div className="flex flex-col items-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">
              {allowedTypes === "*" ? "Support for all file types" : `Supports ${allowedTypes}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Max {maxSize}MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-muted rounded-md">
            {preview ? (
              <div className="relative h-16 w-16 rounded overflow-hidden mr-3">
                <Image src={preview || "/placeholder.svg"} alt="Preview" fill style={{ objectFit: "cover" }} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 w-16 bg-background rounded mr-3">
                {getFileIcon()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel()} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {isUploading && <Progress value={progress} className="h-1 mt-2" />}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => {
                setFile(null)
                setPreview(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Send"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  )
}
