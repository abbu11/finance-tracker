const mongoose = require('mongoose');

const CATEGORIES = [
  'food', 'travel', 'bills', 'shopping',
  'entertainment', 'health', 'education', 'salary', 'other'
];

const transactionSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['income', 'expense'], required: true },
  amount:      { type: Number, required: true, min: 0 },
  category:    { type: String, enum: CATEGORIES, required: true },
  description: { type: String, trim: true, default: '' },
  date:        { type: Date, default: Date.now },
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);