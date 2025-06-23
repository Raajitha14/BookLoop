
import { useState, useEffect, useContext, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import Spinner from "../components/layout/Spinner"
import { API_URL } from "../config"
import "./Chat.css"

const Chat = () => {
  const { bookId, userId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { conversations, currentChat, setCurrentChat, messages, newMessage, setNewMessage, sendMessage } =
    useContext(ChatContext)

  const [chatUsers, setChatUsers] = useState({})
  const [chatBooks, setChatBooks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [receiver, setReceiver] = useState(null)

  const scrollRef = useRef()

  // Load chat users and books info
  useEffect(() => {
    const loadChatInfo = async () => {
      try {
        setLoading(true)

        // Get all unique user IDs from conversations
        const userIds = new Set()
        const bookIds = new Set()

        conversations.forEach((conv) => {
          conv.members.forEach((member) => {
            if (member !== user._id) {
              userIds.add(member)
            }
          })

          if (conv.bookId) {
            bookIds.add(conv.bookId)
          }
        })

        // Fetch user info
        const usersPromises = Array.from(userIds).map((id) => axios.get(`${API_URL}/api/users/${id}`))

        // Fetch book info
        const booksPromises = Array.from(bookIds).map((id) => axios.get(`${API_URL}/api/books/${id}`))

        const [usersRes, booksRes] = await Promise.all([Promise.all(usersPromises), Promise.all(booksPromises)])

        // Create lookup objects
        const usersMap = {}
        usersRes.forEach((res) => {
          usersMap[res.data._id] = res.data
        })

        const booksMap = {}
        booksRes.forEach((res) => {
          booksMap[res.data._id] = res.data
        })

        setChatUsers(usersMap)
        setChatBooks(booksMap)
      } catch (err) {
        setError("Failed to load chat information")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (conversations.length > 0) {
      loadChatInfo()
    }
  }, [conversations, user._id])

  // Set current chat based on URL params
  useEffect(() => {
    if (conversations.length > 0) {
      // If we have a specific conversation ID in the URL
      if (bookId && userId) {
        const conversation = conversations.find((c) => c.bookId === bookId && c.members.includes(userId))

        if (conversation) {
          setCurrentChat(conversation)
        }
      } else if (conversations.length > 0 && !currentChat) {
        // Default to first conversation
        setCurrentChat(conversations[0])
      }
    }
  }, [conversations, bookId, userId, currentChat, setCurrentChat])

  // Set receiver when current chat changes
  useEffect(() => {
    if (currentChat && user) {
      const receiverId = currentChat.members.find((member) => member !== user._id)
      setReceiver(chatUsers[receiverId])
    }
  }, [currentChat, chatUsers, user])

  // Scroll to bottom of messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const receiverId = currentChat.members.find((member) => member !== user._id)
    await sendMessage(newMessage, receiverId)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
        </div>

        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map((conv) => {
              const receiverId = conv.members.find((member) => member !== user._id)
              const chatUser = chatUsers[receiverId]
              const chatBook = chatBooks[conv.bookId]

              return (
                <div
                  key={conv._id}
                  className={`conversation-item ${currentChat?._id === conv._id ? "active" : ""}`}
                  onClick={() => {
                    setCurrentChat(conv)
                    navigate(`/chat/${conv._id}`)
                  }}
                >
                  <div className="conversation-user-info">
                    <span className="conversation-username">{chatUser?.name || "Unknown User"}</span>
                    <span className="conversation-book">{chatBook?.name || "Book Discussion"}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="chat-main">
        {currentChat ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <h3>{receiver?.name || "Chat"}</h3>
                {chatBooks[currentChat.bookId] && (
                  <p>
                    Discussing: <span className="book-title">{chatBooks[currentChat.bookId].name}</span>
                  </p>
                )}
              </div>

              {chatBooks[currentChat.bookId] && (
                <button className="view-book-btn" onClick={() => navigate(`/book/${currentChat.bookId}`)}>
                  View Book
                </button>
              )}
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`message ${message.sender === user._id ? "own" : ""}`}
                    ref={index === messages.length - 1 ? scrollRef : null}
                  >
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="message-input-container" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="send-button">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
