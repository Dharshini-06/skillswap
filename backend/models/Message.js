const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        skill: {
            type: String,
        },
        meetingLink: {
            type: String,
        },
        startTime: {
            type: String,
        },
        sessionType: {
            type: String,
        },
        type: {
            type: String,
            enum: ["text", "session_invite"],
            default: "text",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
