const express = require("express");
const router = express.Router();
const swapController = require("../controllers/swapController");
const userController = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");

// 2️⃣ Mutual Skill Matching Logic
router.get("/match", userController.getMatches);
router.get("/matches/:userId", userController.getMatches);

// 3️⃣ Swap Request System
router.post("/swap/request", swapController.createSwapRequest);
router.post("/swap/accept/:requestId", swapController.acceptSwapRequest);
router.post("/swap/reject/:requestId", swapController.rejectSwapRequest);

// 4️⃣ Progress Tracker (NEW)
router.get("/user", swapController.getUserSwaps);
router.get("/swap/:id", swapController.getSwapById);
router.post("/start-session/:id", swapController.startSwapSession);
router.put("/swap/complete/:id", swapController.completeSwap);

router.put("/swap/feedback/:id", swapController.giveSwapFeedback);
router.put("/swap/reset-session/:id", swapController.resetSwapSession);
router.post("/session/send-invite", auth, swapController.sendSessionInvite);


// 6️⃣ Notification System
router.get("/notifications", userController.getNotifications);

// 7️⃣ Dashboard Fetch Logic
router.get("/dashboard", userController.getDashboardData);

module.exports = router;
