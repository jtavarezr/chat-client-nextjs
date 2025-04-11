"use client"

import { useState, useEffect, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

interface Message {
  id: string
  from?: string
  fromUser?: string
  to?: string
  toUser?: string
  content: string
  timestamp: string
  status?: string
  groupId?: string
}

interface ChatHistory {
  [contactId: string]: Message[]
}

interface GroupChatHistory {
  [groupId: string]: Message[]
}

interface TypingStatus {
  [contactId: string]: boolean
}

interface GroupTypingStatus {
  [groupId: string]: {
    [userId: string]: boolean
  }
}

interface User {
  online: boolean
  isTyping: boolean
  groups: string[]
}

interface Users {
  [userId: string]: User
}

interface Group {
  id: string
  name: string
  creatorId: string
  members: string[]
  createdAt: string
}

interface Groups {
  [groupId: string]: Group
}

export function useSocket(userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatHistory>({})
  const [groupMessages, setGroupMessages] = useState<GroupChatHistory>({})
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({})
  const [groupTypingStatus, setGroupTypingStatus] = useState<GroupTypingStatus>({})
  const [users, setUsers] = useState<Users>({})
  const [groups, setGroups] = useState<Groups>({})
  const [error, setError] = useState<string | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!userId || userId === "guest") return

    // Try to get sessionId from localStorage
    const storedSessionId = localStorage.getItem(`chat_session_${userId}`)

    const socketInstance = io("https://j.tavarez.dev", {
      query: {
        userId,
        sessionId: storedSessionId || undefined,
      },
      transports: ["websocket"],
    })

    socketInstance.on("connect", () => {
      console.log("Connected to chat server")
      setConnected(true)
      setError(null)
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from chat server")
      setConnected(false)
    })

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err)
      setError("Failed to connect to chat server")
      setConnected(false)
    })

    socketInstance.on("connectionError", (data) => {
      console.error("Connection error:", data.message)
      setError(data.message)
      setConnected(false)
    })

    socketInstance.on("connectionSuccess", (data) => {
      console.log("Connection success:", data.message)
      setSessionId(data.sessionId)
      localStorage.setItem(`chat_session_${userId}`, data.sessionId)
    })

    // Handle users update
    socketInstance.on("usersUpdate", (updatedUsers: Users) => {
      setUsers(updatedUsers)
    })

    // Handle groups update
    socketInstance.on("groupsUpdate", (updatedGroups: Groups) => {
      setGroups(updatedGroups)
    })

    // Handle incoming direct messages
    socketInstance.on("message", (message: Message) => {
      setMessages((prev) => {
        const contactId = message.from || message.fromUser || ""
        const contactMessages = prev[contactId] || []
        return {
          ...prev,
          [contactId]: [...contactMessages, normalizeMessage(message)],
        }
      })
    })

    // Handle incoming group messages
    socketInstance.on("groupMessage", (message: Message) => {
      if (!message.groupId) return

      setGroupMessages((prev) => {
        const groupId = message.groupId
        const groupMsgs = prev[groupId] || []
        return {
          ...prev,
          [groupId]: [...groupMsgs, normalizeMessage(message)],
        }
      })
    })

    // Handle message status updates
    socketInstance.on("messageStatusUpdate", ({ id, status }) => {
      setMessages((prev) => {
        const updatedMessages = { ...prev }

        // Find the message in all conversations
        Object.keys(updatedMessages).forEach((contactId) => {
          updatedMessages[contactId] = updatedMessages[contactId].map((msg) =>
            msg.id === id ? { ...msg, status } : msg,
          )
        })

        return updatedMessages
      })
    })

    // Handle direct chat history
    socketInstance.on("chatHistory", ({ contactId, messages: historyMessages }) => {
      setMessages((prev) => ({
        ...prev,
        [contactId]: historyMessages.map(normalizeMessage),
      }))
    })

    // Handle group chat history
    socketInstance.on("groupChatHistory", ({ groupId, messages: historyMessages }) => {
      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: historyMessages.map(normalizeMessage),
      }))
    })

    // Handle typing status for direct messages
    socketInstance.on("userTyping", ({ userId: typingUserId, isTyping }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [typingUserId]: isTyping,
      }))
    })

    // Handle typing status for group messages
    socketInstance.on("groupTyping", ({ groupId, userId: typingUserId, isTyping }) => {
      setGroupTypingStatus((prev) => {
        const groupTyping = prev[groupId] || {}
        return {
          ...prev,
          [groupId]: {
            ...groupTyping,
            [typingUserId]: isTyping,
          },
        }
      })
    })

    // Handle group created
    socketInstance.on("groupCreated", ({ group }) => {
      console.log(`Group created: ${group.name} (${group.id})`)
      // Update groups state with the new group
      setGroups((prev) => ({
        ...prev,
        [group.id]: group,
      }))
    })

    // Handle joined group
    socketInstance.on("joinedGroup", ({ group }) => {
      console.log(`Joined group: ${group.id}`)
      // Update groups state with the joined group
      setGroups((prev) => ({
        ...prev,
        [group.id]: group,
      }))
    })

    // Handle left group
    socketInstance.on("leftGroup", ({ groupId }) => {
      console.log(`Left group: ${groupId}`)
      // Remove the group from state
      setGroups((prev) => {
        const updatedGroups = { ...prev }
        delete updatedGroups[groupId]
        return updatedGroups
      })
    })

    // Handle chat cleared
    socketInstance.on("chatCleared", ({ contactId }) => {
      console.log(`Chat cleared with: ${contactId}`)
      setMessages((prev) => ({
        ...prev,
        [contactId]: [],
      }))
    })

    // Handle group chat cleared
    socketInstance.on("groupChatCleared", ({ groupId }) => {
      console.log(`Group chat cleared: ${groupId}`)
      setGroupMessages((prev) => ({
        ...prev,
        [groupId]: [],
      }))
    })

    // Handle errors
    socketInstance.on("error", ({ message }) => {
      console.error("Server error:", message)
      setError(message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.emit("manualDisconnect")
      socketInstance.disconnect()
    }
  }, [userId])

  // Normalize message format between server and client
  const normalizeMessage = (message: Message): Message => {
    return {
      id: message.id,
      from: message.from || message.fromUser || "",
      to: message.to || message.toUser || "",
      content: message.content,
      timestamp: message.timestamp,
      status: message.status || "sent",
      groupId: message.groupId,
    }
  }

  // Load chat history with a contact
  const loadChatHistory = useCallback(
    (contactId: string) => {
      if (socket && connected) {
        socket.emit("loadChatHistory", { contactId })
      }
    },
    [socket, connected],
  )

  // Load group chat history
  const loadGroupChatHistory = useCallback(
    (groupId: string) => {
      if (socket && connected) {
        socket.emit("loadGroupChatHistory", { groupId })
      }
    },
    [socket, connected],
  )

  // Send a direct message
  const sendMessage = useCallback(
    (to: string, content: string) => {
      if (socket && connected) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()

        const message = {
          id: messageId,
          to,
          content,
          timestamp,
        }

        socket.emit("message", message)

        // Optimistically add message to state
        setMessages((prev) => {
          const contactMessages = prev[to] || []
          return {
            ...prev,
            [to]: [
              ...contactMessages,
              {
                id: messageId,
                from: userId,
                to,
                content,
                timestamp,
                status: "sent",
              },
            ],
          }
        })

        return messageId
      }
      return null
    },
    [socket, connected, userId],
  )

  // Send a group message
  const sendGroupMessage = useCallback(
    (groupId: string, content: string) => {
      if (socket && connected) {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()

        const message = {
          id: messageId,
          groupId,
          content,
          timestamp,
        }

        socket.emit("groupMessage", message)

        // Optimistically add message to state
        setGroupMessages((prev) => {
          const groupMsgs = prev[groupId] || []
          return {
            ...prev,
            [groupId]: [
              ...groupMsgs,
              {
                id: messageId,
                from: userId,
                content,
                timestamp,
                status: "sent",
                groupId,
              },
            ],
          }
        })

        return messageId
      }
      return null
    },
    [socket, connected, userId],
  )

  // Mark a message as read
  const markMessageAsRead = useCallback(
    (messageId: string) => {
      if (socket && connected) {
        socket.emit("messageRead", { messageId })
      }
    },
    [socket, connected],
  )

  // Mark all messages from a contact as read
  const markAllAsRead = useCallback(
    (contactId: string) => {
      if (socket && connected) {
        socket.emit("markAllAsRead", { contactId })
      }
    },
    [socket, connected],
  )

  // Clear chat with a contact
  const clearChat = useCallback(
    (contactId: string) => {
      if (socket && connected) {
        socket.emit("clearChat", { contactId })
      }
    },
    [socket, connected],
  )

  // Clear group chat
  const clearGroupChat = useCallback(
    (groupId: string) => {
      if (socket && connected) {
        socket.emit("clearGroupChat", { groupId })
      }
    },
    [socket, connected],
  )

  // Create a new group
  const createGroup = useCallback(
    (name: string) => {
      if (socket && connected) {
        socket.emit("createGroup", { name })
      }
    },
    [socket, connected],
  )

  // Join a group
  const joinGroup = useCallback(
    (groupId: string) => {
      if (socket && connected) {
        socket.emit("joinGroup", { groupId })
      }
    },
    [socket, connected],
  )

  // Leave a group
  const leaveGroup = useCallback(
    (groupId: string) => {
      if (socket && connected) {
        socket.emit("leaveGroup", { groupId })
      }
    },
    [socket, connected],
  )

  // Send typing status for direct messages
  const sendTypingStatus = useCallback(
    (to: string, isTyping: boolean) => {
      if (socket && connected) {
        socket.emit("typing", { to, isTyping })
      }
    },
    [socket, connected],
  )

  // Send typing status for group messages
  const sendGroupTypingStatus = useCallback(
    (groupId: string, isTyping: boolean) => {
      if (socket && connected) {
        socket.emit("groupTyping", { groupId, isTyping })
      }
    },
    [socket, connected],
  )

  // Disconnect manually
  const disconnect = useCallback(() => {
    if (socket && connected) {
      socket.emit("manualDisconnect")
      socket.disconnect()
    }
  }, [socket, connected])

  return {
    connected,
    sessionId,
    messages,
    groupMessages,
    typingStatus,
    groupTypingStatus,
    users,
    groups,
    error,
    loadChatHistory,
    loadGroupChatHistory,
    sendMessage,
    sendGroupMessage,
    markMessageAsRead,
    markAllAsRead,
    clearChat,
    clearGroupChat,
    createGroup,
    joinGroup,
    leaveGroup,
    sendTypingStatus,
    sendGroupTypingStatus,
    disconnect,
  }
}
