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

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // SECURITY: Prevent public signup for ADMIN role
  const normalizedRole = (role || 'FARMER').trim().toUpperCase();
  if (normalizedRole === 'ADMIN') {
    return res.status(403).json({
      error: 'Security restriction: Admin accounts cannot be created through public signup. Only an authorized administrator can provision admin accounts.'
    });
  }

  // Valid public registration roles
  const validPublicRoles = ['FARMER', 'DISTRIBUTOR', 'RETAILER', 'STORAGE_MANAGER', 'TRANSPORT_MANAGER'];
  const assignedRole = validPublicRoles.includes(normalizedRole) ? normalizedRole : 'FARMER';

  const existing = dataStore.findUserByEmail(email.trim());
  if (existing) {
    return res.status(400).json({ error: 'A user with this email address already exists. Please sign in.' });
  }

  const newUser = dataStore.createUser({
    email: email.trim(),
    password,
    fullName: fullName.trim(),
    role: assignedRole,
    phone: phone ? phone.trim() : ''
  });
  const token = generateToken(newUser);

  return res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      phone: newUser.phone
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
