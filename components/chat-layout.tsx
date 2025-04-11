"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { MobileHeader } from "@/components/mobile-header"
import { AudioCall } from "@/components/audio-call"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Phone, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useChat } from "@/components/chat-context"
import { LoginForm } from "@/components/login-form"

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [callActive, setCallActive] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const { currentUser, selectedChat, isConnected, connectionError } = useChat()

  // Check if user is logged in
  const isLoggedIn = currentUser.id !== "guest"

  // Mock participants for audio call
  const callParticipants = [
    {
      id: "user1",
      name: currentUser.name,
      avatar: "/placeholder.svg?height=64&width=64",
      isSpeaking: false,
      isMuted: false,
    },
    {
      id: "user2",
      name: selectedChat?.name || "User",
      avatar: "/placeholder.svg?height=64&width=64",
      isSpeaking: false,
      isMuted: false,
    },
  ]

  if (selectedChat?.type === "group") {
    callParticipants.push(
      {
        id: "user3",
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=64&width=64",
        isSpeaking: false,
        isMuted: true,
      },
      {
        id: "user4",
        name: "Miguel Rodriguez",
        avatar: "/placeholder.svg?height=64&width=64",
        isSpeaking: false,
        isMuted: false,
      },
    )
  }

  // If user is not logged in, show login form
  if (!isLoggedIn) {
    return (
      <LoginForm
        onLogin={(userId) => {
          localStorage.setItem("chat_user_id", userId)
          window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {isDesktop ? (
        <Sidebar className="w-64 flex-shrink-0" />
      ) : (
        <div
          className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <Sidebar className="w-64 h-full relative z-10" />
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        {!isConnected && connectionError && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription>No se pudo conectar al servidor de chat. {connectionError}</AlertDescription>
          </Alert>
        )}

        {!isDesktop && (
          <MobileHeader
            chatName={selectedChat?.name || "Selecciona un chat"}
            onMenuClick={() => setSidebarOpen(true)}
            rightElement={
              <div className="flex items-center space-x-2">
                {selectedChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCallActive(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                )}
                <ThemeSwitcher />
              </div>
            }
          />
        )}

        {callActive && selectedChat ? (
          <AudioCall
            isGroup={selectedChat.type === "group"}
            participants={callParticipants}
            onEndCall={() => setCallActive(false)}
          />
        ) : (
          <div className="flex flex-col flex-1">
            {isDesktop && (
              <div className="flex items-center justify-end p-2 border-b border-border bg-card">
                <div className="flex items-center space-x-2">
                  {selectedChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCallActive(true)}
                      className="bg-secondary border-input hover:bg-secondary/80"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Iniciar Llamada
                    </Button>
                  )}
                  <ThemeSwitcher />
                </div>
              </div>
            )}
            {selectedChat ? (
              <ChatArea />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bienvenido a DevChat, {currentUser.name}</h2>
                  <p className="text-muted-foreground">Selecciona un chat para comenzar</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
