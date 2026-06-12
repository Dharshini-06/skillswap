const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentTopic: {
        type: String,
        enum: ['java', 'python', 'javascript', 'react', null], // Add more as needed
        default: null
    },
    currentStep: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
