const router      = require('express').Router();
const PDFDocument = require('pdfkit');
const auth        = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const mongoose    = require('mongoose');

router.get('/monthly', auth, async (req, res) => {
  try {
    const { month } = req.query;
    const start = new Date(`${month}-01`);
    const end   = new Date(start.getFullYear(), start.getMonth() + 1, 1);

    const transactions = await Transaction.find({
      userId: new mongoose.Types.ObjectId(req.user.id),
      date: { $gte: start, $lt: end },
    }).sort({ date: 1 });

    const totalIncome  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${month}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).text(`Finance Report — ${month}`, { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Income:   $${totalIncome.toFixed(2)}`);
    doc.text(`Expenses: $${totalExpense.toFixed(2)}`);
    doc.text(`Net:      $${(totalIncome - totalExpense).toFixed(2)}`).moveDown();
    doc.fontSize(14).text('Transactions').moveDown(0.5);

    transactions.forEach(t => {
      doc.fontSize(10).text(
        `${new Date(t.date).toLocaleDateString()}  [${t.type.toUpperCase()}]  ${t.category}  $${t.amount.toFixed(2)}  ${t.description}`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;