"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import BookItem from "../components/books/BookItem"
import SearchFilters from "../components/books/SearchFilters"
import Chatbot from "../components/chatbot/Chatbot"
import Spinner from "../components/layout/Spinner"
import { API_URL } from "../config"

import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"

import "./Home.css"


const Home = () => {

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    subject: "",
    saleType: "",
  })
  const [showChatbot, setShowChatbot] = useState(false)

 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams()
        if (filters.search) queryParams.append("search", filters.search)
        if (filters.branch) queryParams.append("branch", filters.branch)
        if (filters.subject) queryParams.append("subject", filters.subject)
        if (filters.saleType) queryParams.append("saleType", filters.saleType)

        const res = await axios.get(`${API_URL}/api/books?${queryParams.toString()}`)
        setBooks(res.data)
      } catch (err) {
        setError("Failed to fetch books")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot)
  }

  if (loading) return <Spinner />

  return (
    <div className="home-container">
      {/* ------------------ Hero Section ------------------ */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Buy, Sell, and Rent Books with BookLoop</h1>
          <p>Your one-stop marketplace for second-hand academic books</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>




      {/* ------------------ Search Filters ------------------ */}
      <section className="search-section">
        <h2>Find Your Books</h2>
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
      </section>

      {/* ------------------ Book Listings ------------------ */}
      <section className="books-section">
        <h2>Available Books</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {books.length === 0 ? (
          <div className="no-books">
            <p>No books found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookItem key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------ Chatbot ------------------ */}
      <div className="chatbot-toggle" onClick={toggleChatbot}>
        <i className="fas fa-comment-dots"></i>
      </div>
      {showChatbot && <Chatbot onClose={toggleChatbot} />}
    </div>
  )
}

export default Home
