"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/components/chat-message";
import { ChatThread } from "@/components/chat-thread";
import { CodeEditor } from "@/components/code-editor";
import { GitIntegration } from "@/components/git-integration";
import { AudioCall } from "@/components/audio-call";
import { Search, Code, GitBranch, Settings, MessageSquare, Phone, Users } from "lucide-react";
import { useChat } from "@/components/chat-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatInput } from "@/components/chat-input";

export function ChatArea() {
  const [activeTab, setActiveTab] = useState("chat");
  const [threadView, setThreadView] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { currentUser, selectedChat, messages, sendMessage, markAllAsRead, isTyping, setTypingStatus, leaveGroup } =
    useChat();

  // Desplazar al final del chat
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  // Auto-scroll para mensajes nuevos o al cargar chat
  useEffect(() => {
    if (activeTab === "chat" && !threadView && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      const isAtBottom =
        scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;
      const isOwnMessage = messages.length > 0 && messages[messages.length - 1].from === currentUser.id;

      if (isAtBottom || isOwnMessage || messages.length === 0) {
        scrollToBottom();
      }
    }
  }, [messages, activeTab, threadView, currentUser.id]);

  // Scroll inicial y marcar mensajes como leídos
  useEffect(() => {
    if (selectedChat && activeTab === "chat") {
      scrollToBottom();
      markAllAsRead();
    }
  }, [selectedChat, activeTab, markAllAsRead]);

  // Handlers
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    sendMessage(input);
    setInput("");
    setTypingStatus(false);
    setTimeout(scrollToBottom, 100);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setTypingStatus(e.target.value.length > 0);
  };

  const handleFileUpload = (file: File) => {
    sendMessage(`[Archivo adjunto: ${file.name}]`);
    scrollToBottom();
  };

  const handleStartAudioCall = () => {
    setInCall(true);
    setActiveTab("call");
  };

  const handleEndCall = () => {
    setInCall(false);
    setActiveTab("chat");
  };

  const handleLeaveGroup = () => {
    if (selectedChat?.type === "group") {
      leaveGroup(selectedChat.id);
    }
  };

  const getThreadMessages = (threadId: string) => {
    return messages.filter((msg) => msg.id === threadId || msg.threadId === threadId);
  };

  const callParticipants = [
    { id: "user-1", name: "You", isSpeaking: false, isMuted: false },
    ...(selectedChat?.type === "direct"
      ? [{ id: "user-2", name: selectedChat.name, isSpeaking: false, isMuted: false }]
      : [
          { id: "user-2", name: "Sarah Chen", isSpeaking: false, isMuted: false },
          { id: "user-3", name: "Alex Johnson", isSpeaking: false, isMuted: true },
        ]),
  ];

  if (!selectedChat) {
    return <div className="flex-1 flex items-center justify-center">Selecciona un chat para comenzar</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-border">
        <div className="flex items-center">
          {selectedChat.type === "direct" ? (
            <>
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={`/placeholder.svg?height=24&width=24`} />
                <AvatarFallback className="text-xs">{selectedChat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base font-medium">{selectedChat.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedChat.status === "online" ? "En línea" : "Desconectado"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/20 rounded-full p-1 mr-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-medium">{selectedChat.name}</h2>
                <p className="text-xs text-muted-foreground">{selectedChat.members?.length || 0} miembros</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {!inCall && (
            <Button variant="ghost" size="icon" onClick={handleStartAudioCall}>
              <Phone className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4 w-4" />
          </Button>
          {selectedChat.type === "group" && (
            <Button variant="ghost" size="icon" onClick={handleLeaveGroup}>
              <Users className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Tabs */}
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

        {/* Chat Content */}
        <TabsContent value="chat" className="flex-1 p-0">
          {threadView ? (
            <ChatThread messages={getThreadMessages(threadView)} onClose={() => setThreadView(null)} />
          ) : (
            <ScrollArea ref={scrollAreaRef} className="h-[calc(100vh-14rem)] p-4">
              <div className="space-y-4 pb-12">
                {selectedChat.type === "group" && (
                  <div className="bg-secondary/50 rounded-lg p-4 mb-4 text-center">
                    <h3 className="font-medium">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat.members?.length || 0} miembros • Creado por{" "}
                      {selectedChat.creatorId === currentUser.id ? "tú" : "otro usuario"}
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
              </div>
            </ScrollArea>
          )}
          {activeTab === "chat" && !threadView && (
            <div className="p-4 pt-0 -mt-6 border-t border-border">
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
        </TabsContent>

        {/* Other Tabs */}
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
    </div>
  );
}