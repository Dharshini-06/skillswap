const express = require("express");
const router = express.Router();
const User = require("../models/user");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/users/matches
router.get("/matches", authMiddleware, userController.getMatches);

// GET /api/users/trending-skills
router.get("/trending-skills", async (req, res) => {
    try {
        const users = await User.find({}, "skillsToTeach skillsToLearn");
        const skillCounts = {};

        users.forEach(user => {
            const allSkills = [...(user.skillsToTeach || []), ...(user.skillsToLearn || [])];
            allSkills.forEach(skill => {
                if (skill) {
                    const normalized = skill.trim();
                    skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
                }
            });
        });

        const trending = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(entry => entry[0]);

        res.json({ trending: trending.length > 0 ? trending : ["React.js", "AI/ML", "UI/UX Design", "Python", "Cloud Computing", "Web3"] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id/skills
router.get("/:id/skills", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            skillsToTeach: user.skillsToTeach || [],
            skillsToLearn: user.skillsToLearn || [],
            availableDays: user.availableDays || [],
            preferredTimeSlots: user.preferredTimeSlots || [],
            sessionMode: user.sessionMode || [],
            role: user.role,
            teachingStats: user.teachingStats || []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id/skills
router.put("/:id/skills", async (req, res) => {
    try {
        const { skillsToTeach, skillsToLearn, availableDays, preferredTimeSlots, sessionMode } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (skillsToTeach !== undefined) user.skillsToTeach = skillsToTeach;
        if (skillsToLearn !== undefined) user.skillsToLearn = skillsToLearn;
        if (availableDays !== undefined) user.availableDays = availableDays;
        if (preferredTimeSlots !== undefined) user.preferredTimeSlots = preferredTimeSlots;
        if (sessionMode !== undefined) user.sessionMode = sessionMode;

        await user.save();
        res.json({ message: "Skills and preferences updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id/preferences
router.put("/:id/preferences", async (req, res) => {
    try {
        const { availableDays, preferredTimeSlots, sessionMode } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (availableDays !== undefined) user.availableDays = availableDays;
        if (preferredTimeSlots !== undefined) user.preferredTimeSlots = preferredTimeSlots;
        if (sessionMode !== undefined) user.sessionMode = sessionMode;

        await user.save();
        res.json({ message: "Preferences updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users/rate
router.post("/rate", userController.rateSkill);

module.exports = router;
