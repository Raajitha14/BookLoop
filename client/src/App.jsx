import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ChatProvider } from "./context/ChatContext"
import PrivateRoute from "./components/routing/PrivateRoute"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import BookDetails from "./pages/BookDetails"
import PostBook from "./pages/PostBook"
import Chat from "./pages/Chat"
import About from "./pages/About"
import NotFound from "./pages/NotFound"

// Components
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route path="/about" element={<About />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/post-book"
                  element={
                    <PrivateRoute>
                      <PostBook />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat/:bookId?/:userId?"
                  element={
                    <PrivateRoute>
                      <Chat />
                    </PrivateRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
