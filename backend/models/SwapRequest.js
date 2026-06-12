const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "ongoing", "completed"],
            default: "pending",
        },
        learningSkill: {
            type: String,
            default: "General Skills"
        },
        teachingSkill: {
            type: String,
            default: "General Skills"
        },
        sessionType: {
            type: String,
            enum: ["chat", "video", "inperson", "teaching", "learning", ""],
            default: ""
        },

        totalSessions: {

            type: Number,
            default: 10
        },
        completedSessions: {
            type: Number,
            default: 0
        },
        steps: {
            requestSent: { type: Boolean, default: true },
            accepted: { type: Boolean, default: false },
            sessionStarted: { type: Boolean, default: false },
            sessionsCompleted: { type: Boolean, default: false },
            feedbackGiven: { type: Boolean, default: false },
            completed: { type: Boolean, default: false }
        },
        skillsOffered: [String],
        skillsWanted: [String],
        rating: { type: Number, default: 0 },
        feedbackDescription: { type: String, default: "" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
