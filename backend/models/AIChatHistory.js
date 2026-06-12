const mongoose = require('mongoose');

const AIChatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['openai', 'fallback'],
        default: 'fallback'
    }
}, { timestamps: true });

module.exports = mongoose.model('AIChatHistory', AIChatHistorySchema);
