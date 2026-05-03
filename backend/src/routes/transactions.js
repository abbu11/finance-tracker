const router      = require('express').Router();
const Transaction = require('../models/Transaction');
const Budget      = require('../models/Budget');
const auth        = require('../middleware/auth');
const mongoose    = require('mongoose');
const { checkBudgetAndAlert } = require('../services/budgetAlertService');

router.get('/', auth, async (req, res) => {
  try {
    const { month, category, type } = req.query;
    const filter = { userId: req.user.id };

    if (month) {
      const start = new Date(`${month}-01`);
      const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (category) filter.category = category;
    if (type)     filter.type     = type;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const start = month
      ? new Date(`${month}-01`)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const result = { income: 0, expenses: 0, byCategory: {} };
    summary.forEach(({ _id, total }) => {
      if (_id.type === 'income')  result.income   += total;
      if (_id.type === 'expense') result.expenses += total;
      result.byCategory[_id.category] = (result.byCategory[_id.category] || 0) + total;
    });
    result.balance = result.income - result.expenses;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const tx = await Transaction.create({
      userId: req.user.id, type, amount, category, description, date,
    });

    if (type === 'expense') {
      checkBudgetAndAlert({ io: req.app.locals.io, userId: req.user.id, category });
    }

    res.status(201).json({ tx });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json(tx);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({
      _id: req.params.id, userId: req.user.id,
    });
    if (!tx) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;