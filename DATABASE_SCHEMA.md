# DATABASE SCHEMA & ENTITY SPECIFICATION

## Engine: PostgreSQL 15+ with PostGIS Spatial Extension

### 1. Entity-Relationship Overview
The database enforces strict referential integrity, spatial indexing on GPS coordinates, and historical traceability from harvest batch to retailer delivery.

```
[Users] ──< [Farms] ──< [HarvestBatches] ──< [SensorReadings]
   │          │               │                   │
   │          ▼               ▼                   ▼
   │     [FarmClusters]  [StorageInventory]   [SpoilagePredictions]
   │                          │                   │
   ├──< [StorageFacilities] ──┘                   │
   │          │                                   ▼
   ├──< [Vehicles] ──< [RouteStops] <── [DeliveryAssignments]
   │                          ▲                   ▲
   └──< [Retailers] ──< [RetailerOrders] ─────────┘
```

---

### 2. Core Tables Definition

#### `users`
- `id` (UUID, Primary Key, default `gen_random_uuid()`)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `full_name` (VARCHAR(150), NOT NULL)
- `role` (VARCHAR(50), NOT NULL CHECK in ('ADMIN', 'FARMER', 'RETAILER', 'STORAGE_MANAGER', 'TRANSPORT_MANAGER', 'PLANNER'))
- `phone` (VARCHAR(20))
- `created_at` (TIMESTAMPTZ, default NOW())
- `updated_at` (TIMESTAMPTZ, default NOW())

#### `farms`
- `id` (UUID, Primary Key)
- `farmer_id` (UUID, References `users(id)`)
- `name` (VARCHAR(150), NOT NULL)
- `location_geom` (GEOMETRY(Point, 4326), NOT NULL) -- PostGIS WGS84
- `latitude` (DECIMAL(10, 7), NOT NULL)
- `longitude` (DECIMAL(10, 7), NOT NULL)
- `total_acreage` (DECIMAL(8, 2))
- `primary_crop` (VARCHAR(50) DEFAULT 'TOMATO')
- `cluster_id` (UUID, References `farm_clusters(id)`)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `farm_clusters`
- `id` (UUID, Primary Key)
- `cluster_code` (VARCHAR(50), UNIQUE, NOT NULL)
- `centroid_lat` (DECIMAL(10, 7), NOT NULL)
- `centroid_lng` (DECIMAL(10, 7), NOT NULL)
- `total_farms_count` (INTEGER DEFAULT 0)
- `estimated_daily_yield_kg` (DECIMAL(12, 2) DEFAULT 0)
- `collection_hub_lat` (DECIMAL(10, 7))
- `collection_hub_lng` (DECIMAL(10, 7))
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `crops`
- `id` (UUID, Primary Key)
- `crop_name` (VARCHAR(100) NOT NULL UNIQUE)
- `variety` (VARCHAR(100))
- `optimum_temp_celsius_min` (DECIMAL(4, 1) DEFAULT 10.0)
- `optimum_temp_celsius_max` (DECIMAL(4, 1) DEFAULT 14.0)
- `base_shelf_life_days` (INTEGER DEFAULT 14)
- `deterioration_rate_ambient` (DECIMAL(6, 4) DEFAULT 0.12) -- Q10 / kinetic coefficient
- `unit_spoilage_cost_per_kg` (DECIMAL(8, 2) DEFAULT 25.0)

#### `harvest_batches`
- `id` (UUID, Primary Key)
- `batch_code` (VARCHAR(64), UNIQUE, NOT NULL)
- `farm_id` (UUID, References `farms(id)`, NOT NULL)
- `crop_id` (UUID, References `crops(id)`, NOT NULL)
- `harvest_timestamp` (TIMESTAMPTZ NOT NULL)
- `quantity_kg` (DECIMAL(10, 2) NOT NULL)
- `initial_brix_sugar` (DECIMAL(4, 2))
- `initial_firmness_index` (DECIMAL(4, 2)) -- 0.0 to 1.0
- `current_status` (VARCHAR(50) DEFAULT 'AT_FARM' CHECK in ('AT_FARM', 'IN_TRANSIT_TO_STORAGE', 'IN_STORAGE', 'IN_TRANSIT_TO_RETAILER', 'DELIVERED', 'SPOILED'))
- `remaining_shelf_life_hours` (DECIMAL(8, 2))
- `estimated_spoilage_risk` (DECIMAL(5, 4)) -- 0.0000 to 1.0000
- `created_at` (TIMESTAMPTZ DEFAULT NOW())

