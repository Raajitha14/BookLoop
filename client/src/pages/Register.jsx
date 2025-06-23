"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/layout/Spinner"
import "./Auth.css"

const Register = () => {
  const { register, isAuthenticated, loading, error } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  })
  const [formError, setFormError] = useState("")

  const { name, email, password, password2 } = formData

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/dashboard")
    }

    // Set form error from context
    if (error) {
      setFormError(error)
    }
  }, [isAuthenticated, navigate, error])

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormError("")
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      setFormError("Please enter all fields")
      return
    }

    if (password !== password2) {
      setFormError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters")
      return
    }

    const success = await register({
      name,
      email,
      password,
    })

    if (success) {
      navigate("/dashboard")
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Create an Account</h1>
        <p className="auth-subtitle">Join BookLoop to buy, sell, or rent second-hand books</p>

        {formError && <div className="alert alert-danger">{formError}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              placeholder="Confirm your password"
              required
              minLength="6"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>

        <p className="auth-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
