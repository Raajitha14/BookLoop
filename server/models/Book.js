const mongoose = require("mongoose")

const BookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  edition: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  saleType: {
    type: String,
    enum: ["sell", "rent"],
    required: true,
  },
  rentalDuration: {
    type: Number,
    required: function () {
      return this.saleType === "rent"
    },
  },
  lateFee: {
    type: Number,
    required: function () {
      return this.saleType === "rent"
    },
  },
  status: {
    type: String,
    enum: ["available", "sold", "rented"],
    default: "available",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("book", BookSchema)
