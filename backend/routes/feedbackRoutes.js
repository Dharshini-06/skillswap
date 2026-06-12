const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.createFeedback);
router.get('/:userId', feedbackController.getUserFeedback);
router.get('/avg/:userId', feedbackController.getUserAverageRating);

module.exports = router;

