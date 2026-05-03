const mongoose    = require('mongoose');
const Budget      = require('../models/Budget');
const Transaction = require('../models/Transaction');

async function checkBudgetAndAlert({ io, userId, category }) {
  try {
    const budget = await Budget.findOne({ userId, category });
    if (!budget) return;

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId:   new mongoose.Types.ObjectId(userId),
          category,
          type:     'expense',
          date:     { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const spent      = result[0]?.total || 0;
    const percentage = Math.round((spent / budget.limit) * 100);

    if (percentage >= 90 && io) {
      io.to(userId).emit('budget_alert', {
        category,
        spent,
        limit:      budget.limit,
        percentage,
        message:    `You've used ${percentage}% of your ${category} budget ($${spent.toFixed(2)} of $${budget.limit})`,
        severity:   percentage >= 100 ? 'exceeded' : 'warning',
      });
    }
  } catch (err) {
    console.error('Budget alert error:', err.message);
  }
}

module.exports = { checkBudgetAndAlert };