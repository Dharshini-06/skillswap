const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// path VERY IMPORTANT

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("New User Registration Details:", { name, email, password });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      onboardingCompleted: user.onboardingCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      onboardingCompleted: user.onboardingCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CHANGE PASSWORD ROUTE
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const userController = require("../controllers/userController");

// ONBOARDING ROUTE
router.post("/complete-onboarding", userController.completeOnboarding);

module.exports = router;
