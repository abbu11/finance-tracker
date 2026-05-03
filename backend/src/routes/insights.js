const router = require('express').Router();
const auth   = require('../middleware/auth');
const { generateRuleBasedInsights, enrichWithOpenAI } = require('../services/insightsService');

router.get('/', auth, async (req, res) => {
  try {
    const insights = await generateRuleBasedInsights(req.user.id);
    const enriched = await enrichWithOpenAI(insights, `User ID: ${req.user.id}`);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;