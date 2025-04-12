"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useChat } from "@/components/chat-context"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface ChatMessageProps {
  message: {
    id: string
    from: string
    to?: string
    content: string
    timestamp: string
    status?: string
    read?: boolean
    threadId?: string
    groupId?: string
    fromUser?: {
      name: string
    }
  }
  onThreadClick?: () => void
}

export function ChatMessage({ message, onThreadClick }: ChatMessageProps) {
  const [liked, setLiked] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { currentUser, markAsRead } = useChat()

  // Process message content to detect code blocks
  const processMessageContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        })
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2],
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      })
    }

    return parts.length > 0 ? parts : [{ type: "text", content }]
  }

  // Add this function after the processMessageContent function:
  const processFileLinks = (content: string) => {
    const fileLinkRegex = /\[Archivo adjunto: (.*?)\]$$(.*?)$$/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = fileLinkRegex.exec(content)) !== null) {
      // Add text before file link
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        })
      }

      // Add file download link
      parts.push({
        type: "file",
        fileName: match[1],
        downloadUrl: match[2],
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      })
    }

    return parts.length > 0 ? parts : [{ type: "text", content }]
  }

  // Mark message as read if not from current user and not read
  if (message.from !== currentUser.id && message.status !== "read") {
    markAsRead(message.id)
  }

  const isUser = message.from === currentUser.id
  const name = isUser ? currentUser.name : message.fromUser?.name || `Usuario ${message.from}` || "Contacto"
  const initials = isUser ? currentUser.name.charAt(0).toUpperCase() : message.from.charAt(0).toUpperCase()

  // Format timestamp
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: es,
  })

  // Toggle actions visibility
  const toggleActions = () => {
    setShowActions(!showActions)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`} onClick={toggleActions}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div className="flex items-center mb-1">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={isUser ? "/placeholder.svg?height=32&width=32" : undefined} />
            <AvatarFallback className={isUser ? "bg-primary" : "bg-secondary"}>{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{name}</span>
          <span className="text-xs text-muted-foreground ml-2">{formattedTime}</span>
          {message.status && isUser && (
            <span className="text-xs ml-2">
              {message.status === "sent" && <span className="text-muted-foreground">✓</span>}
              {message.status === "delivered" && <span className="text-muted-foreground">✓✓</span>}
              {message.status === "read" && <span className="text-primary">✓✓</span>}
            </span>
          )}
        </div>

        <div
          className={`rounded-lg py-2 px-4 leading-tight text-sm ${
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          }`}
        >
          {processFileLinks(message.content).map((part, index) => {
            if (part.type === "text") {
              const textParts = processMessageContent(part.content)
              return textParts.map((textPart, textIndex) => {
                if (textPart.type === "text") {
                  return (
                    <div key={`${index}-text-${textIndex}`} className="whitespace-pre-wrap mb-1">
                      {textPart.content}
                    </div>
                  )
                } else if (textPart.type === "code") {
                  return (
                    <CodeBlock
                      key={`${index}-code-${textIndex}`}
                      language={textPart.language}
                      code={textPart.content}
                    />
                  )
                }
                return null
              })
            } else if (part.type === "file") {
              return (
                <div key={`${index}-file`} className="mb-1 flex items-center bg-background/20 p-1 rounded">
                  <a
                    href={part.downloadUrl}
                    download={part.fileName}
                    className="text-primary-foreground underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📎 {part.fileName} (Descargar)
                  </a>
                </div>
              )
            }
            return null
          })}
        </div>

        {showActions && (
          <div className="flex items-center mt-1 space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                setLiked(!liked)
              }}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? "text-primary fill-primary" : ""}`} />
              <span className="text-xs">{liked ? "Liked" : "Like"}</span>
            </Button>

            {onThreadClick ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onThreadClick()
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-xs">Thread</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem
                  className="text-foreground hover:text-foreground focus:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  Copy message
                </DropdownMenuItem>
                {isUser && (
                  <DropdownMenuItem
                    className="text-foreground hover:text-foreground focus:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit message
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive hover:text-destructive focus:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  Delete message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}