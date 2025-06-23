"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"
import { API_URL } from "../config"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          setLoading(false)
          return
        }

        // Set auth token header
        axios.defaults.headers.common["x-auth-token"] = token

        const res = await axios.get(`${API_URL}/api/auth`)

        setUser(res.data)
        setIsAuthenticated(true)
      } catch (err) {
        localStorage.removeItem("token")
        setIsAuthenticated(false)
        setUser(null)
        setError(err.response?.data?.msg || "Authentication failed")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true)
      const res = await axios.post(`${API_URL}/api/users`, formData)

      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["x-auth-token"] = res.data.token

      // Load user data
      const userRes = await axios.get(`${API_URL}/api/auth`)
      setUser(userRes.data)
      setIsAuthenticated(true)
      setError(null)
      return true
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true)
      const res = await axios.post(`${API_URL}/api/auth`, { email, password })

      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["x-auth-token"] = res.data.token

      // Load user data
      const userRes = await axios.get(`${API_URL}/api/auth`)
      setUser(userRes.data)
      setIsAuthenticated(true)
      setError(null)
      return true
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth login
  const googleLogin = async (tokenId) => {
    try {
      setLoading(true)
      const res = await axios.post(`${API_URL}/api/auth/google`, { tokenId })

      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["x-auth-token"] = res.data.token

      // Load user data
      const userRes = await axios.get(`${API_URL}/api/auth`)
      setUser(userRes.data)
      setIsAuthenticated(true)
      setError(null)
      return true
    } catch (err) {
      setError(err.response?.data?.msg || "Google login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["x-auth-token"]
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
