const Transaction = require('../models/Transaction');
const mongoose    = require('mongoose');
const OpenAI      = require('openai');

async function analyzeSpending(userId) {
  const uid            = new mongoose.Types.ObjectId(userId);
  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth, lastMonth, incomeAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, type: 'expense', date: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId: uid, type: 'income', date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const thisMap     = Object.fromEntries(thisMonth.map(x => [x._id, x.total]));
  const lastMap     = Object.fromEntries(lastMonth.map(x => [x._id, x.total]));
  const income      = incomeAgg[0]?.total || 0;
  const totalSpend  = thisMonth.reduce((s, x) => s + x.total, 0);
  const savingsRate = income > 0 ? ((income - totalSpend) / income) * 100 : 0;

  const changes = [];
  for (const [cat, amount] of Object.entries(thisMap)) {
    const prev = lastMap[cat] || 0;
    const pct  = prev > 0 ? ((amount - prev) / prev) * 100 : null;
    changes.push({ category: cat, amount, prev, pct });
  }

  return { thisMap, lastMap, income, totalSpend, savingsRate, changes, thisMonth };
}

async function generateRuleBasedInsights(userId) {
  const { thisMap, income, totalSpend, savingsRate, changes, thisMonth } = await analyzeSpending(userId);
  const insights = [];

  for (const { category, amount, prev, pct } of changes) {
    if (pct !== null && pct > 30) {
      insights.push({
        type: 'overspending',
        title: `${cap(category)} up ${pct.toFixed(0)}%`,
        message: `You spent $${amount.toFixed(2)} on ${category} vs $${prev.toFixed(2)} last month.`,
        severity: pct > 60 ? 'high' : 'medium',
      });
    }
  }

  if (income > 0) {
    if (savingsRate < 10) {
      insights.push({ type: 'savings', title: 'Low savings rate', message: `Saving only ${savingsRate.toFixed(1)}% of income. Target 20%+.`, severity: 'high' });
    } else if (savingsRate >= 20) {
      insights.push({ type: 'positive', title: 'Great savings rate!', message: `You saved ${savingsRate.toFixed(1)}% of income this month.`, severity: 'low' });
    }
  }

  const top = [...thisMonth].sort((a, b) => b.total - a.total)[0];
  if (top) {
    insights.push({ type: 'info', title: `Top spend: ${cap(top._id)}`, message: `${cap(top._id)} is your biggest expense at $${top.total.toFixed(2)}.`, severity: 'low' });
  }

  return insights;
}

async function generateAIInsights(userId) {
  const ruleInsights = await generateRuleBasedInsights(userId);

  if (!process.env.OPENAI_API_KEY) {
    console.log('No OpenAI key — using rule-based only');
    return ruleInsights;
  }

  try {
    const { thisMap, income, totalSpend, savingsRate } = await analyzeSpending(userId);

    const spendingBreakdown = Object.entries(thisMap)
      .map(([cat, amt]) => `  - ${cap(cat)}: $${amt.toFixed(2)}`)
      .join('\n');

    const prompt = `You are a friendly personal finance advisor analyzing real spending data.

## This Month
- Income: $${income.toFixed(2)}
- Expenses: $${totalSpend.toFixed(2)}
- Savings Rate: ${savingsRate.toFixed(1)}%

## Spending Breakdown
${spendingBreakdown || '  No expenses yet'}

Give exactly 3 personalized actionable tips based on these REAL numbers.
Mention actual dollar amounts. Be specific and encouraging. Max 2 sentences each.

Respond ONLY with this JSON (no markdown, no backticks):
{"tips":[{"title":"...","message":"...","type":"tip","severity":"low"},{"title":"...","message":"...","type":"tip","severity":"low"},{"title":"...","message":"...","type":"tip","severity":"low"}]}`;

    const client   = new OpenAI();
    const response = await client.chat.completions.create({
      model:       'gpt-4o-mini',
      max_tokens:  600,
      temperature: 0.7,
      messages:    [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content.trim();
    console.log('OpenAI raw response:', raw);

    const json = JSON.parse(raw);
    const tips = json.tips || [];
    console.log(`OpenAI returned ${tips.length} tips`);

    return [...ruleInsights, ...tips];

  } catch (err) {
    console.error('OpenAI error:', err.message, '| Status:', err.status, '| Code:', err.code);
    return ruleInsights;
  }
}

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
module.exports = { generateRuleBasedInsights, generateAIInsights };
