"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import { ChatContext } from "../context/ChatContext"
import Spinner from "../components/layout/Spinner"
import { API_URL } from "../config"
import "./BookDetails.css"

const BookDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useContext(AuthContext)
  const { createConversation } = useContext(ChatContext)

  const [book, setBook] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${API_URL}/api/books/${id}`)
        setBook(res.data)

        // Fetch seller details
        const sellerRes = await axios.get(`${API_URL}/api/users/${res.data.user}`)
        setSeller(sellerRes.data)
      } catch (err) {
        setError("Failed to fetch book details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [id])

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/book/${id}` } })
      return
    }

    if (user._id === book.user) {
      setError("You can't contact yourself as the seller")
      return
    }

    try {
      const conversation = await createConversation(book.user, book._id)
      navigate(`/chat/${conversation._id}`)
    } catch (err) {
      setError("Failed to start conversation")
      console.error(err)
    }
  }

  // Updated handleBuy: now it just opens chat with seller to start purchase discussion
  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/book/${id}` } })
      return
    }

    if (user._id === book.user) {
      setError("You can't buy your own listing")
      return
    }

    try {
      const conversation = await createConversation(book.user, book._id)
      navigate(`/chat/${conversation._id}`)
    } catch (err) {
      setError("Failed to start purchase conversation")
      console.error(err)
    }
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div className="book-details-container">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="book-details-container">
        <div className="alert alert-danger">Book not found</div>
      </div>
    )
  }

  return (
    <div className="book-details-container">
      <div className="book-details-card">
        <div className="book-image-container">
          <img src={book.image || "/placeholder.svg?height=400&width=300"} alt={book.name} className="book-image" />
        </div>

        <div className="book-info-container">
          <h1 className="book-title">{book.name}</h1>

          <div className="book-meta">
            <span className="book-branch">{book.branch}</span>
            <span className="book-subject">{book.subject}</span>
            {book.edition && <span className="book-edition">{book.edition}</span>}
          </div>

          <div className="book-price-container">
            <span className="book-price">₹{book.price}</span>
            <span className={`book-type ${book.saleType === "rent" ? "rent" : "sell"}`}>
              {book.saleType === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>

          {book.saleType === "rent" && (
            <div className="rental-info">
              <div className="rental-detail">
                <span className="rental-label">Rental Duration:</span>
                <span className="rental-value">{book.rentalDuration} days</span>
              </div>
              <div className="rental-detail">
                <span className="rental-label">Late Fee:</span>
                <span className="rental-value">{book.lateFee}/day</span>
              </div>
            </div>
          )}

          {book.description && (
            <div className="book-description">
              <h3>Description</h3>
              <p>{book.description}</p>
            </div>
          )}

          {seller && (
            <div className="seller-info">
              <h3>Seller Information</h3>
              <p className="seller-name">
                <i className="fas fa-user"></i> {seller.name}
              </p>
              <p className="seller-member-since">
                <i className="fas fa-calendar-alt"></i> Member since {new Date(seller.date).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="book-actions">
            {user && user._id === book.user ? (
              <button className="btn btn-secondary" onClick={() => navigate(`/post-book?edit=${book._id}`)}>
                <i className="fas fa-edit"></i> Edit Listing
              </button>
            ) : (
              <>
                {book.saleType === "sell" && book.isActive && book.status === "available" && (
                  <button className="btn btn-success" onClick={handleBuy}>
                    <i className="fas fa-shopping-cart"></i> Chat to Buy
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleContactSeller}
                  disabled={!book.isActive || book.status !== "available"}
                >
                  <i className="fas fa-comment"></i> Contact Seller
                </button>
              </>
            )}

            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              <i className="fas fa-arrow-left"></i> Back to Listings
            </button>
          </div>

          {(!book.isActive || book.status !== "available") && (
            <div className="book-status-message">
              <p>{!book.isActive ? "This listing is currently inactive" : "This book is no longer available"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDetails
