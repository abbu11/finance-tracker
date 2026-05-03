const router = require('express').Router();
const auth   = require('../middleware/auth');
const { generateAIInsights } = require('../services/insightsService');

router.get('/', auth, async (req, res) => {
  try {
    const insights = await generateAIInsights(req.user.id);
    res.json(insights);
  } catch (err) {
    console.error('Insights route error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
