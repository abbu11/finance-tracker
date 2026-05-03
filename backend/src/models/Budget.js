const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category:  { type: String, required: true },
  limit:     { type: Number, required: true, min: 0 },
  period:    { type: String, enum: ['monthly', 'weekly'], default: 'monthly' },
  alertSent: { type: Boolean, default: false },
}, { timestamps: true });

budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);