export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'PLANNER' | 'FARMER' | 'RETAILER' | 'STORAGE_MANAGER' | 'TRANSPORT_MANAGER' | 'DISTRIBUTOR';
  phone?: string;
}

export interface Farm {
  farm_id: string;
  name: string;
  taluk: string;
  lat: number;
  lng: number;
  acreage: number;
  crop: string;
  base_yield_kg: number;
  soil_type: string;
  irrigation: string;
  farmer_phone: string;
}

export interface FarmCluster {
  cluster_id: number;
  cluster_code: string;
  centroid_lat: number;
  centroid_lng: number;
  collection_hub_farm_id: string;
  collection_hub_name: string;
  collection_hub_lat: number;
  collection_hub_lng: number;
  farms_count: number;
  total_yield_capacity_kg: number;
  total_acreage: number;
  farm_ids: string[];
}

export interface HarvestBatch {
  batch_id: string;
  crop: string;
  farm_id: string;
  quantity_kg: number;
  harvest_age_hours: number;
  initial_firmness: number;
  initial_brix: number;
  avg_exposure_temp_c: number;
  remaining_shelf_life_hours: number;
  spoilage_probability: number;
  spoilage_risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_urgent_fefo: boolean;
  delivery_feasible?: boolean;
  status: string;
  fefo_priority_rank?: number;
  telemetry_sequence?: Array<{ hour_step: number; temp_c: number; humidity_pct: number }>;
}

export interface ColdStorageFacility {
  id: string;
  name: string;
  facility_code: string;
  lat: number;
  lng: number;
  total_capacity_kg: number;
  current_occupancy_kg?: number;
  setpoint_temp_celsius: number;
  storage_cost_per_kg_day: number;
  is_active: boolean;
}

export interface Retailer {
  name: string;
  code: string;
  lat: number;
  lng: number;
  daily_avg_demand: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
  capacity_kg: number;
  is_refrigerated: boolean;
  cost_per_km: number;
  fixed_cost: number;
  status?: string;
}

export interface DashboardSummary {
  total_farms: number;
  total_retailers: number;
  total_storage_facilities: number;
  total_vehicles: number;
  active_batches_count: number;
  urgent_fefo_batches_count: number;
  total_stock_kg: number;
  predicted_7d_supply_kg: number;
  predicted_7d_demand_kg: number;
  storage_utilization_pct: number;
  fleet_utilization_pct: number;
  estimated_spoilage_rate_pct: number;
  demand_fulfillment_pct: number;
  active_alerts_count: number;
}

export interface OptimizationKPIs {
  total_cost_inr: number;
  spoilage_cost_inr: number;
  transport_cost_inr: number;
  storage_cost_inr: number;
  unmet_penalty_inr: number;
  demand_fulfillment_pct: number;
  spoilage_rate_pct: number;
  total_supply_kg: number;
  total_demand_kg: number;
  total_delivered_kg: number;
  total_distance_km: number;
  vehicles_deployed: number;
}
