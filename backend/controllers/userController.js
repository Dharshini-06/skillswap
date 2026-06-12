const User = require("../models/user");
const SwapRequest = require("../models/SwapRequest");

// Helper to handle skill formatting (converts string to array, trims values)
const formatSkills = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
        return skills.map(s => s.trim()).filter(Boolean);
    }
    if (typeof skills === 'string') {
        return skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

// Onboarding Save Logic
exports.completeOnboarding = async (req, res) => {
    try {
        const { userId, ...onboardingData } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Dynamically update user fields with data from frontend
        // This ensures all roles (Student, Teacher, Skillswapper) are handled
        Object.keys(onboardingData).forEach((key) => {
            if (key === 'skillsToLearn' || key === 'skillsToTeach') {
                user[key] = formatSkills(onboardingData[key]);
            } else {
                user[key] = onboardingData[key];
            }
        });

        user.onboardingCompleted = true;

        await user.save();

        console.log("Onboarding data saved for user:", userId);

        res.status(200).json({
            message: "Onboarding completed successfully!",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("Onboarding Save Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// Mutual Skill Matching Logic
exports.getMatches = async (req, res) => {
    try {
        // Use req.user.id from authMiddleware
        const userId = req.user?.id || req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ message: "User ID missing" });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Matching Logic: 
        // 1. Their expertise matches your learning goals (Case-insensitive)
        // 2. Your expertise matches their learning goals (Case-insensitive)

        // Create case-insensitive regex for each skill (escaping special symbols like + or .)
        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const learnRegex = (currentUser.skillsToLearn || []).map(skill => new RegExp(`^${escapeRegex(skill.trim())}$`, "i"));
        const teachRegex = (currentUser.skillsToTeach || []).map(skill => new RegExp(`^${escapeRegex(skill.trim())}$`, "i"));

        const matches = await User.find({
            _id: { $ne: currentUser._id },
            skillsToTeach: { $in: learnRegex }
        }).select("name skillsToTeach skillsToLearn bio teachingStats");

        // Format for frontend (skillsOffered/skillsWanted)
        const formattedMatches = matches.map(user => ({
            _id: user._id,
            name: user.name,
            skillsOffered: user.skillsToTeach,
            skillsWanted: user.skillsToLearn,
            bio: user.bio,
            teachingStats: user.teachingStats || []
        }));

        res.json(formattedMatches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Notification System
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ message: "User ID header missing" });
        }

        const user = await User.findById(userId).select("notifications");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Dashboard Fetch Logic
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({ message: "User ID header missing" });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch all requests involving the current user
        const allRelatedReqs = await SwapRequest.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).populate("sender", "name email").populate("receiver", "name email");

        // Group by user pair to display only one request per pair
        const uniqueRequestsMap = new Map();

        allRelatedReqs.forEach(req => {
            const otherUser = String(req.sender._id) === String(userId) ? req.receiver : req.sender;
            if (!otherUser) return; // Should not happen with valid data

            const pairKey = [String(userId), String(otherUser._id)].sort().join("-");

            if (!uniqueRequestsMap.has(pairKey)) {
                uniqueRequestsMap.set(pairKey, req);
            } else {
                // Priority: accepted > pending > rejected
                const existing = uniqueRequestsMap.get(pairKey);
                const statusPriority = { "accepted": 3, "pending": 2, "rejected": 1 };
                if (statusPriority[req.status] > statusPriority[existing.status]) {
                    uniqueRequestsMap.set(pairKey, req);
                }
            }
        });

        const uniqueRequests = Array.from(uniqueRequestsMap.values());

        // Distribute into Pending (Incoming) and Sent/History
        const pendingRequests = uniqueRequests
            .filter(req => {
                const rObjectId = req.receiver._id || req.receiver;
                return String(rObjectId) === String(userId) && req.status === "pending";
            })
            .map(req => {
                const reqObj = req.toObject();
                return {
                    _id: reqObj._id,
                    status: reqObj.status,
                    sender: {
                        ...reqObj.sender,
                        // Fix for UI: "X sent you a request for [skillsWanted]"
                        skillsWanted: reqObj.skillsWanted || [],
                        skillsOffered: reqObj.skillsOffered || []
                    },
                    receiver: reqObj.receiver,
                    skillsWanted: reqObj.skillsWanted,
                    skillsOffered: reqObj.skillsOffered,
                    createdAt: reqObj.createdAt
                };
            });

        const sentRequests = uniqueRequests
            .filter(req => {
                const rObjectId = req.receiver._id || req.receiver;
                return !(String(rObjectId) === String(userId) && req.status === "pending");
            })
            .map(req => {
                const reqObj = req.toObject();
                const isSender = String(reqObj.sender._id || reqObj.sender) === String(userId);
                const otherParty = isSender ? reqObj.receiver : reqObj.sender;

                if (!otherParty) return null;

                return {
                    _id: reqObj._id,
                    status: reqObj.status,
                    sender: reqObj.sender,
                    receiver: {
                        ...otherParty,
                        // Fix for UI: "Your request to {name} for {skillsOffered.join(', ')}"
                        skillsOffered: reqObj.skillsWanted || [],
                        skillsWanted: reqObj.skillsOffered || []
                    },
                    skillsWanted: reqObj.skillsWanted,
                    skillsOffered: reqObj.skillsOffered,
                    createdAt: reqObj.createdAt
                };
            }).filter(Boolean);

        // Matched users list logic (excluding users who already have a request)
        const usersWithRequests = new Set(uniqueRequests.map(req => {
            const sId = req.sender._id ? String(req.sender._id) : String(req.sender);
            const rId = req.receiver._id ? String(req.receiver._id) : String(req.receiver);
            return sId === String(userId) ? rId : sId;
        }));

        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const learnRegexList = (currentUser.skillsToLearn || []).map(skill => new RegExp(`^${escapeRegex(skill.trim())}$`, "i"));

        const matchedUsersRaw = await User.find({
            _id: { $ne: userId, $nin: Array.from(usersWithRequests) },
            skillsToTeach: { $in: learnRegexList }
        }).select("name email skillsToTeach skillsToLearn bio teachingStats");

        const matchedUsers = matchedUsersRaw.map(user => ({
            _id: user._id,
            name: user.name,
            skillsOffered: user.skillsToTeach,
            skillsWanted: user.skillsToLearn,
            bio: user.bio,
            teachingStats: user.teachingStats || []
        }));

        res.json({
            pendingRequests,
            sentRequests,
            matchedUsers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Rate a Skill
exports.rateSkill = async (req, res) => {
    try {
        const { mentorId, skillName, rating } = req.body;

        if (!mentorId || !skillName || rating === undefined) {
            return res.status(400).json({ message: "Mentor ID, skill name, and rating are required" });
        }

        const user = await User.findById(mentorId);
        if (!user) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        if (!user.teachingStats) user.teachingStats = [];

        let skillStat = user.teachingStats.find(s => s.skillName.toLowerCase() === skillName.toLowerCase());

        if (!skillStat) {
            skillStat = {
                skillName: skillName,
                averageRating: rating,
                totalRatings: 1,
                totalSessions: 1
            };
            user.teachingStats.push(skillStat);
        } else {
            const currentTotal = skillStat.totalRatings || 0;
            const currentAvg = skillStat.averageRating || 0;
            const newTotal = currentTotal + 1;
            const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

            skillStat.averageRating = Number(newAvg.toFixed(1));
            skillStat.totalRatings = newTotal;
            skillStat.totalSessions = (skillStat.totalSessions || 0) + 1;
        }

        await user.save();
        res.status(200).json({ message: "Rating submitted successfully", teachingStats: user.teachingStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
