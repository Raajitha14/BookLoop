const express = require("express")
const router = express.Router()
const { check, validationResult } = require("express-validator")
const auth = require("../middleware/auth")
const nodemailer = require("nodemailer")

const Support = require("../models/Support")

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

// @route   POST api/support
// @desc    Create a support ticket
// @access  Public (can be used by chatbot)
router.post("/", [check("message", "Message is required").not().isEmpty()], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { message, userId } = req.body

    const newSupport = new Support({
      message,
      userId,
    })

    const support = await newSupport.save()

    // Send email notification to admin
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: "New Support Ticket",
        text: `A new support ticket has been created.\n\nMessage: ${message}\nUser ID: ${userId || "Anonymous"}`,
      }

      await transporter.sendMail(mailOptions)
    } catch (emailErr) {
      console.error("Email notification error:", emailErr)
      // Continue even if email fails
    }

    res.json(support)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/support
// @desc    Get all support tickets
// @access  Private/Admin (would need admin middleware)
router.get("/", auth, async (req, res) => {
  try {
    // In a real app, you would check if the user is an admin
    const support = await Support.find().sort({ date: -1 })
    res.json(support)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   PUT api/support/:id
// @desc    Update support ticket status
// @access  Private/Admin (would need admin middleware)
router.put("/:id", auth, async (req, res) => {
  try {
    // In a real app, you would check if the user is an admin
    const { status } = req.body

    if (!["open", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" })
    }

    const support = await Support.findByIdAndUpdate(req.params.id, { status }, { new: true })

    if (!support) {
      return res.status(404).json({ msg: "Support ticket not found" })
    }

    res.json(support)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
