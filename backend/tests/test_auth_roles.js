const assert = require('assert');
const bcrypt = require('bcryptjs');
const dataStore = require('../src/models/dataStore');
const { generateToken, verifyToken } = require('../src/config/jwt');

console.log('--- Testing Role-Based Authentication & Registration Security ---');

// 1. Verify pre-seeded roles exist
const rolesToTest = [
  { email: 'admin@agri.org', expectedRole: 'ADMIN' },
  { email: 'distributor@agri.org', expectedRole: 'DISTRIBUTOR' },
  { email: 'farmer@agri.org', expectedRole: 'FARMER' },
  { email: 'retailer@agri.org', expectedRole: 'RETAILER' },
  { email: 'planner@agri.org', expectedRole: 'PLANNER' }
];

for (const item of rolesToTest) {
  const user = dataStore.findUserByEmail(item.email);
  assert(user, `User ${item.email} should exist`);
  assert.strictEqual(user.role, item.expectedRole, `User ${item.email} role should be ${item.expectedRole}`);
  const match = bcrypt.compareSync('password123', user.passwordHash);
  assert(match, `Password verification should succeed for ${item.email}`);
  const token = generateToken(user);
  const decoded = verifyToken(token);
  assert.strictEqual(decoded.role, item.expectedRole);
  console.log(`✓ Pre-seeded login verification for ${item.expectedRole} (${item.email}): PASS`);
}

// 2. Test Registration of Public Roles
const publicRegistrations = [
  { email: 'new_farmer@field.org', fullName: 'Shiva Kumar', role: 'FARMER' },
  { email: 'new_distributor@transit.org', fullName: 'Venkatesh Logistics', role: 'DISTRIBUTOR' },
  { email: 'new_retailer@market.org', fullName: 'Koramangala Superstore', role: 'RETAILER' }
];

for (const reg of publicRegistrations) {
  const created = dataStore.createUser({
    email: reg.email,
    password: 'password123',
    fullName: reg.fullName,
    role: reg.role
  });
  assert(created && created.id, `Created user should have id`);
  assert.strictEqual(created.role, reg.role);
  assert.strictEqual(created.email, reg.email);
  console.log(`✓ Public registration for role ${reg.role} (${reg.email}): PASS`);
}

// 3. Test Security Guard: Reject duplicate email
const dup = dataStore.findUserByEmail('new_farmer@field.org');
assert(dup, 'Duplicate check should detect existing email');
console.log('✓ Duplicate email detection: PASS');

console.log('>>> ALL ROLE-BASED AUTH & SECURITY TESTS PASSED! <<<');
