"use client"

import { createContext, useState, useEffect, useContext } from "react"
import io from "socket.io-client"
import axios from "axios"
import { AuthContext } from "./AuthContext"
import { API_URL } from "../config"

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [arrivalMessage, setArrivalMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(API_URL)
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [isAuthenticated, user])

  // Add user to socket
  useEffect(() => {
    if (socket && user) {
      socket.emit("addUser", user._id)

      socket.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: Date.now(),
        })
      })
    }
  }, [socket, user])

  // Update messages when arrival message comes
  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage])
    }
  }, [arrivalMessage, currentChat])

  // Get conversations
  useEffect(() => {
    const getConversations = async () => {
      if (!user) return

      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/api/conversations/${user._id}`)
        setConversations(res.data)
      } catch (err) {
        setError("Failed to fetch conversations")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      getConversations()
    }
  }, [user, isAuthenticated])

  // Get messages for current chat
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) return

      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/api/messages/${currentChat._id}`)
        setMessages(res.data)
      } catch (err) {
        setError("Failed to fetch messages")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    getMessages()
  }, [currentChat])

  // Send message
  const sendMessage = async (text, receiverId) => {
    if (!socket || !currentChat || !user) return

    const message = {
      conversationId: currentChat._id,
      sender: user._id,
      text,
    }

    try {
      const res = await axios.post(`${API_URL}/api/messages`, message)
      setMessages([...messages, res.data])
      setNewMessage("")

      // Send message via socket
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text,
      })

      return res.data
    } catch (err) {
      setError("Failed to send message")
      console.error(err)
      return null
    }
  }

  // Create new conversation
  const createConversation = async (receiverId, bookId) => {
    if (!user) return null

    try {
      const res = await axios.post(`${API_URL}/api/conversations`, {
        senderId: user._id,
        receiverId,
        bookId,
      })

      setConversations([...conversations, res.data])
      setCurrentChat(res.data)
      return res.data
    } catch (err) {
      setError("Failed to create conversation")
      console.error(err)
      return null
    }
  }

  return (
    <ChatContext.Provider
      value={{
        socket,
        conversations,
        currentChat,
        setCurrentChat,
        messages,
        newMessage,
        setNewMessage,
        sendMessage,
        createConversation,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
