"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/file-upload"
import { LanguageSelector } from "@/components/language-selector"
import { Send, Code, Paperclip, Smile, ImageIcon, FileCode, Mic, MoreHorizontal } from "lucide-react"

interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onFileUpload?: (file: File) => void
  onStartAudioCall?: () => void
  isLoading: boolean
}

export function ChatInput({ value, onChange, onSubmit, onFileUpload, onStartAudioCall, isLoading }: ChatInputProps) {
  const [inputRows, setInputRows] = useState(1)
  const [inputMode, setInputMode] = useState<"text" | "code">("text")
  const [language, setLanguage] = useState("javascript")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const rows = value.split("\n").length
    setInputRows(Math.min(5, Math.max(1, rows)))
  }, [value])

  const handleFileButtonClick = () => {
    setShowFileUpload(true)
  }

  const handleFileSelect = (file: File) => {
    if (onFileUpload) {
      // Check if file has a downloadUrl property added by the FileUpload component
      const downloadUrl = (file as any).downloadUrl

      if (downloadUrl) {
        // Send a message with a download link
        const fileMessage = `[Archivo adjunto: ${file.name}](${downloadUrl})`
        if (value.trim()) {
          // If there's text in the input, append the file link
          onFileUpload({ ...file, message: `${value}\n\n${fileMessage}` })
        } else {
          // Otherwise just send the file link
          onFileUpload({ ...file, message: fileMessage })
        }
      } else {
        onFileUpload(file)
      }
    }
    setShowFileUpload(false)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(e)
    }
  }

  return (
    <form onSubmit={handleFormSubmit}>
      {showFileUpload ? (
        <FileUpload
          onFileSelect={handleFileSelect}
          onCancel={() => setShowFileUpload(false)}
          allowedTypes="image/*,.pdf,.doc,.docx,.js,.ts,.py,.java,.html,.css,.json"
        />
      ) : (
        <>
          <Tabs defaultValue="text" onValueChange={(value) => setInputMode(value as "text" | "code")}>
            <TabsList className="mb-2">
              <TabsTrigger value="text" className="data-[state=active]:bg-primary">
                Text
              </TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-primary">
                Code
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              {inputMode === "code" && (
                <div className="mb-2">
                  <LanguageSelector value={language} onValueChange={setLanguage} />
                </div>
              )}
              <textarea
                value={value}
                onChange={onChange}
                placeholder={inputMode === "text" ? "Type a message..." : "Paste or type code..."}
                className={`w-full px-3 py-2 pr-24 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none ${
                  inputMode === "code" ? "font-mono" : ""
                }`}
                rows={inputRows}
              />

              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleFileButtonClick}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  {inputMode === "text" ? <Smile className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !value.trim()}
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-t-transparent border-background rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Tabs>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                <span>Image</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                <Code className="h-3 w-3 mr-1" />
                <span>Snippet</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={onStartAudioCall}
              >
                <Mic className="h-3 w-3 mr-1" />
                <span>Voice</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <span>Markdown supported</span>
            </div>
          </div>
        </>
      )}
    </form>
  )
}
