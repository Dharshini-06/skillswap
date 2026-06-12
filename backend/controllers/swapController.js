const SwapRequest = require("../models/SwapRequest");
const User = require("../models/user");
const Message = require("../models/Message");
const { sendEmail, sendSessionEmail } = require("../utils/sendEmail");
const Notification = require("../models/Notification");


// POST /api/swap/request
exports.createSwapRequest = async (req, res) => {
    try {
        const senderId = req.headers["x-user-id"];
        const { receiverId } = req.body;

        if (!senderId || !receiverId) {
            return res.status(400).json({ message: "Sender and Receiver IDs are required" });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        // Check if a request already exists between these two users (in either direction)
        const existingRequest = await SwapRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A swap request already exists between these users." });
        }

        // Calculate the intersection: skills sender wants to learn AND receiver can teach
        const matchedSkills = (sender.skillsToLearn || []).filter(skill =>
            (receiver.skillsToTeach || []).some(rs => rs.trim().toLowerCase() === skill.trim().toLowerCase())
        );

        const swapRequest = new SwapRequest({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
            learningSkill: matchedSkills.length > 0 ? matchedSkills[0] : (sender.skillsToLearn && sender.skillsToLearn.length > 0 ? sender.skillsToLearn[0] : "General Skills"),
            teachingSkill: sender.skillsToTeach && sender.skillsToTeach.length > 0 ? sender.skillsToTeach[0] : "General Skills",
            skillsOffered: sender.skillsToTeach,
            skillsWanted: matchedSkills.length > 0 ? matchedSkills : sender.skillsToLearn,

            steps: {
                requestSent: true,
                accepted: false,
                sessionStarted: false,
                sessionsCompleted: false,
                feedbackGiven: false,
                completed: false
            }
        });

        await swapRequest.save();

        // Add notification to receiver
        await User.findByIdAndUpdate(receiverId, {
            $push: {
                notifications: {
                    message: "You received a skill swap request.",
                    type: "swap",
                    read: false,
                    createdAt: new Date(),
                },
            },
        });

        // Send email notification to receiver
        try {
            const emailSkill = matchedSkills.length > 0
                ? matchedSkills[0]
                : (sender.skillsToLearn && sender.skillsToLearn.length > 0 ? sender.skillsToLearn[0] : "a skill");

            await sendEmail(
                receiver.email,
                "New Skill Swap Request",
                `${sender.name} sent you a skill swap request for ${emailSkill}.`
            );
        } catch (emailErr) {
            console.error("Failed to send request email:", emailErr);
        }

        res.status(201).json({ message: "Swap request sent", swapRequest });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/swap/accept/:requestId
exports.acceptSwapRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const swapRequest = await SwapRequest.findById(requestId);

        if (!swapRequest) {
            return res.status(404).json({ message: "Swap request not found" });
        }

        swapRequest.status = "accepted";
        swapRequest.steps.accepted = true;
        await swapRequest.save();

        // Add notification to sender
        await User.findByIdAndUpdate(swapRequest.sender, {
            $push: {
                notifications: {
                    message: "Your swap request has been accepted",
                    type: "swap",
                    read: false,
                    createdAt: new Date(),
                },
            },
        });

        // Add notification to receiver
        await User.findByIdAndUpdate(swapRequest.receiver, {
            $push: {
                notifications: {
                    message: "You have accepted the swap request",
                    type: "swap",
                    read: false,
                    createdAt: new Date(),
                },
            },
        });

        // Send email notification to sender
        try {
            const sender = await User.findById(swapRequest.sender);
            const receiver = await User.findById(swapRequest.receiver);

            if (sender && receiver) {
                const skillName = (swapRequest.skillsWanted && swapRequest.skillsWanted.length > 0)
                    ? swapRequest.skillsWanted[0]
                    : "a skill";

                await sendEmail(
                    sender.email,
                    "Skill Swap Request Accepted",
                    `${receiver.name} accepted your request for ${skillName}.`
                );
            }
        } catch (emailErr) {
            console.error("Failed to send acceptance email:", emailErr);
        }

        res.json({ message: "Swap request accepted", swapRequest });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/swap/reject/:requestId
exports.rejectSwapRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const swapRequest = await SwapRequest.findById(requestId);

        if (!swapRequest) {
            return res.status(404).json({ message: "Swap request not found" });
        }

        swapRequest.status = "rejected";
        await swapRequest.save();

        // Add notification to sender
        await User.findByIdAndUpdate(swapRequest.sender, {
            $push: {
                notifications: {
                    message: "Your swap request has been rejected",
                    type: "swap",
                    read: false,
                    createdAt: new Date(),
                },
            },
        });

        res.json({ message: "Swap request rejected", swapRequest });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/swap/:id
exports.getSwapById = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const swap = await SwapRequest.findById(req.params.id)
            .populate("sender", "name email profileImage")
            .populate("receiver", "name email profileImage");
        if (!swap) return res.status(404).json({ message: "Swap not found" });

        res.json({ swap, currentUserId: userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/swap/user
exports.getUserSwaps = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const swaps = await SwapRequest.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: { $ne: "rejected" }
        })
            .populate("sender", "name email profileImage role")
            .populate("receiver", "name email profileImage role");

        res.json(swaps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/swap/start-session/:id
exports.startSwapSession = async (req, res) => {
    try {
        const { sessionType, message, sessionData } = req.body;
        const swap = await SwapRequest.findById(req.params.id)
            .populate("sender")
            .populate("receiver");

        if (!swap) return res.status(404).json({ message: "Swap not found" });

        const sender = swap.sender;
        const receiver = swap.receiver;

        if (!receiver || !receiver.email) {
            return res.status(400).json({ message: "Receiver email not found. Cannot send invitation." });
        }

        // Extract detailed data if coming from Messages invite form
        const finalType = sessionData?.type || sessionType || "video";
        const finalSkill = sessionData?.skill || swap.learningSkill || (swap.skillsWanted?.[0] || "Skill Session");
        const finalTime = sessionData?.time || "";
        const finalMessage = sessionData?.message || message || "";
        const finalLink = sessionData?.meetingLink || `http://localhost:3000/video-call/${swap._id}`;

        swap.status = "ongoing";
        swap.sessionType = finalType;
        swap.steps.sessionStarted = true;
        await swap.save();

        // Send email invitation
        await sendSessionEmail({
            to: receiver.email,
            senderName: sender.name,
            receiverName: receiver.name,
            skill: finalSkill,
            meetingLink: finalLink,
            message: finalMessage,
            time: finalTime,
            sessionType: finalType
        });


        res.json({ message: "Session started and invitation sent", swap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




// PUT /api/swap/complete/:id
exports.completeSwap = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id)
            .populate("sender", "name email profileImage role")
            .populate("receiver", "name email profileImage role");
        if (!swap) return res.status(404).json({ message: "Swap not found" });

        const total = swap.totalSessions || 10;

        // Increment completed count (cap at total)
        swap.completedSessions = Math.min((swap.completedSessions || 0) + 1, total);

        // Always ensure sessionStarted stays true once set
        swap.steps.sessionStarted = true;

        // Mark sessionsCompleted milestone as soon as any session is done
        if (swap.completedSessions > 0) {
            swap.steps.sessionsCompleted = true;
        }

        if (swap.completedSessions >= total) {
            // All sessions done → fully completed
            swap.status = "completed";
            swap.steps.completed = true;
        } else {
            // Still ongoing
            swap.status = "ongoing";
        }

        await swap.save();

        res.json({
            success: true,
            swap,
            completedSessions: swap.completedSessions,
            totalSessions: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/swap/feedback/:id
exports.giveSwapFeedback = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id);
        if (!swap) return res.status(404).json({ message: "Swap not found" });

        const { rating, feedbackDescription } = req.body;
        if (rating) swap.rating = rating;
        if (feedbackDescription) swap.feedbackDescription = feedbackDescription;
        swap.steps.feedbackGiven = true;
        await swap.save();

        res.json({ message: "Feedback submitted", swap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/swap/reset-session/:id (TEST ONLY)
exports.resetSwapSession = async (req, res) => {
    try {
        const swap = await SwapRequest.findById(req.params.id);
        if (!swap) return res.status(404).json({ message: "Swap not found" });

        swap.status = "accepted";
        swap.sessionType = "";
        swap.completedSessions = 0;
        swap.steps.sessionStarted = false;
        swap.steps.sessionsCompleted = false;
        swap.steps.completed = false;

        await swap.save();
        res.json({ message: "Session reset for testing", swap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendSessionInvite = async (req, res) => {
    try {
        const {
            receiverId,
            message,
            skill,
            meetingLink,
            startTime,
            sessionType
        } = req.body;

        const sender = await User.findById(req.user.id);
        const receiver = await User.findById(receiverId);

        if (!sender) {
            console.error(" Sender not found for ID:", req.user.id);
            return res.status(404).json({ msg: "Authentication error: Sender not found" });
        }

        if (!receiver) {
            console.error("Receiver not found for ID:", receiverId);
            return res.status(404).json({ msg: "Receiver not found" });
        }

        if (!receiver.email) {
            console.error(" Receiver has no email address:", receiver.name);
            return res.status(400).json({ msg: "Receiver does not have a valid email address" });
        }

        console.log("-----------------------------------------");
        console.log("SESSION INVITE REQUEST");
        console.log("From:", sender.name, `(${sender.email})`);
        console.log("To:", receiver.name, `(${receiver.email})`);
        console.log("Skill:", skill);
        console.log("Meeting Link:", meetingLink);
        console.log("-----------------------------------------");

        console.log("Saving to Database (Messages table)...");

        // ✅ SAVE TO DATABASE
        const newMessage = new Message({
            sender: sender._id,
            receiver: receiver._id,
            text: message || `Session invitation for ${skill}`,
            skill,
            meetingLink,
            startTime,
            sessionType: sessionType || "teaching",
            type: "session_invite"
        });

        await newMessage.save();
        console.log(" Saved to DB!");

        console.log("Sending REAL Email via Nodemailer...");

        // ✅ SEND EMAIL
        await sendSessionEmail({
            to: receiver.email,
            senderName: sender.name,
            receiverName: receiver.name,
            skill: skill || "Skill Session",
            meetingLink: meetingLink || "Link in Dashboard",
            time: startTime,
            message: message || "I would like to start a session with you.",
            sessionType: "teaching"
        });

        console.log(" Email sent + DB saved");

        const time = new Date().toLocaleTimeString();
        await Notification.create({
            userId: sender._id,
            message: `Session invite sent to ${receiver.name} at ${time}`,
            type: "email",
            link: "/messages"
        });

        res.status(200).json({
            msg: "Session invite sent successfully to " + receiver.email
        });

    } catch (error) {
        console.error(" DETAILED ERROR IN SEND-INVITE:", error);
        res.status(500).json({ msg: "Server error: " + error.message });
    }
};
