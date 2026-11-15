const assert = require('assert');
const dataStore = require('../src/models/dataStore');
const { generateToken, verifyToken } = require('../src/config/jwt');
const bcrypt = require('bcryptjs');

console.log('--- Testing Backend Components ---');

// Test 1: User Seeding and Verification
const admin = dataStore.findUserByEmail('admin@agri.org');
assert(admin !== undefined, 'Admin user should be seeded');
assert.strictEqual(admin.role, 'ADMIN', 'Role should be ADMIN');
const isPwValid = bcrypt.compareSync('password123', admin.passwordHash);
assert(isPwValid, 'Password should match password123');
console.log('1. User seeding & bcrypt password validation: PASS');

// Test 2: JWT Token Generation and Decoding
const token = generateToken(admin);
assert(typeof token === 'string' && token.length > 20, 'Token should be valid JWT string');
const decoded = verifyToken(token);
assert.strictEqual(decoded.email, 'admin@agri.org');
assert.strictEqual(decoded.role, 'ADMIN');
console.log('2. JWT generation & verification: PASS');

// Test 3: DataStore Entities
assert(dataStore.farms.length >= 50, 'Farms count should be at least 50');
assert(dataStore.storageFacilities.length === 4, 'Storage facilities count should be 4');
assert(dataStore.retailers.length === 20, 'Retailers count should be 20');
assert(dataStore.vehicles.length === 12, 'Vehicles count should be 12');
console.log(`3. DataStore entities: PASS (Farms: ${dataStore.farms.length}, Facilities: ${dataStore.storageFacilities.length}, Retailers: ${dataStore.retailers.length}, Fleet: ${dataStore.vehicles.length})`);

// Test 4: Batch Registration
const newBatch = dataStore.addBatch({
  farm_id: 'FRM-001',
  quantity_kg: 1450.0,
  harvest_age_hours: 6.0
});
assert(newBatch.batch_id.startsWith('BAT-'), 'Batch ID should start with BAT-');
assert.strictEqual(newBatch.quantity_kg, 1450.0);
console.log('4. Harvest batch registration: PASS');

// Test 5: Order Creation
const newOrder = dataStore.addOrder({
  retailer_code: 'RET-IND-01',
  requested_quantity_kg: 800.0
});
assert(newOrder.id.startsWith('ORD-'), 'Order ID should start with ORD-');
assert.strictEqual(newOrder.requested_quantity_kg, 800.0);
console.log('5. Retailer order creation: PASS');

console.log('>>> ALL BACKEND COMPONENT TESTS PASSED PERFECTLY! <<<');
