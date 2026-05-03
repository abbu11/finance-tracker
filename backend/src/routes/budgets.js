const router      = require('express').Router();
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');
const auth        = require('../middleware/auth');
const mongoose    = require('mongoose');

router.get('/', auth, async (req, res) => {
  try {
    const budgets    = await Budget.find({ userId: req.user.id });
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const enriched = await Promise.all(budgets.map(async (b) => {
      const spent = await Transaction.aggregate([
        {
          $match: {
            userId:   new mongoose.Types.ObjectId(req.user.id),
            category: b.category,
            type:     'expense',
            date:     { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spentAmt = spent[0]?.total || 0;
      return {
        ...b.toObject(),
        spent:      spentAmt,
        percentage: Math.round((spentAmt / b.limit) * 100),
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { category, limit, period } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, category },
      { limit, period, alertSent: false },
      { upsert: true, new: true }
    );
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Budget removed' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;