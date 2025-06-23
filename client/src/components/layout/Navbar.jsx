"use client"

import { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const authLinks = (
    <>
      <li>
        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
          Dashboard
        </Link>
      </li>
      <li>
        <Link to="/post-book" onClick={() => setIsMenuOpen(false)}>
          Sell/Rent Book
        </Link>
      </li>
      <li>
        <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
          Messages
        </Link>
      </li>
      {/* <li>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </li> */}
    </>
  )

  const guestLinks = (
    <>
      <li>
        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
          Login
        </Link>
      </li>
      <li>
        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
          Register
        </Link>
      </li>
    </>
  )

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-book"></i> BookLoop
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <ul className={isMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>
              About
            </Link>
          </li>
          {isAuthenticated ? authLinks : guestLinks}
        </ul>

        {isAuthenticated && user && (
  <div className="profile-container">
    <div className="profile-circle" onClick={toggleMenu}>
      {user.name.charAt(0).toUpperCase()}
    </div>

    {isMenuOpen && (
      <div className="profile-dropdown">
        <div className="profile-info">
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    )}
  </div>
)}

      </div>
    </nav>
  )
}

export default Navbar
