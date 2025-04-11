"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CodeBlock } from "./code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SendIcon, PaperclipIcon, SmileIcon } from "lucide-react"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [inputRows, setInputRows] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    const rows = input.split("\n").length
    setInputRows(Math.min(5, Math.max(1, rows)))
  }, [input])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => {
          const processedContent = processMessageContent(message.content)

          return (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user" ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-100"
                }`}
              >
                {processedContent.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <div key={index} className="whitespace-pre-wrap mb-2">
                        {part.content}
                      </div>
                    )
                  } else if (part.type === "code") {
                    return <CodeBlock key={index} language={part.language} code={part.content} />
                  }
                  return null
                })}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-zinc-800 text-zinc-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 p-4">
        <Tabs defaultValue="chat">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="code">Código</TabsTrigger>
            <TabsTrigger value="docs">Documentación</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <form onSubmit={handleFormSubmit} className="flex flex-col space-y-2">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Escribe tu mensaje o pregunta de programación..."
                  className="min-h-[60px] resize-none pr-20 bg-zinc-800 border-zinc-700 text-zinc-100"
                  rows={inputRows}
                />
                <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-zinc-400 hover:text-white"
                  >
                    <PaperclipIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-zinc-400 hover:text-white"
                  >
                    <SmileIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={isLoading || !input.trim()}
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="code" className="mt-0">
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
              <p className="text-zinc-400">Editor de código integrado (próximamente)</p>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="mt-0">
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4">
              <p className="text-zinc-400">Documentación integrada (próximamente)</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
