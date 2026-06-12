const Feedback = require('../models/Feedback');
const SwapRequest = require('../models/SwapRequest');

// POST /api/feedback
exports.createFeedback = async (req, res) => {
  try {
    const { sessionId, toUserId, fromUserId, rating, comment } = req.body;
    if (!sessionId || !toUserId || !fromUserId || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const feedback = await Feedback.create({
      sessionId,
      toUserId,
      fromUserId,
      rating,
      comment: comment || ''
    });

    // Also update swap to mark feedbackGiven
    const swap = await SwapRequest.findById(sessionId);
    if (swap) {
      swap.steps = swap.steps || {};
      swap.steps.feedbackGiven = true;
      // preserve rating/comment for quick reference
      if (rating) swap.rating = rating;
      if (comment) swap.feedbackDescription = comment;
      await swap.save();
    }

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/feedback/:userId
exports.getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const feedbacks = await Feedback.find({ toUserId: userId }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/feedback/avg/:userId
exports.getUserAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;
    const agg = await Feedback.aggregate([
      { $match: { toUserId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: '$toUserId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length === 0) return res.json({ avgRating: 0, count: 0 });
    res.json({ avgRating: Number(agg[0].avgRating.toFixed(1)), count: agg[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

