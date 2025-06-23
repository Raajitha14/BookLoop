const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const auth = require("../middleware/auth")

const Feedback = require("../models/Feedback")

// @route   POST api/feedback
// @desc    Submit feedback
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("message", "Message is required").not().isEmpty(),
    check("rating", "Rating is required").isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { name, email, message, rating } = req.body

      const newFeedback = new Feedback({
        name,
        email,
        message,
        rating,
      })

      const feedback = await newFeedback.save()
      res.json(feedback)
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
  },
)

// @route   GET api/feedback
// @desc    Get all feedback
// @access  Private/Admin (would need admin middleware)
router.get("/", auth, async (req, res) => {
  try {
    // In a real app, you would check if the user is an admin
    const feedback = await Feedback.find().sort({ date: -1 })
    res.json(feedback)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
