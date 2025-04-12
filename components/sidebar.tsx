"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Search, Plus, Users, User, Settings, Code, Wifi, WifiOff, LogOut, X } from "lucide-react";
import { useChat } from "@/components/chat-context";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [dialog, setDialog] = useState<"create" | "join" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { chats, selectedChat, setSelectedChat, isConnected, currentUser, createGroup, joinGroup, logout } = useChat();

  // Memoizar filtros
  const directChats = useMemo(() => chats.filter((chat) => chat.type === "direct"), [chats]);
  const groupChats = useMemo(() => chats.filter((chat) => chat.type === "group"), [chats]);
  const filteredDirectChats = useMemo(
    () => directChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [directChats, searchQuery]
  );
  const filteredGroupChats = useMemo(
    () => groupChats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [groupChats, searchQuery]
  );

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      setIsLoading(true);
      try {
        await createGroup(newGroupName.trim());
        setNewGroupName("");
        setDialog(null);
      } catch {
        alert("Error al crear el grupo");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleJoinGroup = async () => {
    if (joinGroupId.trim()) {
      setIsLoading(true);
      try {
        await joinGroup(joinGroupId.trim());
        setJoinGroupId("");
        setDialog(null);
      } catch {
        alert("Error al unirse al grupo");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`flex flex-col bg-card border-r ${className}`}>
      {/* Encabezado */}
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center">
          <Code className="mr-2 h-5 w-5 text-primary" />
          DevChat
        </h1>
        <div className="flex items-center space-x-2">
          {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          <ThemeSwitcher />
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar..."
            className="pl-8 pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1.5 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Pestañas */}
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
          <ScrollArea className="max-h-[calc(100vh-14rem)]">
            <div className="p-4 space-y-2">
              {filteredGroupChats.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : "No hay grupos"}
                </p>
              ) : (
                filteredGroupChats.map((chat) => (
                  <button
                    key={chat.id}
                    className={`w-full flex items-center p-2 rounded-md ${
                      selectedChat?.id === chat.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="flex-1 text-left">{chat.name}</span>
                    {chat.unread > 0 && (
                      <Badge variant="default" className="bg-blue-600 text-white">
                        {chat.unread}
                      </Badge>
                    )}

                  </button>
                ))
              )}
              <div className="flex space-x-2 mt-4">
                <Dialog open={dialog === "create"} onOpenChange={(open) => setDialog(open ? "create" : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear grupo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <h2 className="text-lg font-semibold">Crear grupo</h2>
                    <Input
                      placeholder="Nombre del grupo"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDialog(null)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateGroup} disabled={isLoading || !newGroupName.trim()}>
                        {isLoading ? "Creando..." : "Crear"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={dialog === "join"} onOpenChange={(open) => setDialog(open ? "join" : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Unirse
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <h2 className="text-lg font-semibold">Unirse a grupo</h2>
                    <Input
                      placeholder="ID del grupo"
                      value={joinGroupId}
                      onChange={(e) => setJoinGroupId(e.target.value)}
                    />
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setDialog(null)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleJoinGroup} disabled={isLoading || !joinGroupId.trim()}>
                        {isLoading ? "Uniéndose..." : "Unirse"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="direct" className="flex-1 p-0">
          <ScrollArea className="max-h-[calc(100vh-14rem)]">
            <div className="p-4 space-y-2">
              {filteredDirectChats.length === 0 ? (
                <p className="text-center text-gray-500">
                  {searchQuery ? `Sin resultados para "${searchQuery}"` : "No hay mensajes"}
                </p>
              ) : (
                filteredDirectChats.map((chat) => (
                  <button
                    key={chat.id}
                    className={`w-full flex items-center p-2 rounded-md ${
                      selectedChat?.id === chat.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
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
                              : "bg-gray-500"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && <Badge className="bg-blue-600">{chat.unread}</Badge>}
                  </button>
                ))
              )}
              <Button variant="ghost" className="w-full justify-start mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo mensaje
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Perfil */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{isConnected ? "Conectado" : "Desconectado"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}