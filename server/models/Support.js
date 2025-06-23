const mongoose = require("mongoose")

const SupportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open",
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("support", SupportSchema)
