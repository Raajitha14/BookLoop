"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import Spinner from "../components/layout/Spinner"
import "./Auth.css"

const Login = () => {
  const { login, googleLogin, isAuthenticated, loading, error } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [formError, setFormError] = useState("")

  const { email, password } = formData

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

    if (!email || !password) {
      setFormError("Please enter all fields")
      return
    }

    const success = await login(email, password)
    if (success) {
      navigate("/dashboard")
    }
  }

  const handleGoogleLogin = async () => {
    // In a real app, you would use the Google OAuth API
    // For this example, we'll just simulate it
    alert("Google OAuth would be implemented here with a real API key")

    // Simulated successful login
    // const success = await googleLogin(tokenId);
    // if (success) {
    //   navigate('/dashboard');
    // }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Login to BookLoop</h1>
        <p className="auth-subtitle">Access your account to buy, sell, or rent books</p>

        {formError && <div className="alert alert-danger">{formError}</div>}

        <form className="auth-form" onSubmit={onSubmit}>
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
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} className="btn btn-google btn-block">
          <i className="fab fa-google"></i> Login with Google
        </button>

        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
