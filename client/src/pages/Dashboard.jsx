"use client"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/layout/Spinner"
import { API_URL } from "../config"
import "./Dashboard.css"

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [books, setBooks] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("listed")

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/api/books/user/${user._id}`)
        setBooks(res.data)
      } catch (err) {
        setError("Failed to fetch your books")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && (activeTab !== "messages")) {
      fetchUserBooks()
    }
  }, [user, activeTab])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/api/messages/seller/${user._id}`)
        setMessages(res.data)
      } catch (err) {
        setError("Failed to fetch messages")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user && activeTab === "messages") {
      fetchMessages()
    }
  }, [user, activeTab])

  const handleMarkAsSold = async (bookId) => {
    try {
      await axios.put(`${API_URL}/api/books/${bookId}/status`, { status: "sold" })
      setBooks(books.map((book) => (book._id === bookId ? { ...book, status: "sold" } : book)))
    } catch (err) {
      setError("Failed to update book status")
      console.error(err)
    }
  }

  const handleToggleActive = async (bookId, isActive) => {
    try {
      await axios.put(`${API_URL}/api/books/${bookId}/active`, { isActive: !isActive })
      setBooks(books.map((book) => (book._id === bookId ? { ...book, isActive: !isActive } : book)))
    } catch (err) {
      setError("Failed to toggle book status")
      console.error(err)
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`${API_URL}/api/books/${bookId}`)
        setBooks(books.filter((book) => book._id !== bookId))
      } catch (err) {
        setError("Failed to delete book")
        console.error(err)
      }
    }
  }

  const filteredBooks = books.filter((book) => {
    if (activeTab === "listed") {
      return book.status === "available"
    } else if (activeTab === "sold") {
      return book.status === "sold"
    } else if (activeTab === "rented") {
      return book.saleType === "rent" && book.status === "rented"
    }
    return true
  })

  if (loading) return <Spinner />

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <Link to="/post-book" className="btn btn-primary">
          <i className="fas fa-plus"></i> Post New Book
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === "listed" ? "active" : ""}`} onClick={() => setActiveTab("listed")}>
          Listed Books
        </button>
        <button className={`tab-btn ${activeTab === "sold" ? "active" : ""}`} onClick={() => setActiveTab("sold")}>
          Sold Books
        </button>
        <button className={`tab-btn ${activeTab === "rented" ? "active" : ""}`} onClick={() => setActiveTab("rented")}>
          Rented Books
        </button>
        <button className={`tab-btn ${activeTab === "messages" ? "active" : ""}`} onClick={() => setActiveTab("messages")}>
          Messages
        </button>
      </div>

      {/* MESSAGES TAB */}
      {activeTab === "messages" && (
        <div className="messages-section">
          {messages.length === 0 ? (
            <p>You haven't received any messages yet.</p>
          ) : (
            <ul className="message-list">
              {messages.map((msg) => (
                <li key={msg._id} className="message-item">
                  <strong>From:</strong> {msg.senderName} <br />
                  <strong>Book:</strong> {msg.bookName} <br />
                  <strong>Message:</strong> {msg.text} <br />
                  <Link to={`/messages/${msg.conversationId}`} className="btn btn-sm btn-primary mt-2">
                    View Conversation
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* BOOKS TABLE */}
      {activeTab !== "messages" && filteredBooks.length === 0 ? (
        <div className="no-books-message">
          <p>You don't have any {activeTab} books.</p>
          {activeTab === "listed" && (
            <Link to="/post-book" className="btn btn-secondary">
              Post a Book Now
            </Link>
          )}
        </div>
      ) : (
        activeTab !== "messages" && (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td className="book-info">
                      <img
                        src={book.image || "/placeholder.svg?height=60&width=40"}
                        alt={book.name}
                        className="book-thumbnail"
                      />
                      <div>
                        <h4>{book.name}</h4>
                        <p>
                          {book.subject} - {book.branch}
                        </p>
                      </div>
                    </td>
                    <td>₹{book.price}</td>
                    <td>{book.saleType === "sell" ? "For Sale" : "For Rent"}</td>
                    <td>
                      <span className={`status-badge status-${book.status}`}>
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {book.status === "available" && (
                        <>
                          <Link to={`/post-book?edit=${book._id}`} className="action-btn edit-btn">
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className="action-btn toggle-btn"
                            onClick={() => handleToggleActive(book._id, book.isActive)}
                            title={book.isActive ? "Disable Ad" : "Enable Ad"}
                          >
                            <i className={`fas ${book.isActive ? "fa-eye-slash" : "fa-eye"}`}></i>
                          </button>
                          <button
                            className="action-btn sold-btn"
                            onClick={() => handleMarkAsSold(book._id)}
                            title="Mark as Sold"
                          >
                            <i className="fas fa-check-circle"></i>
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteBook(book._id)}
                            title="Delete Book"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </>
                      )}
                      {book.status !== "available" && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteBook(book._id)}
                          title="Delete Book"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}

export default Dashboard
