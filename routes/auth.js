// index.js
require('dotenv').config();

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const express = require('express');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

//Register route
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send('USER REGISTERED SUCCESSFULLY');
  } catch (err) {
    res.status(400).send('USER ALREADY EXIST');
  }
});

//login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
