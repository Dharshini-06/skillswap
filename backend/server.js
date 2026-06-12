const OpenAI = require("openai");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const cors = require("cors");
const path = require('path');
const app = express();

// middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });
// Safe Hybrid AI Setup
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  console.log("OpenAI Connected");
} else {
  console.log("OpenAI API Key missing. Using Local AI Fallback.");
}

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api", require("./routes/swapRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));

// Serve uploaded resume files statically from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// test route
app.get("/", (req, res) => {
  res.send("SkillSwap Backend LIVE");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
