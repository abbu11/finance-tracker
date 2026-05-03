const Transaction = require('../models/Transaction');
const mongoose    = require('mongoose');

async function generateRuleBasedInsights(userId) {
  const uid            = new mongoose.Types.ObjectId(userId);
  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth, lastMonth] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  const thisMap = Object.fromEntries(thisMonth.map(x => [x._id, x.total]));
  const lastMap = Object.fromEntries(lastMonth.map(x => [x._id, x.total]));
  const insights = [];

  for (const [cat, amount] of Object.entries(thisMap)) {
    const prev = lastMap[cat] || 0;
    if (prev > 0) {
      const pct = ((amount - prev) / prev) * 100;
      if (pct > 30) {
        insights.push({
          type:     'overspending',
          title:    `${cap(cat)} up ${pct.toFixed(0)}%`,
          message:  `You spent $${amount.toFixed(2)} on ${cat} vs $${prev.toFixed(2)} last month.`,
          severity: pct > 60 ? 'high' : 'medium',
        });
      }
    }
  }

  const [incAgg, expAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, type: 'income',  date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const income  = incAgg[0]?.total || 0;
  const expense = expAgg[0]?.total || 0;

  if (income > 0) {
    const rate = ((income - expense) / income) * 100;
    if (rate < 10) {
      insights.push({ type: 'savings', title: 'Low savings rate', message: `You're saving only ${rate.toFixed(1)}% of income. Aim for 20%+.`, severity: 'high' });
    } else if (rate >= 20) {
      insights.push({ type: 'positive', title: 'Great savings rate!', message: `You saved ${rate.toFixed(1)}% of income this month.`, severity: 'low' });
    }
  }

  const top = [...thisMonth].sort((a, b) => b.total - a.total)[0];
  if (top) {
    insights.push({ type: 'info', title: `Top spend: ${cap(top._id)}`, message: `${cap(top._id)} is your biggest expense at $${top.total.toFixed(2)}.`, severity: 'low' });
  }

  return insights;
}

async function enrichWithOpenAI(insights, summaryText) {
  if (!process.env.OPENAI_API_KEY) return insights;
  try {
    const OpenAI = require('openai');
    const client = new OpenAI();
    const prompt = `You are a personal finance advisor. Observations:\n${insights.map(i => `- ${i.title}: ${i.message}`).join('\n')}\nProvide 2 actionable savings tips as JSON array: [{"title":"...","message":"...","type":"tip","severity":"low"}]`;
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });
    const text = res.choices[0].message.content.replace(/```json|```/g, '').trim();
    const tips = JSON.parse(text);
    return [...insights, ...(Array.isArray(tips) ? tips : [])];
  } catch {
    return insights;
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
module.exports = { generateRuleBasedInsights, enrichWithOpenAI };