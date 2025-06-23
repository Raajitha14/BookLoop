import { Link } from "react-router-dom"
import "./BookItem.css"

const BookItem = ({ book }) => {
  return (
    <div className="book-item">
      <div className="book-image">
        <img src={book.image || "/placeholder.svg?height=200&width=150"} alt={book.name} />
        <span className={`book-type-badge ${book.saleType}`}>{book.saleType === "sell" ? "For Sale" : "For Rent"}</span>
      </div>

      <div className="book-details">
        <h3 className="book-title">{book.name}</h3>
        <p className="book-subject">{book.subject}</p>
        <p className="book-branch">{book.branch}</p>
        {book.edition && <p className="book-edition">{book.edition}</p>}

        <div className="book-price-container">
          <span className="book-price">₹{book.price}</span>
          {book.saleType === "rent" && <span className="book-rental-duration">{book.rentalDuration} days</span>}
        </div>

        <Link to={`/book/${book._id}`} className="view-details-btn">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default BookItem
