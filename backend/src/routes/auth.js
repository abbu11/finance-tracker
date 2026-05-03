const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const auth   = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// TEST
router.get('/test', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ status: 'db ok', userCount: count });
  } catch (err) {
    res.json({ status: 'db error', error: err.message });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password too short' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = bcrypt.hashSync(password, 12);
    const user   = await User.create({ name, email, password: hashed });

    res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name, email }
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err.message);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email }
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err.message);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

// ME
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;