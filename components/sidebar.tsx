"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Search, Plus, Users, User, Settings, Code, Wifi, WifiOff, LogOut } from "lucide-react"
import { useChat } from "@/components/chat-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [joinGroupId, setJoinGroupId] = useState("")
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)

  const { chats, selectedChat, setSelectedChat, isConnected, currentUser, createGroup, joinGroup, logout } = useChat()

  const directChats = chats.filter((chat) => chat.type === "direct")
  const groupChats = chats.filter((chat) => chat.type === "group")

  const filteredDirectChats = directChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredGroupChats = groupChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim())
      setNewGroupName("")
      setGroupDialogOpen(false)
    }
  }

  const handleJoinGroup = () => {
    if (joinGroupId.trim()) {
      joinGroup(joinGroupId.trim())
      setJoinGroupId("")
      setJoinDialogOpen(false)
    }
  }

  return (
    <div className={`flex flex-col bg-card border-r border-border ${className}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">
          <Code className="mr-2 h-5 w-5 text-primary" />
          DevChat
        </h1>
        <div className="flex items-center space-x-1">
          {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
          <ThemeSwitcher />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones..."
            className="pl-8 bg-secondary border-input focus:border-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="groups" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="direct">
            <User className="h-4 w-4 mr-2" />
            Directos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-2">
              {filteredGroupChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full flex items-center p-2 rounded-md transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary/80 text-foreground"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex-1 text-left flex items-center">
                    <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>{chat.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({chat.members?.length || 0})</span>
                  </div>
                  {chat.unread > 0 && (
                    <Badge variant="default" className="bg-primary hover:bg-primary">
                      {chat.unread}
                    </Badge>
                  )}
                </button>
              ))}

              <div className="flex space-x-2 mt-4">
                <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear grupo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Crear nuevo grupo</DialogTitle>
                      <DialogDescription>Crea un nuevo grupo de chat para colaborar con tu equipo.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="group-name">Nombre del grupo</Label>
                        <Input
                          id="group-name"
                          placeholder="Ej: Equipo Frontend"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="bg-secondary border-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateGroup}>Crear grupo</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Unirse
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Unirse a un grupo</DialogTitle>
                      <DialogDescription>Ingresa el ID del grupo al que deseas unirte.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="group-id">ID del grupo</Label>
                        <Input
                          id="group-id"
                          placeholder="Ej: 123e4567-e89b-12d3-a456-426614174000"
                          value={joinGroupId}
                          onChange={(e) => setJoinGroupId(e.target.value)}
                          className="bg-secondary border-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleJoinGroup}>Unirse</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="direct" className="flex-1 p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-2">
              {filteredDirectChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full flex items-center p-2 rounded-md transition-colors ${
                    selectedChat?.id === chat.id
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary/80 text-foreground"
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback className="text-xs">
                      {chat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center">
                      <span>{chat.name.replace(/^User /, "")}</span>
                      <span
                        className={`ml-2 h-2 w-2 rounded-full ${
                          chat.status === "online"
                            ? "bg-green-500"
                            : chat.status === "away"
                              ? "bg-yellow-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <Badge variant="default" className="bg-primary hover:bg-primary">
                      {chat.unread}
                    </Badge>
                  )}
                </button>
              ))}
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo mensaje
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{isConnected ? "Conectado" : "Desconectado"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={logout}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
