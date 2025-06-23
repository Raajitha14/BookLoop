const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const cloudinary = require("cloudinary").v2
const fs = require("fs")

const Book = require("../models/Book")
const User = require("../models/User")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { search, branch, subject, saleType } = req.query

    // Build filter object
    const filter = { isActive: true, status: "available" }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (branch) {
      filter.branch = { $regex: branch, $options: "i" }
    }

    if (subject) {
      filter.subject = { $regex: subject, $options: "i" }
    }

    if (saleType) {
      filter.saleType = saleType
    }

    const books = await Book.find(filter).sort({ date: -1 })
    res.json(books)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/books/filters
// @desc    Get filter options
// @access  Public
router.get("/filters", async (req, res) => {
  try {
    // Get unique branches
    const branches = await Book.distinct("branch")

    // Get unique subjects
    const subjects = await Book.distinct("subject")

    res.json({
      branches,
      subjects,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/books/user/:userId
// @desc    Get all books for a user
// @access  Private
router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Check if requesting user is the same as the user whose books are being requested
    if (req.user.id !== req.params.userId) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const books = await Book.find({ user: req.params.userId }).sort({ date: -1 })
    res.json(books)
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" })
    }

    res.status(500).send("Server Error")
  }
})

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.json(book)
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.status(500).send("Server Error")
  }
})

// @route   POST api/books
// @desc    Create a book
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required").not().isEmpty(),
      check("branch", "Branch is required").not().isEmpty(),
      check("subject", "Subject is required").not().isEmpty(),
      check("price", "Price is required").not().isEmpty(),
      check("saleType", "Sale type is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, branch, subject, edition, price, description, saleType, rentalDuration, lateFee } = req.body

      // Create new book object
      const newBook = new Book({
        name,
        branch,
        subject,
        edition,
        price,
        description,
        saleType,
        user: req.user.id,
      })

      // Add rental details if saleType is rent
      if (saleType === "rent") {
        if (!rentalDuration || !lateFee) {
          return res.status(400).json({ msg: "Rental duration and late fee are required for rental books" })
        }
        newBook.rentalDuration = rentalDuration
        newBook.lateFee = lateFee
      }

      // Handle image upload
      if (req.files && req.files.image) {
        const file = req.files.image
        // Only attempt Cloudinary upload when credentials are provided
        if (
          process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET
        ) {
          try {
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
              folder: "bookloop",
              resource_type: "image",
            })
            newBook.image = result.secure_url
            // Remove temp file
            fs.unlinkSync(file.tempFilePath)
          } catch (uploadErr) {
            console.error("Image upload error:", uploadErr)
            return res.status(400).json({ msg: "Error uploading image" })
          }
        } else {
          console.warn("Cloudinary not configured; skipping image upload.")
        }
      }

      const book = await newBook.save()
      res.json(book)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
  },
)

// @route   PUT api/books/:id
// @desc    Update a book
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ msg: "Book not found" })
    }

    // Check user
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const { name, branch, subject, edition, price, description, saleType, rentalDuration, lateFee } = req.body

    // Build book object
    const bookFields = {}
    if (name) bookFields.name = name
    if (branch) bookFields.branch = branch
    if (subject) bookFields.subject = subject
    if (edition) bookFields.edition = edition
    if (price) bookFields.price = price
    if (description) bookFields.description = description
    if (saleType) bookFields.saleType = saleType

    // Add rental details if saleType is rent
    if (saleType === "rent") {
      if (!rentalDuration || !lateFee) {
        return res.status(400).json({ msg: "Rental duration and late fee are required for rental books" })
      }
      bookFields.rentalDuration = rentalDuration
      bookFields.lateFee = lateFee
    }

    // Handle image upload
    if (req.files && req.files.image) {
      const file = req.files.image
      // Only attempt Cloudinary upload when credentials are provided
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        try {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "bookloop",
            resource_type: "image",
          })
          bookFields.image = result.secure_url
          // Remove temp file
          fs.unlinkSync(file.tempFilePath)
        } catch (uploadErr) {
          console.error("Image upload error:", uploadErr)
          return res.status(400).json({ msg: "Error uploading image" })
        }
      } else {
        console.warn("Cloudinary not configured; skipping image upload.")
      }
    }

    book = await Book.findByIdAndUpdate(req.params.id, { $set: bookFields }, { new: true })
    res.json(book)
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.status(500).send("Server Error")
  }
})

// @route   PUT api/books/:id/status
// @desc    Update book status (available, sold, rented)
// @access  Private
router.put("/:id/status", auth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ msg: "Book not found" })
    }

    // Check user
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const { status } = req.body

    if (!["available", "sold", "rented"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" })
    }

    book = await Book.findByIdAndUpdate(req.params.id, { status }, { new: true })
    res.json(book)
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.status(500).send("Server Error")
  }
})

// @route   PUT api/books/:id/active
// @desc    Toggle book active status
// @access  Private
router.put("/:id/active", auth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ msg: "Book not found" })
    }

    // Check user
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const { isActive } = req.body

    book = await Book.findByIdAndUpdate(req.params.id, { isActive }, { new: true })
    res.json(book)
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.status(500).send("Server Error")
  }
})

// @route   DELETE api/books/:id
// @desc    Delete a book
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ msg: "Book not found" })
    }

    // Check user
    if (book.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    await Book.findByIdAndRemove(req.params.id)
    res.json({ msg: "Book removed" })
  } catch (err) {
    console.error(err.message)

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Book not found" })
    }

    res.status(500).send("Server Error")
  }
})

module.exports = router