#### `storage_facilities`
- `id` (UUID, Primary Key)
- `manager_id` (UUID, References `users(id)`)
- `name` (VARCHAR(150), NOT NULL)
- `facility_code` (VARCHAR(50), UNIQUE, NOT NULL)
- `latitude` (DECIMAL(10, 7), NOT NULL)
- `longitude` (DECIMAL(10, 7), NOT NULL)
- `location_geom` (GEOMETRY(Point, 4326))
- `total_capacity_kg` (DECIMAL(12, 2) NOT NULL)
- `current_occupancy_kg` (DECIMAL(12, 2) DEFAULT 0.0)
- `setpoint_temp_celsius` (DECIMAL(4, 1) DEFAULT 12.0)
- `storage_cost_per_kg_day` (DECIMAL(6, 2) DEFAULT 1.50)
- `is_active` (BOOLEAN DEFAULT TRUE)

#### `retailers`
- `id` (UUID, Primary Key)
- `user_id` (UUID, References `users(id)`)
- `store_name` (VARCHAR(150), NOT NULL)
- `store_code` (VARCHAR(50), UNIQUE, NOT NULL)
- `latitude` (DECIMAL(10, 7), NOT NULL)
- `longitude` (DECIMAL(10, 7), NOT NULL)
- `location_geom` (GEOMETRY(Point, 4326))
- `daily_avg_demand_kg` (DECIMAL(10, 2) DEFAULT 500.0)
- `preferred_delivery_window_start` (TIME DEFAULT '06:00:00')
- `preferred_delivery_window_end` (TIME DEFAULT '10:00:00')

#### `vehicles`
- `id` (UUID, Primary Key)
- `plate_number` (VARCHAR(50), UNIQUE, NOT NULL)
- `vehicle_type` (VARCHAR(50) CHECK in ('REEFER_TRUCK', 'VENTILATED_VAN', 'STANDARD_PICKUP'))
- `capacity_kg` (DECIMAL(10, 2) NOT NULL)
- `is_refrigerated` (BOOLEAN DEFAULT FALSE)
- `cost_per_km` (DECIMAL(6, 2) NOT NULL)
- `fixed_trip_cost` (DECIMAL(8, 2) NOT NULL)
- `current_lat` (DECIMAL(10, 7))
- `current_lng` (DECIMAL(10, 7))
- `status` (VARCHAR(50) DEFAULT 'AVAILABLE' CHECK in ('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE', 'DECOMMISSIONED'))

#### `optimization_runs`
- `id` (UUID, Primary Key)
- `run_code` (VARCHAR(64), UNIQUE, NOT NULL)
- `scenario_name` (VARCHAR(100) NOT NULL) -- NORMAL, HEATWAVE, DEMAND_SPIKE, FLEET_BREAKDOWN
- `planning_horizon_days` (INTEGER DEFAULT 7)
- `objective_value` (DECIMAL(14, 2))
- `total_spoilage_cost` (DECIMAL(12, 2))
- `total_transport_cost` (DECIMAL(12, 2))
- `total_storage_cost` (DECIMAL(12, 2))
- `unmet_demand_penalty` (DECIMAL(12, 2))
- `demand_fulfillment_pct` (DECIMAL(5, 2))
- `spoilage_rate_pct` (DECIMAL(5, 2))
- `status` (VARCHAR(50) DEFAULT 'COMPLETED')
- `execution_time_ms` (INTEGER)
- `raw_solution_json` (JSONB)
- `created_at` (TIMESTAMPTZ DEFAULT NOW())
