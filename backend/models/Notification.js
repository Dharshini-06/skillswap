const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: String,
    type: String, // email, session, system
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    link: String
});

module.exports = mongoose.model("Notification", notificationSchema);
