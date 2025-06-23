"use client"

import { useState } from "react"
import axios from "axios"
import { API_URL } from "../config"
import "./About.css"

import { useNavigate } from "react-router-dom"
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import buy from '../assets/buy.jpg';
import sell from '../assets/sell.jpg';
import rent from '../assets/rent.jpg';

const About = () => {
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const { name, email, message, rating } = feedbackData

  const onChange = (e) => {
    setFeedbackData({ ...feedbackData, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      await axios.post(`${API_URL}/api/feedback`, feedbackData)
      setSubmitted(true)
      setFeedbackData({
        name: "",
        email: "",
        message: "",
        rating: 5,
      })
    } catch (err) {
      setError("Failed to submit feedback")
      console.error(err)
    }
  }

   const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000, // 1 seconds
  };

  const carouselSlides = [
    {
      img: buy,
      title: "Buy Old Books",
      desc: "Browse a wide range of quality pre-owned books at affordable prices. Enjoy the joy of reading without spending a fortune.",
    },
    {
      img: sell,
      title: "Sell Your Books",
      desc: "Declutter your shelf and earn by selling your old books to fellow readers. It's easy, quick, and helps books find new homes.",
    },
    {
      img: rent,
      title: "Rent and Read",
      desc: "Access a vast library of books without owning them. Rent for short or long periods and return when you're done — smart and budget-friendly.",
    },
  ];


  return (
    <div className="about-container">
      <section className="about-section">
        <h1>About BookLoop</h1>
        <p>
          BookLoop is a platform designed to connect students and book enthusiasts, making it easy to buy, sell, or rent
          second-hand books. Our mission is to make education more affordable and sustainable by giving books a second
          life.
        </p>

        
       {/* Carousel */}
      <div className="home-carousel">
        <Slider {...settings}>
          {carouselSlides.map((slide, index) => (
            <div className="carousel-slide" key={index}>
              <img src={slide.img} alt={`Slide ${index + 1}`} />
              <div className="slide-caption">
                <h3>{slide.title}</h3>
                <h4 color="white">{slide.desc}</h4>
              </div>
            </div>
          ))}
        </Slider>
      </div>

        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            At BookLoop, we believe that knowledge should be accessible to everyone. By creating a marketplace for
            second-hand books, we're helping to:
          </p>
          <ul>
            <li>Reduce the financial burden of education</li>
            <li>Promote sustainability through reuse</li>
            <li>Build a community of book lovers and learners</li>
            <li>Make it easy to find the books you need</li>
          </ul>
        </div>
      </section>

      <section className="how-it-works-section">
        <h2>How It Works</h2>

        <div className="steps-container">
          <div className="step">
            <div className="step-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <h3>Create an Account</h3>
            <p>Sign up for free and set up your profile to start using BookLoop.</p>
          </div>

          <div className="step">
            <div className="step-icon">
              <i className="fas fa-book"></i>
            </div>
            <h3>List Your Books</h3>
            <p>Post books you want to sell or rent with details and photos.</p>
          </div>

          <div className="step">
            <div className="step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3>Find Books</h3>
            <p>Search for the books you need using filters for subject, branch, etc.</p>
          </div>

          <div className="step">
            <div className="step-icon">
              <i className="fas fa-comments"></i>
            </div>
            <h3>Connect</h3>
            <p>Chat with sellers or buyers securely within the platform.</p>
          </div>
        </div>
      </section>

      <section className="feedback-section">
        <h2>We Value Your Feedback</h2>
        <p>Help us improve BookLoop by sharing your thoughts and suggestions.</p>

        {submitted ? (
          <div className="feedback-success">
            <i className="fas fa-check-circle"></i>
            <h3>Thank You!</h3>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={onSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={onChange}
                placeholder="Your feedback or suggestions"
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="rating">Rate Your Experience</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <label key={star} className="star-label">
                    <input
                      type="radio"
                      name="rating"
                      value={star}
                      checked={Number.parseInt(rating) === star}
                      onChange={onChange}
                    />
                    <i className={`fas fa-star ${Number.parseInt(rating) >= star ? "active" : ""}`}></i>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Feedback
            </button>
          </form>
        )}
      </section>

      <section className="team-section">
        <h2>Our Team</h2>
        <p>
          BookLoop was created by a team of students who experienced firsthand the challenges of finding affordable
          textbooks.
        </p>

        <div className="team-members">
          <div className="team-member">
            <div className="member-avatar">
              <i className="fas fa-user"></i>
            </div>
            <h3>Rajitha K R</h3>
            <p>Founder & Developer</p>
          </div>

          <div className="team-member">
            <div className="member-avatar">
              <i className="fas fa-user"></i>
            </div>
            <h3>Prathiksha M D</h3>
            <p>UX Designer</p>
          </div>

          <div className="team-member">
            <div className="member-avatar">
              <i className="fas fa-user"></i>
            </div>
            <h3>Mike Johnson</h3>
            <p>Marketing Specialist</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
