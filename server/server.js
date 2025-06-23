const express = require("express")
const connectDB = require("./config/db")
const path = require("path")
const cors = require("cors")
const http = require("http")
const socketio = require("socket.io")
const fileUpload = require("express-fileupload")

// Load environment variables
require("dotenv").config()

const app = express()

// Connect to Database
connectDB()

// Init Middleware
app.use(express.json({ extended: false }))
app.use(cors())
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  }),
)

// Define Routes
app.use("/api/users", require("./routes/users"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/books", require("./routes/books"))
app.use("/api/conversations", require("./routes/conversations"))
app.use("/api/messages", require("./routes/messages"))
app.use("/api/feedback", require("./routes/feedback"))
app.use("/api/support", require("./routes/support"))

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Socket.io connection
let users = []

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId })
}

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
  console.log("A user connected")

  // Take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
  })

  // Send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      })
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected")
    removeUser(socket.id)
    io.emit("getUsers", users)
  })
})

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
  })
}

const PORT = process.env.PORT || 5000

server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
