const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', '..', '..', 'ai_service', 'data_store');
const BACKEND_DB_FILE = path.join(__dirname, '..', '..', 'data', 'store.json');

// Ensure local backend data directory exists
const localDataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

class DataStore {
  constructor() {
    this.users = [];
    this.farms = [];
    this.storageFacilities = [];
    this.retailers = [];
    this.vehicles = [];
    this.batches = [];
    this.orders = [];
    this.optimizationRuns = [];
    this.auditLogs = [];

    this.init();
  }

  init() {
    // 1. Seed standard RBAC users
    const passwordHash = bcrypt.hashSync('password123', 8);
    this.users = [
      {
        id: 'usr-admin-01',
        email: 'admin@agri.org',
        passwordHash,
        fullName: 'Dr. Suresh Kumar (Chief Administrator)',
        role: 'ADMIN',
        phone: '+91-9845011223'
      },
      {
        id: 'usr-plan-02',
        email: 'planner@agri.org',
        passwordHash,
        fullName: 'Aakash Verma (Supply Chain Planner)',
        role: 'PLANNER',
        phone: '+91-9845022334'
      },
      {
        id: 'usr-farm-03',
        email: 'farmer@agri.org',
        passwordHash,
        fullName: 'Ramesh Gowda (Lead Farmer Representative)',
        role: 'FARMER',
        phone: '+91-9845033445'
      },
      {
        id: 'usr-ret-04',
        email: 'retailer@agri.org',
        passwordHash,
        fullName: 'Pooja Hegde (Retail Supermarket Manager)',
        role: 'RETAILER',
        phone: '+91-9845044556'
      },
      {
        id: 'usr-dist-07',
        email: 'distributor@agri.org',
        passwordHash,
        fullName: 'Kiran Patel (Regional Agri Distributor)',
        role: 'DISTRIBUTOR',
        phone: '+91-9845077889'
      },
      {
        id: 'usr-store-05',
        email: 'storage@agri.org',
        passwordHash,
        fullName: 'Manjunath Reddy (Cold Storage Operations Lead)',
        role: 'STORAGE_MANAGER',
        phone: '+91-9845055667'
      },
      {
        id: 'usr-trans-06',
        email: 'transport@agri.org',
        passwordHash,
        fullName: 'Deepak Rao (Fleet Logistics Coordinator)',
        role: 'TRANSPORT_MANAGER',
        phone: '+91-9845066778'
      }
    ];

    // 2. Load entities from generated data_store if available
    try {
      const farmsPath = path.join(DATA_DIR, 'farms.json');
      if (fs.existsSync(farmsPath)) {
        this.farms = JSON.parse(fs.readFileSync(farmsPath, 'utf8'));
      }
      const storePath = path.join(DATA_DIR, 'storage_facilities.json');
      if (fs.existsSync(storePath)) {
        this.storageFacilities = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      }
      const retPath = path.join(DATA_DIR, 'retailers.json');
      if (fs.existsSync(retPath)) {
        this.retailers = JSON.parse(fs.readFileSync(retPath, 'utf8'));
      }
      const vehPath = path.join(DATA_DIR, 'vehicles.json');
      if (fs.existsSync(vehPath)) {
        this.vehicles = JSON.parse(fs.readFileSync(vehPath, 'utf8'));
      }
      const batchPath = path.join(DATA_DIR, 'batches_normal.json');
      if (fs.existsSync(batchPath)) {
        this.batches = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
      }
    } catch (err) {
      console.warn('Notice: Ingestion from data_store failed, starting with in-memory stores:', err.message);
    }
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser(userData) {
    const id = `usr-${uuidv4().substring(0, 8)}`;
    const passwordHash = bcrypt.hashSync(userData.password, 8);
    const newUser = {
      id,
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      role: userData.role || 'FARMER',
      phone: userData.phone || ''
    };
    this.users.push(newUser);
    return newUser;
  }

  addBatch(batchData) {
    const batchId = `BAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newBatch = {
      batch_id: batchId,
      crop: batchData.crop || 'Tomato',
      farm_id: batchData.farm_id,
      quantity_kg: parseFloat(batchData.quantity_kg),
      harvest_age_hours: parseFloat(batchData.harvest_age_hours || 2.0),
      initial_firmness: parseFloat(batchData.initial_firmness || 0.95),
      initial_brix: parseFloat(batchData.initial_brix || 4.8),
      avg_exposure_temp_c: parseFloat(batchData.avg_exposure_temp_c || 24.0),
      remaining_shelf_life_hours: 310.0,
      spoilage_probability: 0.04,
      spoilage_risk_category: 'LOW',
      status: 'AT_FARM',
      created_at: new Date().toISOString()
    };
    this.batches.unshift(newBatch);
    return newBatch;
  }

  addOrder(orderData) {
    const orderId = `ORD-${Date.now()}`;
    const newOrder = {
      id: orderId,
      retailer_code: orderData.retailer_code,
      crop: orderData.crop || 'Tomato',
      requested_quantity_kg: parseFloat(orderData.requested_quantity_kg),
      fulfilled_quantity_kg: 0.0,
      order_date: new Date().toISOString().split('T')[0],
      delivery_window: orderData.delivery_window || '07:00-10:00',
      status: 'PENDING'
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  addOptimizationRun(runResult, isApproved = false) {
    const runRecord = {
      id: `OPT-${Date.now()}`,
      created_at: new Date().toISOString(),
      scenario: runResult.scenario || 'NORMAL',
      objective_value: runResult.objective_value,
      kpis: runResult.kpis,
      storage_allocation: runResult.storage_allocation,
      vehicle_routing: runResult.vehicle_routing,
      explanations: runResult.explanations,
      is_approved: isApproved
    };
    this.optimizationRuns.unshift(runRecord);
    return runRecord;
  }
}

module.exports = new DataStore();
