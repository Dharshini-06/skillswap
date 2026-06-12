const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Student", "Teacher", "Skillswapper"],
    },
    fieldOfSpecialization: String,
    institution: String,
    experienceOrYear: String,
    experienceDetails: String,
    country: String,
    bio: String,
    company: String,
    profession: String,
    experience: String,
    skillsToTeach: [String],
    skillsToLearn: [String],
    notifications: [
      {
        message: String,
        type: { type: String, default: "system" },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resume: String,
    github: String,
    linkedin: String,
    portfolio: String,
    availableDays: [String],
    preferredTimeSlots: [String],
    sessionMode: [String],
    interests: String,
    profileType: {
      type: String,
      enum: ["avatar", "image"],
      default: "avatar",
    },
    avatarUrl: String,
    profileImage: String,
    teachingStats: [
      {
        skillName: String,
        averageRating: { type: Number, default: 0 },
        totalRatings: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
