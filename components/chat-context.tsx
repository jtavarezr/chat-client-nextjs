"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSocket } from "@/hooks/use-socket"

// Define types for our context
interface User {
  id: string
  name: string
  status: "online" | "offline" | "away"
  avatar?: string
}

interface Message {
  id: string
  from: string
  to: string
  content: string
  timestamp: string
  status?: string
  read?: boolean
  threadId?: string
  groupId?: string
}

interface Chat {
  id: string
  name: string
  type: "direct" | "group"
  lastMessage?: string
  unread: number
  members?: string[]
  status?: "online" | "offline" | "away"
  creatorId?: string
}

interface ChatContextType {
  currentUser: User
  chats: Chat[]
  selectedChat: Chat | null
  messages: Message[]
  isTyping: boolean
  setSelectedChat: (chat: Chat | null) => void
  sendMessage: (content: string) => void
  markAsRead: (messageId: string) => void
  markAllAsRead: () => void
  clearChat: () => void
  createGroup: (name: string) => void
  joinGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  setTypingStatus: (isTyping: boolean) => void
  isConnected: boolean
  connectionError: string | null
  logout: () => void
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

// Provider component
export function ChatProvider({ children }: ChatProviderProps) {
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize userId from localStorage if available
  useEffect(() => {
    const storedUserId = localStorage.getItem("chat_user_id")
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  // Create current user object using the actual userId
  const currentUser: User = {
    id: userId || "guest",
    name: userId || "Guest",
    status: "online",
  }

  const {
    connected,
    messages: directMessages,
    groupMessages,
    typingStatus,
    groupTypingStatus,
    users,
    groups,
    error,
    loadChatHistory,
    loadGroupChatHistory,
    sendMessage: socketSendMessage,
    sendGroupMessage: socketSendGroupMessage,
    markMessageAsRead,
    markAllAsRead: socketMarkAllAsRead,
    clearChat: socketClearChat,
    clearGroupChat: socketClearGroupChat,
    createGroup: socketCreateGroup,
    joinGroup: socketJoinGroup,
    leaveGroup: socketLeaveGroup,
    sendTypingStatus,
    sendGroupTypingStatus,
    disconnect,
  } = useSocket(currentUser.id)

  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Update chats when users and groups change
  useEffect(() => {
    const updatedChats: Chat[] = []

    // Add direct chats from users
    if (users) {
      Object.entries(users).forEach(([userId, userData]) => {
        if (userId !== currentUser.id) {
          updatedChats.push({
            id: userId,
            name: userId, // Just use the userId as the name without "User" prefix
            type: "direct",
            unread: 0, // Will be updated later
            status: userData.online ? "online" : "offline",
          })
        }
      })
    }

    // Add group chats from groups
    if (groups) {
      Object.entries(groups).forEach(([groupId, groupData]) => {
        if (groupData.members.includes(currentUser.id)) {
          updatedChats.push({
            id: groupId,
            name: groupData.name,
            type: "group",
            unread: 0, // Will be updated later
            members: groupData.members,
            creatorId: groupData.creatorId,
          })
        }
      })
    }

    // Update unread counts and last messages
    updatedChats.forEach((chat) => {
      if (chat.type === "direct") {
        const chatMessages = directMessages[chat.id] || []
        chat.lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content : undefined
        chat.unread = chatMessages.filter((msg) => msg.from !== currentUser.id && msg.status !== "read").length
      } else if (chat.type === "group") {
        const chatMessages = groupMessages[chat.id] || []
        chat.lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].content : undefined
        chat.unread = chatMessages.filter((msg) => msg.from !== currentUser.id).length
      }
    })

    setChats(updatedChats)
  }, [users, groups, directMessages, groupMessages, currentUser.id])

  // When selected chat changes, load chat history
  useEffect(() => {
    if (selectedChat && connected) {
      if (selectedChat.type === "direct") {
        loadChatHistory(selectedChat.id)
      } else if (selectedChat.type === "group") {
        loadGroupChatHistory(selectedChat.id)
      }

      // Reset unread count when selecting a chat
      setChats((prevChats) => prevChats.map((chat) => (chat.id === selectedChat.id ? { ...chat, unread: 0 } : chat)))
    }
  }, [selectedChat, connected, loadChatHistory, loadGroupChatHistory])

  // Update messages when socket messages change
  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.type === "direct" && directMessages[selectedChat.id]) {
        setMessages(directMessages[selectedChat.id])
      } else if (selectedChat.type === "group" && groupMessages[selectedChat.id]) {
        setMessages(groupMessages[selectedChat.id])
      }
    }
  }, [directMessages, groupMessages, selectedChat])

  // Send a message to the selected chat
  const sendMessage = (content: string) => {
    if (selectedChat && connected) {
      if (selectedChat.type === "direct") {
        socketSendMessage(selectedChat.id, content)
      } else if (selectedChat.type === "group") {
        socketSendGroupMessage(selectedChat.id, content)
      }
    }
  }

  // Mark a message as read
  const markAsRead = (messageId: string) => {
    if (connected) {
      markMessageAsRead(messageId)
    }
  }

  // Mark all messages in the selected chat as read
  const markAllAsRead = () => {
    if (selectedChat && connected && selectedChat.type === "direct") {
      socketMarkAllAsRead(selectedChat.id)
    }
  }

  // Clear the selected chat
  const clearChat = () => {
    if (selectedChat && connected) {
      if (selectedChat.type === "direct") {
        socketClearChat(selectedChat.id)
      } else if (selectedChat.type === "group") {
        socketClearGroupChat(selectedChat.id)
      }
    }
  }

  // Create a new group
  const createGroup = (name: string) => {
    if (connected) {
      socketCreateGroup(name)
    }
  }

  // Join a group
  const joinGroup = (groupId: string) => {
    if (connected) {
      socketJoinGroup(groupId)
    }
  }

  // Leave a group
  const leaveGroup = (groupId: string) => {
    if (connected) {
      socketLeaveGroup(groupId)
    }
  }

  // Set typing status
  const setTypingStatus = (isTyping: boolean) => {
    if (selectedChat && connected) {
      if (selectedChat.type === "direct") {
        sendTypingStatus(selectedChat.id, isTyping)
      } else if (selectedChat.type === "group") {
        sendGroupTypingStatus(selectedChat.id, isTyping)
      }
    }
  }

  // Logout function
  const logout = () => {
    // Disconnect from socket
    disconnect()

    // Clear user data from localStorage
    localStorage.removeItem("chat_user_id")
    localStorage.removeItem(`chat_session_${currentUser.id}`)

    // Reset state
    setSelectedChat(null)
    setUserId(null)

    // Force page reload to clear all state
    window.location.reload()
  }

  // Check if the other user is typing
  const isTyping = selectedChat
    ? selectedChat.type === "direct"
      ? typingStatus[selectedChat.id] || false
      : Object.values(groupTypingStatus[selectedChat.id] || {}).some((status) => status)
    : false

  const value = {
    currentUser,
    chats,
    selectedChat,
    messages,
    isTyping,
    setSelectedChat,
    sendMessage,
    markAsRead,
    markAllAsRead,
    clearChat,
    createGroup,
    joinGroup,
    leaveGroup,
    setTypingStatus,
    isConnected: connected,
    connectionError: error,
    logout,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

// Custom hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
