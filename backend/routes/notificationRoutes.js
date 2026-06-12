const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Message = require("../models/Message");

// Create notifications from past session invites (run lazily)
const migratePastSessionInvites = async (userId) => {
    try {
        const messages = await Message.find({ sender: userId, type: "session_invite" }).populate("receiver", "name");
        for (const msg of messages) {
            const time = new Date(msg.createdAt).toLocaleTimeString();
            const messageText = ` Session invite sent to ${msg.receiver?.name || 'Unknown'} at ${time}`;

            // Check if notification already exists to avoid duplicates
            const exists = await Notification.findOne({ userId, type: "email", message: messageText });
            if (!exists) {
                await Notification.create({
                    userId,
                    message: messageText,
                    type: "email",
                    createdAt: msg.createdAt
                });
            }
        }
    } catch (err) {
        console.error("Error migrating past invites:", err);
    }
};

router.get("/", async (req, res) => {
    try {
        // The user used req.user.id in the example but the auth middleware might use headers["x-user-id"]. Let's check headers.
        const userId = req.headers["x-user-id"] || req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        await migratePastSessionInvites(userId);

        const notifications = await Notification.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/read/:id", async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            isRead: true
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
