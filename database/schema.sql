-- PostgreSQL + PostGIS Schema for Intelligent AgriSupplyChain Platform
-- Pilot Crop: Tomato (Solanum lycopersicum)
-- Catchment: Kolar / Bengaluru Catchment

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS & ACCESS CONTROL
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'FARMER', 'RETAILER', 'STORAGE_MANAGER', 'TRANSPORT_MANAGER', 'PLANNER')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CROPS CATALOG
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_name VARCHAR(100) NOT NULL UNIQUE,
    variety VARCHAR(100),
    optimum_temp_celsius_min NUMERIC(4, 1) DEFAULT 10.0,
    optimum_temp_celsius_max NUMERIC(4, 1) DEFAULT 14.0,
    base_shelf_life_days INTEGER DEFAULT 14,
    deterioration_rate_ambient NUMERIC(6, 4) DEFAULT 0.12,
    unit_spoilage_cost_per_kg NUMERIC(8, 2) DEFAULT 25.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. FARM CLUSTERS
CREATE TABLE IF NOT EXISTS farm_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_code VARCHAR(50) UNIQUE NOT NULL,
    cluster_name VARCHAR(150),
    centroid_lat NUMERIC(10, 7) NOT NULL,
    centroid_lng NUMERIC(10, 7) NOT NULL,
    total_farms_count INTEGER DEFAULT 0,
    estimated_daily_yield_kg NUMERIC(12, 2) DEFAULT 0.0,
    collection_hub_lat NUMERIC(10, 7),
    collection_hub_lng NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. FARMS
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    taluk VARCHAR(100) DEFAULT 'Kolar',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    total_acreage NUMERIC(8, 2) DEFAULT 2.5,
    primary_crop_id UUID REFERENCES crops(id),
    cluster_id UUID REFERENCES farm_clusters(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farms_cluster ON farms(cluster_id);

-- 5. HARVEST BATCHES
CREATE TABLE IF NOT EXISTS harvest_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(64) UNIQUE NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id),
    harvest_timestamp TIMESTAMPTZ NOT NULL,
    quantity_kg NUMERIC(10, 2) NOT NULL,
    initial_brix_sugar NUMERIC(4, 2) DEFAULT 4.5,
    initial_firmness_index NUMERIC(4, 2) DEFAULT 0.95,
    current_status VARCHAR(50) DEFAULT 'AT_FARM' 
        CHECK (current_status IN ('AT_FARM', 'IN_TRANSIT_TO_STORAGE', 'IN_STORAGE', 'IN_TRANSIT_TO_RETAILER', 'DELIVERED', 'SPOILED')),
    remaining_shelf_life_hours NUMERIC(8, 2) DEFAULT 336.0,
    estimated_spoilage_risk NUMERIC(5, 4) DEFAULT 0.05,
    fefo_priority_rank INTEGER DEFAULT 1,
    assigned_storage_id UUID,
    assigned_vehicle_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_farm ON harvest_batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON harvest_batches(current_status);
CREATE INDEX IF NOT EXISTS idx_batches_risk ON harvest_batches(estimated_spoilage_risk);

-- 6. SENSOR OBSERVATIONS (IoT telemetry per batch)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES harvest_batches(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_celsius NUMERIC(5, 2) NOT NULL,
    relative_humidity_pct NUMERIC(5, 2) NOT NULL,
    vibration_rms NUMERIC(5, 2) DEFAULT 0.05,
    location_lat NUMERIC(10, 7),
    location_lng NUMERIC(10, 7),
    is_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensor_batch_time ON sensor_readings(batch_id, recorded_at);

-- 7. COLD STORAGE FACILITIES
CREATE TABLE IF NOT EXISTS storage_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    total_capacity_kg NUMERIC(12, 2) NOT NULL,
    current_occupancy_kg NUMERIC(12, 2) DEFAULT 0.0,
    setpoint_temp_celsius NUMERIC(4, 1) DEFAULT 12.0,
    current_ambient_temp NUMERIC(4, 1) DEFAULT 12.0,
    storage_cost_per_kg_day NUMERIC(6, 2) DEFAULT 1.50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. RETAILERS & DEMAND
CREATE TABLE IF NOT EXISTS retailers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    store_code VARCHAR(50) UNIQUE NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    location_name VARCHAR(150),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    daily_avg_demand_kg NUMERIC(10, 2) DEFAULT 500.0,
    preferred_window_start TIME DEFAULT '06:00:00',
    preferred_window_end TIME DEFAULT '10:00:00',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retailer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(64) UNIQUE NOT NULL,
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id),
    order_date DATE NOT NULL,
    requested_quantity_kg NUMERIC(10, 2) NOT NULL,
    fulfilled_quantity_kg NUMERIC(10, 2) DEFAULT 0.0,
    order_status VARCHAR(50) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'FULFILLED', 'PARTIAL', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_retailer ON retailer_orders(retailer_id, order_date);

-- 9. FLEET VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('REEFER_TRUCK', 'VENTILATED_VAN', 'STANDARD_PICKUP')),
    capacity_kg NUMERIC(10, 2) NOT NULL,
    is_refrigerated BOOLEAN DEFAULT FALSE,
    min_temp_celsius NUMERIC(4, 1) DEFAULT 4.0,
    max_temp_celsius NUMERIC(4, 1) DEFAULT 12.0,
    cost_per_km NUMERIC(6, 2) NOT NULL,
    fixed_trip_cost NUMERIC(8, 2) NOT NULL,
    current_lat NUMERIC(10, 7),
    current_lng NUMERIC(10, 7),
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'DECOMMISSIONED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. OPTIMIZATION RUNS & SOLUTIONS
CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_code VARCHAR(64) UNIQUE NOT NULL,
    scenario_name VARCHAR(100) NOT NULL,
    planning_horizon_days INTEGER DEFAULT 7,
    objective_value NUMERIC(14, 2),
    total_spoilage_cost NUMERIC(12, 2),
    total_transport_cost NUMERIC(12, 2),
    total_storage_cost NUMERIC(12, 2),
    unmet_demand_penalty NUMERIC(12, 2),
    demand_fulfillment_pct NUMERIC(5, 2),
    spoilage_rate_pct NUMERIC(5, 2),
    status VARCHAR(50) DEFAULT 'COMPLETED',
    is_approved_by_planner BOOLEAN DEFAULT FALSE,
    execution_time_ms INTEGER,
    raw_solution_json JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
