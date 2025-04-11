"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatInput } from "@/components/chat-input"
import { ChatMessage } from "@/components/chat-message"
import { ChatThread } from "@/components/chat-thread"
import { CodeEditor } from "@/components/code-editor"
import { GitIntegration } from "@/components/git-integration"
import { AudioCall } from "@/components/audio-call"
import { Search, Code, GitBranch, Settings, MessageSquare, Phone, Users } from "lucide-react"
import { useChat } from "@/components/chat-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatArea() {
  const [activeTab, setActiveTab] = useState("chat")
  const [threadView, setThreadView] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { currentUser, selectedChat, messages, sendMessage, markAllAsRead, isTyping, setTypingStatus, leaveGroup } =
    useChat()

  // Add a ref for the scroll area
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Add a function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }

  // Scroll to bottom when messages change
  // Replace the existing useEffect for scrolling with:
  useEffect(() => {
    if (activeTab === "chat" && !threadView) {
      // Only auto-scroll when a new message is added
      const isAtBottom =
        messagesEndRef.current && messagesEndRef.current.getBoundingClientRect().bottom <= window.innerHeight + 100

      if (
        isAtBottom ||
        messages.length === 0 ||
        (messages.length > 0 && messages[messages.length - 1].from === currentUser.id)
      ) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [messages, activeTab, threadView, currentUser.id])

  // Mark messages as read when viewing chat
  useEffect(() => {
    if (selectedChat && activeTab === "chat") {
      markAllAsRead()
    }
  }, [selectedChat, activeTab, markAllAsRead])

  // Update the sendMessage function to scroll to bottom after sending
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      setIsLoading(true)
      sendMessage(input)
      setInput("")
      setTimeout(() => {
        setIsLoading(false)
        scrollToBottom()
      }, 500)
    }
  }

  // Add an effect to scroll to bottom on initial load
  useEffect(() => {
    if (selectedChat) {
      setTimeout(scrollToBottom, 300)
    }
  }, [selectedChat])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // Send typing status
    setTypingStatus(e.target.value.length > 0)
  }

  const handleFileUpload = (file: File) => {
    // In a real app, you would upload the file to a server
    // and then send a message with the file URL
    sendMessage(`[Archivo adjunto: ${file.name}]`)
  }

  const handleStartAudioCall = () => {
    setInCall(true)
    setActiveTab("call")
  }

  const handleEndCall = () => {
    setInCall(false)
    setActiveTab("chat")
  }

  const handleLeaveGroup = () => {
    if (selectedChat && selectedChat.type === "group") {
      leaveGroup(selectedChat.id)
    }
  }

  // Get messages for a specific thread
  const getThreadMessages = (threadId: string) => {
    return messages.filter((msg) => msg.id === threadId || msg.threadId === threadId)
  }

  // Mock participants for audio call
  const callParticipants = [
    { id: "user-1", name: "You", isSpeaking: false, isMuted: false },
    ...(selectedChat?.type === "direct"
      ? [{ id: "user-2", name: selectedChat.name, isSpeaking: false, isMuted: false }]
      : [
          { id: "user-2", name: "Sarah Chen", isSpeaking: false, isMuted: false },
          { id: "user-3", name: "Alex Johnson", isSpeaking: false, isMuted: true },
          { id: "user-4", name: "Miguel Rodriguez", isSpeaking: false, isMuted: false },
        ]),
  ]

  if (!selectedChat) {
    return <div className="flex-1 flex items-center justify-center">Selecciona un chat para comenzar</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          {selectedChat.type === "direct" ? (
            <>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                <AvatarFallback className="text-xs">{selectedChat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-medium">{selectedChat.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChat.status === "online" ? "En línea" : "Desconectado"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/20 rounded-full p-2 mr-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-medium">{selectedChat.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedChat.members?.length || 0} miembros</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!inCall && (
            <Button variant="ghost" size="icon" onClick={handleStartAudioCall}>
              <Phone className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5" />
          </Button>
          {selectedChat.type === "group" && (
            <Button variant="ghost" size="icon" onClick={handleLeaveGroup}>
              <Users className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="p-2 bg-secondary border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar en la conversación..."
              className="w-full pl-8 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="px-4 py-2 border-b border-border bg-card">
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="code" className="data-[state=active]:bg-primary">
            <Code className="h-4 w-4 mr-2" />
            Editor de Código
          </TabsTrigger>
          <TabsTrigger value="git" className="data-[state=active]:bg-primary">
            <GitBranch className="h-4 w-4 mr-2" />
            Git
          </TabsTrigger>
          {inCall && (
            <TabsTrigger value="call" className="data-[state=active]:bg-primary">
              <Phone className="h-4 w-4 mr-2" />
              Llamada
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex">
          {threadView ? (
            <ChatThread messages={getThreadMessages(threadView)} onClose={() => setThreadView(null)} />
          ) : (
            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {selectedChat.type === "group" && (
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4 text-center">
                    <h3 className="font-medium">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.members?.length || 0} miembros • Creado por{" "}
                      {selectedChat.creatorId === currentUser.id ? "ti" : "otro usuario"}
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onThreadClick={message.threadId ? () => setThreadView(message.threadId!) : undefined}
                  />
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-secondary text-foreground">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                        <div
                          className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="flex-1 p-0">
          <CodeEditor />
        </TabsContent>

        <TabsContent value="git" className="flex-1 p-0">
          <GitIntegration />
        </TabsContent>

        <TabsContent value="call" className="flex-1 p-0">
          <AudioCall
            isGroup={selectedChat.type === "group"}
            participants={callParticipants}
            onEndCall={handleEndCall}
          />
        </TabsContent>
      </Tabs>

      {activeTab === "chat" && (
        <div className="p-4 border-t border-border">
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSendMessage}
            onFileUpload={handleFileUpload}
            onStartAudioCall={handleStartAudioCall}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}
