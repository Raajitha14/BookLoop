import { Link } from "react-router-dom"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>BookLoop</h3>
          <p>Buy, sell, and rent second-hand books with ease.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>
            <i className="fas fa-envelope"></i> support@bookloop.com
          </p>
          <p>
            <i className="fas fa-phone"></i> +91 8848883512
          </p>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#!" className="social-icon">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#!" className="social-icon">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#!" className="social-icon">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#!" className="social-icon">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} BookLoop. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
