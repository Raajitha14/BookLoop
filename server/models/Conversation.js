const mongoose = require("mongoose")

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "book",
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("conversation", ConversationSchema)
