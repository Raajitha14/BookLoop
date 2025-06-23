"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { API_URL } from "../../config"
import "./Chatbot.css"

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm BookBot, your BookLoop assistant. How can I help you today?",
      sender: "bot",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(true)

  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (!input.trim() && typeof input !== "string") return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setShowOptions(false)

    try {
      // In a real app, this would call an AI service or backend
      // For this example, we'll use a simple response system
      const response = await processMessage(input)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: response.text,
            sender: "bot",
            options: response.options,
          },
        ])

        setIsTyping(false)

        if (response.options) {
          setShowOptions(true)
        }
      }, 1000) // Simulate processing time
    } catch (err) {
      console.error("Chatbot error:", err)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "I'm sorry, I'm having trouble processing your request right now.",
            sender: "bot",
          },
        ])

        setIsTyping(false)
      }, 1000)
    }
  }

  const processMessage = async (message) => {
    // Simple keyword-based response system
    const lowerMsg = message.toLowerCase()

    // Check for report/complaint
    if (lowerMsg.includes("report") || lowerMsg.includes("complaint")) {
      return {
        text: "I'm sorry to hear you're having an issue. Please provide details about your complaint:",
        options: null,
      }
    }

    // Check for support request
    if (lowerMsg.includes("support") || lowerMsg.includes("help") || lowerMsg.includes("agent")) {
      try {
        // In a real app, this would create a support ticket
        await axios.post(`${API_URL}/api/support`, { message })

        return {
          text: "I've created a support ticket for you. An agent will contact you soon via email.",
          options: null,
        }
      } catch (err) {
        console.error("Failed to create support ticket", err)
        return {
          text: "I couldn't create a support ticket. Please try again later or email support@bookloop.com directly.",
          options: null,
        }
      }
    }

    // Check for how to sell/rent
    if (lowerMsg.includes("sell") || lowerMsg.includes("rent") || lowerMsg.includes("post")) {
      return {
        text: "To sell or rent a book on BookLoop, you need to: 1) Create an account or log in, 2) Click on 'Sell/Rent Book' in the navigation menu, 3) Fill out the book details form, 4) Upload a photo of the book, 5) Submit your listing.",
        options: null,
      }
    }

    // Check for how to buy
    if (lowerMsg.includes("buy") || lowerMsg.includes("purchase")) {
      return {
        text: "To buy a book on BookLoop: 1) Browse or search for books on the homepage, 2) Click on a book to view details, 3) Click 'Contact Seller' to start a conversation, 4) Arrange payment and delivery/pickup with the seller through our messaging system.",
        options: null,
      }
    }

    // Default response with options
    return {
      text: "I'm not sure I understand. How can I help you today?",
      options: ["How to sell a book?", "How to buy a book?", "Report an issue", "Contact support"],
    }
  }

  const handleOptionClick = (option) => {
    setInput(option)
    handleSendMessage()
  }

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <h3>
          <i className="fas fa-robot"></i> BookBot Assistant
        </h3>
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender === "bot" ? "bot" : "user"}`}>
            {message.sender === "bot" && (
              <div className="bot-avatar">
                <i className="fas fa-robot"></i>
              </div>
            )}

            <div className="message-bubble">
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot">
            <div className="bot-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {showOptions && messages[messages.length - 1].options && (
          <div className="chatbot-options">
            {messages[messages.length - 1].options.map((option, index) => (
              <button key={index} className="option-btn" onClick={() => handleOptionClick(option)}>
                {option}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  )
}

export default Chatbot
