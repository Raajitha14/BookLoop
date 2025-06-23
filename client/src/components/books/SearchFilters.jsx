"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../../config"
import "./SearchFilters.css"

const SearchFilters = ({ filters, onFilterChange }) => {
  const [branches, setBranches] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // In a real app, you would fetch these from the backend
        // For this example, we'll simulate it
        const res = await axios.get(`${API_URL}/api/books/filters`)

        setBranches(res.data.branches || [])
        setSubjects(res.data.subjects || [])
      } catch (err) {
        console.error("Failed to fetch filter options", err)

        // Fallback data
        setBranches(["Computer Science", "Engineering", "Medicine", "Business", "Arts"])
        setSubjects(["Programming", "Database", "Networking", "Calculus", "Physics"])
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value })
  }

  const handleReset = () => {
    onFilterChange({
      search: "",
      branch: "",
      subject: "",
      saleType: "",
    })
  }

  return (
    <div className="search-filters">
      <div className="search-bar">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search by book name, author, etc."
        />
        <button className="search-btn">
          <i className="fas fa-search"></i>
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="branch">Branch</label>
          <select id="branch" name="branch" value={filters.branch} onChange={handleChange}>
            <option value="">All Branches</option>
            {branches.map((branch, index) => (
              <option key={index} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="subject">Subject</label>
          <select id="subject" name="subject" value={filters.subject} onChange={handleChange}>
            <option value="">All Subjects</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="saleType">Type</label>
          <select id="saleType" name="saleType" value={filters.saleType} onChange={handleChange}>
            <option value="">All Types</option>
            <option value="sell">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <button className="reset-btn" onClick={handleReset}>
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default SearchFilters
