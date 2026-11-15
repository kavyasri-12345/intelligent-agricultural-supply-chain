const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/jwt');
const dataStore = require('../models/dataStore');

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = dataStore.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  const token = generateToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone
    }
  });
};

const register = (req, res) => {
  const { email, password, fullName, role, phone } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  const existing = dataStore.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  const newUser = dataStore.createUser({ email, password, fullName, role, phone });
  const token = generateToken(newUser);

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    }
  });
};

const getProfile = (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      phone: req.user.phone
    }
  });
};

module.exports = {
  login,
  register,
  getProfile
};
