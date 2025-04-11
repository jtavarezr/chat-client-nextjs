"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "@/components/chat-message"
import { X } from "lucide-react"

interface ChatThreadProps {
  messages: {
    id: string
    role: string
    content: string
    threadId?: string
  }[]
  onClose: () => void
}

export function ChatThread({ messages, onClose }: ChatThreadProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="font-medium">Thread</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800">
        <div className="relative">
          <textarea
            placeholder="Reply to thread..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            rows={3}
          />
          <Button className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700">Reply</Button>
        </div>
      </div>
    </div>
  )
}
