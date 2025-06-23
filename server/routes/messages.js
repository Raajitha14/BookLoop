const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")

const Message = require("../models/Message")
const Conversation = require("../models/Conversation")

// @route   POST api/messages
// @desc    Add a message
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body

    // Check if the sender is the authenticated user
    if (sender !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" })
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" })
    }

    // Check if the sender is part of the conversation
    if (!conversation.members.includes(sender)) {
      return res.status(401).json({ msg: "Not authorized to send messages in this conversation" })
    }

    const newMessage = new Message({
      conversationId,
      sender,
      text,
    })

    const savedMessage = await newMessage.save()
    res.status(200).json(savedMessage)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   GET api/messages/:conversationId
// @desc    Get messages for a conversation
// @access  Private
router.get("/:conversationId", auth, async (req, res) => {
  try {
    // Check if conversation exists
    const conversation = await Conversation.findById(req.params.conversationId)
    if (!conversation) {
      return res.status(404).json({ msg: "Conversation not found" })
    }

    // Check if the user is part of the conversation
    if (!conversation.members.includes(req.user.id)) {
      return res.status(401).json({ msg: "Not authorized to view these messages" })
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
    res.status(200).json(messages)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
