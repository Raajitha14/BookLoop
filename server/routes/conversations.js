const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")

const Conversation = require("../models/Conversation")

// @route   POST api/conversations
// @desc    Create a new conversation
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { senderId, receiverId, bookId } = req.body

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
      bookId,
    })

    if (existingConversation) {
      return res.status(200).json(existingConversation)
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
      bookId,
    })

    const savedConversation = await newConversation.save()
    res.status(200).json(savedConversation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/conversations/:userId
// @desc    Get conversations of a user
// @access  Private
router.get("/:userId", auth, async (req, res) => {
  try {
    // Check if the requesting user is the same as the user whose conversations are being requested
    if (req.user.id !== req.params.userId) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    })
    res.status(200).json(conversations)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/conversations/find/:firstUserId/:secondUserId
// @desc    Get conversation between two users
// @access  Private
router.get("/find/:firstUserId/:secondUserId", auth, async (req, res) => {
  try {
    // Check if the requesting user is one of the users in the conversation
    if (req.user.id !== req.params.firstUserId && req.user.id !== req.params.secondUserId) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    })
    res.status(200).json(conversation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
