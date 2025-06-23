"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/layout/Spinner"
import { API_URL } from "../config"
import "./PostBook.css"

const PostBook = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [bookId, setBookId] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    branch: "",
    subject: "",
    edition: "",
    price: "",
    description: "",
    saleType: "sell",
    rentalDuration: "",
    lateFee: "",
    image: null,
  })

  const { name, branch, subject, edition, price, description, saleType, rentalDuration, lateFee, image } = formData

  useEffect(() => {
    // Check if we're editing an existing book
    const query = new URLSearchParams(location.search)
    const editId = query.get("edit")

    if (editId) {
      setIsEditing(true)
      setBookId(editId)
      fetchBookDetails(editId)
    }
  }, [location.search])

  const fetchBookDetails = async (id) => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/books/${id}`)

      // Populate form with book details
      setFormData({
        name: res.data.name,
        branch: res.data.branch,
        subject: res.data.subject,
        edition: res.data.edition,
        price: res.data.price,
        description: res.data.description || "",
        saleType: res.data.saleType,
        rentalDuration: res.data.rentalDuration || "",
        lateFee: res.data.lateFee || "",
        image: null, // We don't populate the image field
      })
    } catch (err) {
      setError("Failed to fetch book details")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    if (e.target.name === "image") {
      setFormData({ ...formData, image: e.target.files[0] })
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Clear error when user makes changes
    setError(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!name || !branch || !subject || !price) {
      setError("Please fill in all required fields")
      return
    }

    if (saleType === "rent" && (!rentalDuration || !lateFee)) {
      setError("Rental duration and late fee are required for rental books")
      return
    }

    try {
      setLoading(true)

      // Create FormData object for file upload
      const bookData = new FormData()
      bookData.append("name", name)
      bookData.append("branch", branch)
      bookData.append("subject", subject)
      bookData.append("edition", edition)
      bookData.append("price", price)
      bookData.append("description", description)
      bookData.append("saleType", saleType)

      if (saleType === "rent") {
        bookData.append("rentalDuration", rentalDuration)
        bookData.append("lateFee", lateFee)
      }

      if (image) {
        bookData.append("image", image)
      }

      if (isEditing) {
        await axios.put(`${API_URL}/api/books/${bookId}`, bookData)
      } else {
        await axios.post(`${API_URL}/api/books`, bookData)
      }

      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to post book")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="post-book-container">
      <div className="post-book-header">
        <h1>{isEditing ? "Edit Book" : "Post a Book"}</h1>
        <p>
          {isEditing
            ? "Update your book listing information"
            : "Fill in the details to list your book for sale or rent"}
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form className="post-book-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Book Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Enter book name"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="branch">Branch/Department *</label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={branch}
              onChange={onChange}
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={subject}
              onChange={onChange}
              placeholder="e.g., Database Management"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edition">Edition</label>
            <input
              type="text"
              id="edition"
              name="edition"
              value={edition}
              onChange={onChange}
              placeholder="e.g., 3rd Edition"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={price}
              onChange={onChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            placeholder="Describe the condition and other details of the book"
            rows="4"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Sale Type *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input type="radio" name="saleType" value="sell" checked={saleType === "sell"} onChange={onChange} />
              Sell
            </label>
            <label className="radio-label">
              <input type="radio" name="saleType" value="rent" checked={saleType === "rent"} onChange={onChange} />
              Rent
            </label>
          </div>
        </div>

        {saleType === "rent" && (
          <div className="rental-details">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rentalDuration">Rental Duration (days) *</label>
                <input
                  type="number"
                  id="rentalDuration"
                  name="rentalDuration"
                  value={rentalDuration}
                  onChange={onChange}
                  placeholder="e.g., 30"
                  min="1"
                  required={saleType === "rent"}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lateFee">Late Fee(₹ per day) *</label>
                <input
                  type="number"
                  id="lateFee"
                  name="lateFee"
                  value={lateFee}
                  onChange={onChange}
                  placeholder="e.g., 1.50"
                  min="0"
                  step="0.01"
                  required={saleType === "rent"}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="image">Book Image</label>
          <input type="file" id="image" name="image" onChange={onChange} accept="image/*" />
          <small>Upload a clear image of the book cover</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Update Book" : "Post Book"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostBook
