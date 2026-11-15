"""
Seeded Synthetic Operational Data Generator for Perishable Agricultural Supply Chain
Pilot Crop: Tomato (Solanum lycopersicum)
Geographic Catchment: Kolar District & Bengaluru Urban Catchment, Karnataka, India
Scientific Foundations: Kinetic Arrhenius deterioration, physiological post-harvest metrics.
"""

import os
import json
import math
import random
import datetime
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd

DEFAULT_SEED = 42

def set_all_seeds(seed: int = DEFAULT_SEED):
    random.seed(seed)
    np.random.seed(seed)

class AgriSupplyChainDataGenerator:
    def __init__(self, seed: int = DEFAULT_SEED):
        self.seed = seed
        set_all_seeds(seed)
        
        # Bounding box coordinates for Kolar District (Farms)
        # 13.05N to 13.35N, 78.00E to 78.35E
        self.farm_taluks = [
            {"taluk": "Kolar", "lat_center": 13.1367, "lng_center": 78.1291, "weight": 0.30},
            {"taluk": "Malur", "lat_center": 13.0042, "lng_center": 77.9392, "weight": 0.25},
            {"taluk": "Srinivaspur", "lat_center": 13.3369, "lng_center": 78.2144, "weight": 0.20},
            {"taluk": "Mulbagal", "lat_center": 13.1642, "lng_center": 78.3944, "weight": 0.15},
            {"taluk": "Bangarapet", "lat_center": 12.9866, "lng_center": 78.1969, "weight": 0.10},
        ]
        
        # Cold Storage Facilities (4 strategic hubs)
        self.storage_facilities = [
            {
                "id": "CS-01",
                "name": "Kolar APMC Mega Cold Hub",
                "facility_code": "WH-KLR-01",
                "lat": 13.1385,
                "lng": 78.1320,
                "total_capacity_kg": 50000.0,
                "setpoint_temp_celsius": 11.5,
                "storage_cost_per_kg_day": 1.20,
                "is_active": True
            },
            {
                "id": "CS-02",
                "name": "Hoskote Agro Cold Distribution Center",
                "facility_code": "WH-HSK-02",
                "lat": 13.0712,
                "lng": 77.7983,
                "total_capacity_kg": 40000.0,
                "setpoint_temp_celsius": 12.0,
                "storage_cost_per_kg_day": 1.50,
                "is_active": True
            },
            {
                "id": "CS-03",
                "name": "Whitefield Perishables Logistics Terminal",
                "facility_code": "WH-WFD-03",
                "lat": 12.9698,
                "lng": 77.7500,
                "total_capacity_kg": 35000.0,
                "setpoint_temp_celsius": 11.0,
                "storage_cost_per_kg_day": 1.80,
                "is_active": True
            },
            {
                "id": "CS-04",
                "name": "Devanahalli Fresh Agri Logistics Hub",
                "facility_code": "WH-DVH-04",
                "lat": 13.2450,
                "lng": 77.7120,
                "total_capacity_kg": 30000.0,
                "setpoint_temp_celsius": 12.0,
                "storage_cost_per_kg_day": 1.60,
                "is_active": True
            }
        ]
        
        # Retailers across Bengaluru Urban Catchment (20 retail nodes)
        self.retail_locations = [
            {"name": "Indiranagar FreshMart Supermarket", "code": "RET-IND-01", "lat": 12.9784, "lng": 77.6408, "daily_avg_demand": 850.0},
            {"name": "Koramangala GreenGrocers Hub", "code": "RET-KOR-02", "lat": 12.9352, "lng": 77.6245, "daily_avg_demand": 1100.0},
            {"name": "Whitefield Fresh Produce Mart", "code": "RET-WFD-03", "lat": 12.9698, "lng": 77.7500, "daily_avg_demand": 950.0},
            {"name": "Jayanagar Farmers Retail Union", "code": "RET-JYN-04", "lat": 12.9308, "lng": 77.5838, "daily_avg_demand": 1200.0},
            {"name": "Malleshwaram Daily Agro Store", "code": "RET-MLW-05", "lat": 13.0031, "lng": 77.5643, "daily_avg_demand": 750.0},
            {"name": "HSR Layout Organic Basket", "code": "RET-HSR-06", "lat": 12.9121, "lng": 77.6446, "daily_avg_demand": 900.0},
            {"name": "Yelahanka Perishable Distribution", "code": "RET-YLH-07", "lat": 13.1007, "lng": 77.5963, "daily_avg_demand": 650.0},
            {"name": "Electronic City Agro Mart", "code": "RET-ELC-08", "lat": 12.8452, "lng": 77.6602, "daily_avg_demand": 800.0},
            {"name": "Marathahalli Fresh Express", "code": "RET-MRT-09", "lat": 12.9591, "lng": 77.6974, "daily_avg_demand": 1050.0},
            {"name": "BTM Layout Urban Grocery", "code": "RET-BTM-10", "lat": 12.9166, "lng": 77.6101, "daily_avg_demand": 700.0},
            {"name": "Hebbal Fresh Food Depot", "code": "RET-HBL-11", "lat": 13.0358, "lng": 77.5970, "daily_avg_demand": 600.0},
            {"name": "Rajajinagar Produce Bazaar", "code": "RET-RJN-12", "lat": 12.9982, "lng": 77.5530, "daily_avg_demand": 850.0},
            {"name": "Sarjapur FarmToFork Outlet", "code": "RET-SJP-13", "lat": 12.8601, "lng": 77.7865, "daily_avg_demand": 950.0},
            {"name": "Banashankari Wholesale Fruits & Veg", "code": "RET-BSK-14", "lat": 12.9255, "lng": 77.5468, "daily_avg_demand": 1150.0},
            {"name": "Kalyan Nagar Veggie Hub", "code": "RET-KLN-15", "lat": 13.0238, "lng": 77.6433, "daily_avg_demand": 550.0},
            {"name": "Bellandur EcoGrocers", "code": "RET-BLR-16", "lat": 12.9304, "lng": 77.6784, "daily_avg_demand": 800.0},
            {"name": "Basavanagudi Heritage Market", "code": "RET-BSG-17", "lat": 12.9422, "lng": 77.5756, "daily_avg_demand": 750.0},
            {"name": "RT Nagar Daily Mart", "code": "RET-RTN-18", "lat": 13.0247, "lng": 77.5948, "daily_avg_demand": 500.0},
            {"name": "KR Puram Fresh Railhead Store", "code": "RET-KRP-19", "lat": 13.0075, "lng": 77.6959, "daily_avg_demand": 900.0},
            {"name": "JP Nagar Premium Organics", "code": "RET-JPN-20", "lat": 12.9063, "lng": 77.5857, "daily_avg_demand": 700.0}
        ]

        # Vehicle Fleet (12 vehicles)
        self.vehicle_fleet = [
            {"id": "VEH-RF-01", "plate": "KA-04-RF-1001", "type": "REEFER_TRUCK", "capacity_kg": 4500.0, "is_refrigerated": True, "cost_per_km": 28.0, "fixed_cost": 1200.0},
            {"id": "VEH-RF-02", "plate": "KA-04-RF-1002", "type": "REEFER_TRUCK", "capacity_kg": 4500.0, "is_refrigerated": True, "cost_per_km": 28.0, "fixed_cost": 1200.0},
            {"id": "VEH-RF-03", "plate": "KA-07-RF-2001", "type": "REEFER_TRUCK", "capacity_kg": 4000.0, "is_refrigerated": True, "cost_per_km": 26.0, "fixed_cost": 1100.0},
            {"id": "VEH-RF-04", "plate": "KA-07-RF-2002", "type": "REEFER_TRUCK", "capacity_kg": 4000.0, "is_refrigerated": True, "cost_per_km": 26.0, "fixed_cost": 1100.0},
            {"id": "VEH-VN-01", "plate": "KA-04-VN-3001", "type": "VENTILATED_VAN", "capacity_kg": 2500.0, "is_refrigerated": False, "cost_per_km": 18.0, "fixed_cost": 750.0},
            {"id": "VEH-VN-02", "plate": "KA-04-VN-3002", "type": "VENTILATED_VAN", "capacity_kg": 2500.0, "is_refrigerated": False, "cost_per_km": 18.0, "fixed_cost": 750.0},
            {"id": "VEH-VN-03", "plate": "KA-07-VN-3003", "type": "VENTILATED_VAN", "capacity_kg": 2500.0, "is_refrigerated": False, "cost_per_km": 18.0, "fixed_cost": 750.0},
            {"id": "VEH-VN-04", "plate": "KA-07-VN-3004", "type": "VENTILATED_VAN", "capacity_kg": 2200.0, "is_refrigerated": False, "cost_per_km": 16.0, "fixed_cost": 700.0},
            {"id": "VEH-PK-01", "plate": "KA-07-PK-4001", "type": "STANDARD_PICKUP", "capacity_kg": 1500.0, "is_refrigerated": False, "cost_per_km": 12.0, "fixed_cost": 450.0},
            {"id": "VEH-PK-02", "plate": "KA-07-PK-4002", "type": "STANDARD_PICKUP", "capacity_kg": 1500.0, "is_refrigerated": False, "cost_per_km": 12.0, "fixed_cost": 450.0},
            {"id": "VEH-PK-03", "plate": "KA-04-PK-4003", "type": "STANDARD_PICKUP", "capacity_kg": 1200.0, "is_refrigerated": False, "cost_per_km": 10.0, "fixed_cost": 400.0},
            {"id": "VEH-PK-04", "plate": "KA-04-PK-4004", "type": "STANDARD_PICKUP", "capacity_kg": 1200.0, "is_refrigerated": False, "cost_per_km": 10.0, "fixed_cost": 400.0}
        ]

    def generate_farms(self, n_farms: int = 100) -> List[Dict[str, Any]]:
        farms = []
        for i in range(n_farms):
            taluk_choice = random.choices(
                self.farm_taluks,
                weights=[t["weight"] for t in self.farm_taluks]
            )[0]
            
            # Small Gaussian perturbation around taluk center (~ 3-8 km)
            lat = taluk_choice["lat_center"] + np.random.normal(0, 0.04)
            lng = taluk_choice["lng_center"] + np.random.normal(0, 0.04)
            acreage = round(float(np.random.gamma(shape=3.0, scale=1.0)), 2)
            acreage = max(1.0, min(12.0, acreage))
            
            # Yield potential per harvest cycle
            base_yield_kg = round(acreage * float(np.random.normal(1200, 150)), 1)
            
            farms.append({
                "farm_id": f"FRM-{i+1:03d}",
                "name": f"Sri {taluk_choice['taluk']} Tomato Estate {i+1}",
                "taluk": taluk_choice["taluk"],
                "lat": round(float(lat), 6),
                "lng": round(float(lng), 6),
                "acreage": acreage,
                "crop": "Tomato (Hybrid Shivam)",
                "base_yield_kg": base_yield_kg,
                "soil_type": random.choice(["Red Loam", "Sandy Clay Loam", "Black Soil"]),
                "irrigation": random.choice(["Drip Irrigation", "Borewell Sprinkler", "Canal Feeder"]),
                "farmer_phone": f"+91-9845{random.randint(100000, 999999)}"
            })
        return farms

    def generate_weather_series(self, start_date: str = "2025-01-01", days: int = 372) -> pd.DataFrame:
        """Generates realistic daily weather series for Kolar District."""
        dt_index = pd.date_range(start=start_date, periods=days, freq="D")
        records = []
        
        for d in dt_index:
            day_of_year = d.dayofyear
            # Indian tropical seasonality: Peak heat in April-May (DOY 90-150), Monsoon in July-Oct (DOY 180-280), Cool in Dec-Jan
            seasonal_temp = 25.0 + 8.0 * math.sin(2 * math.pi * (day_of_year - 60) / 365)
            temp_max = seasonal_temp + float(np.random.normal(3.5, 1.2))
            temp_min = seasonal_temp - float(np.random.normal(7.0, 1.5))
            
            # Monsoon rainfall simulation
            monsoon_prob = 0.55 if 170 <= day_of_year <= 290 else 0.10
            rainfall = float(np.random.exponential(12.0)) if random.random() < monsoon_prob else 0.0
            
            humidity = 55.0 + 25.0 * (rainfall > 0) + float(np.random.normal(0, 5))
            humidity = max(25.0, min(95.0, humidity))
            solar_rad = max(12.0, min(28.0, 22.0 - 0.2 * humidity + float(np.random.normal(0, 1.5))))
            
            records.append({
                "date": d.strftime("%Y-%m-%d"),
                "temp_max": round(temp_max, 2),
                "temp_min": round(temp_min, 2),
                "temp_avg": round((temp_max + temp_min) / 2.0, 2),
                "relative_humidity": round(humidity, 2),
                "rainfall_mm": round(rainfall, 2),
                "solar_radiation_mj": round(solar_rad, 2)
            })
        return pd.DataFrame(records)

    def generate_supply_history(self, farms: List[Dict[str, Any]], weather_df: pd.DataFrame) -> pd.DataFrame:
        """Generates daily supply records for all farms based on weather and harvest cycles."""
        records = []
        farm_ids = [f["farm_id"] for f in farms]
        farm_dict = {f["farm_id"]: f for f in farms}
        
        for idx, row in weather_df.iterrows():
            d_str = row["date"]
            temp_avg = row["temp_avg"]
            rain = row["rainfall_mm"]
            
            # Harvest seasonality factor (Tomato has 2 main cropping seasons in South India: Rabi & Kharif)
            d_obj = datetime.datetime.strptime(d_str, "%Y-%m-%d")
            doy = d_obj.timetuple().tm_yday
            season_factor = 1.0 + 0.35 * math.cos(2 * math.pi * (doy - 45) / 182.5)
            
            # Weather impact on harvest: excessive rain disrupts picking, extreme heat accelerates flush
            weather_mult = 1.0
            if rain > 25.0:
                weather_mult *= 0.65  # Rain disruption
            elif temp_avg > 32.0:
                weather_mult *= 1.25  # Premature flush
            
            # Select 25-45 farms harvesting each day
            active_farms = random.sample(farm_ids, k=random.randint(25, 45))
            
            for f_id in active_farms:
                f_meta = farm_dict[f_id]
                base = f_meta["base_yield_kg"] / 14.0  # Daily harvest chunk
                actual_kg = base * season_factor * weather_mult * float(np.random.lognormal(0, 0.2))
                actual_kg = max(50.0, round(actual_kg, 1))
                
                records.append({
                    "date": d_str,
                    "farm_id": f_id,
                    "taluk": f_meta["taluk"],
                    "crop": "Tomato",
                    "harvest_quantity_kg": actual_kg,
                    "temp_max": row["temp_max"],
                    "temp_min": row["temp_min"],
                    "temp_avg": temp_avg,
                    "relative_humidity": row["relative_humidity"],
                    "rainfall_mm": rain,
                    "market_modal_price_per_kg": round(float(22.0 - 0.0003 * actual_kg + np.random.normal(0, 2.5)), 2)
                })
        return pd.DataFrame(records)

    def generate_retailer_demand_history(self, weather_df: pd.DataFrame) -> pd.DataFrame:
        """Generates historical daily demand for each retailer across Bengaluru."""
        records = []
        for idx, row in weather_df.iterrows():
            d_str = row["date"]
            d_obj = datetime.datetime.strptime(d_str, "%Y-%m-%d")
            dow = d_obj.weekday()  # 5=Sat, 6=Sun
            
            # Weekend surge (+30% on Sat, +40% on Sun)
            weekend_boost = 1.35 if dow in (5, 6) else 1.0
            
            for ret in self.retail_locations:
                base = ret["daily_avg_demand"]
                noise = float(np.random.normal(1.0, 0.12))
                dem = round(base * weekend_boost * noise, 1)
                records.append({
                    "date": d_str,
                    "retailer_code": ret["code"],
                    "retailer_name": ret["name"],
                    "day_of_week": dow,
                    "is_weekend": int(dow in (5, 6)),
                    "demand_kg": max(150.0, dem),
                    "selling_price_per_kg": round(float(32.0 + np.random.normal(0, 2.0)), 2)
                })
        return pd.DataFrame(records)

    def generate_operational_batches(
        self, 
        n_batches: int = 60, 
        scenario: str = "NORMAL"
    ) -> List[Dict[str, Any]]:
        """
        Generates active operational batches with sensory telemetry and kinetic deterioration.
        Scenarios: NORMAL, HEATWAVE, DEMAND_SPIKE, FLEET_OUTAGE
        """
        batches = []
        now = datetime.datetime.now()
        
        # Scenario adjustments
        temp_offset = 6.0 if scenario == "HEATWAVE" else 0.0
        
        for b_idx in range(n_batches):
            batch_id = f"BAT-{now.strftime('%Y%m%d')}-{b_idx+1:03d}"
            harvest_age_hours = round(float(np.random.uniform(2.0, 72.0)), 1)
            quantity_kg = round(float(np.random.uniform(400.0, 2500.0)), 1)
            initial_firmness = round(float(np.random.uniform(0.85, 0.98)), 3)
            initial_brix = round(float(np.random.uniform(4.2, 5.6)), 2)
            
            # Generate hourly temperature log
            seq_length = max(6, int(harvest_age_hours))
            telemetry_seq = []
            base_temp = 24.0 + temp_offset
            
            for h in range(seq_length):
                # Hourly ambient diurnal swing
                hour_cycle = math.sin(2 * math.pi * h / 24.0)
                reading_temp = base_temp + 5.0 * hour_cycle + float(np.random.normal(0, 1.2))
                humidity = max(35.0, min(95.0, 68.0 - 15.0 * hour_cycle + float(np.random.normal(0, 3.0))))
                telemetry_seq.append({
                    "hour_step": h,
                    "temp_c": round(reading_temp, 2),
                    "humidity_pct": round(humidity, 2)
                })
            
            # Kinetic Arrhenius degradation formula for tomato
            # Ref: T_ref = 12C, Q10 = 2.2, base shelf life = 336 hours (14 days)
            avg_temp = np.mean([s["temp_c"] for s in telemetry_seq])
            q10 = 2.2
            accel_factor = (q10 ** ((avg_temp - 12.0) / 10.0))
            consumed_shelf_life_hours = harvest_age_hours * accel_factor
            remaining_shelf_life_hours = max(0.0, 336.0 - consumed_shelf_life_hours)
            
            # Spoilage probability mapping via sigmoid
            z = (consumed_shelf_life_hours - 240.0) / 35.0
            spoilage_prob = 1.0 / (1.0 + math.exp(-z))
            
            if spoilage_prob < 0.20:
                risk_cat = "LOW"
            elif spoilage_prob < 0.50:
                risk_cat = "MEDIUM"
            elif spoilage_prob < 0.80:
                risk_cat = "HIGH"
            else:
                risk_cat = "CRITICAL"
                
            batches.append({
                "batch_id": batch_id,
                "crop": "Tomato",
                "farm_id": f"FRM-{random.randint(1, 100):03d}",
                "quantity_kg": quantity_kg,
                "harvest_age_hours": harvest_age_hours,
                "initial_firmness": initial_firmness,
                "initial_brix": initial_brix,
                "avg_exposure_temp_c": round(float(avg_temp), 2),
                "remaining_shelf_life_hours": round(float(remaining_shelf_life_hours), 2),
                "spoilage_probability": round(float(spoilage_prob), 4),
                "spoilage_risk_category": risk_cat,
                "telemetry_sequence": telemetry_seq,
                "is_urgent_fefo": risk_cat in ("HIGH", "CRITICAL"),
                "status": "AT_FARM"
            })
            
        return batches

    def compute_distance_matrix(self, locations: List[Dict[str, float]]) -> np.ndarray:
        """
        Computes accurate road transit distance matrix using Haversine with a 1.28 road winding factor.
        """
        n = len(locations)
        dist_matrix = np.zeros((n, n), dtype=float)
        R = 6371.0 # Earth radius in km
        ROAD_FACTOR = 1.28
        
        for i in range(n):
            lat1 = math.radians(locations[i]["lat"])
            lon1 = math.radians(locations[i]["lng"])
            for j in range(n):
                if i == j:
                    continue
                lat2 = math.radians(locations[j]["lat"])
                lon2 = math.radians(locations[j]["lng"])
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
                c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
                crow_dist = R * c
                dist_matrix[i, j] = round(crow_dist * ROAD_FACTOR, 2)
        return dist_matrix

# Standalone execution for data generation & saving
if __name__ == "__main__":
    gen = AgriSupplyChainDataGenerator()
    data_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data_store")
    os.makedirs(data_dir, exist_ok=True)
    
    print("1. Generating 100 Farms across Kolar...")
    farms = gen.generate_farms(100)
    with open(os.path.join(data_dir, "farms.json"), "w") as f:
        json.dump(farms, f, indent=2)
        
    print("2. Generating Cold Storage & Retailers...")
    with open(os.path.join(data_dir, "storage_facilities.json"), "w") as f:
        json.dump(gen.storage_facilities, f, indent=2)
    with open(os.path.join(data_dir, "retailers.json"), "w") as f:
        json.dump(gen.retail_locations, f, indent=2)
    with open(os.path.join(data_dir, "vehicles.json"), "w") as f:
        json.dump(gen.vehicle_fleet, f, indent=2)
        
    print("3. Generating 372 Days Agro-Weather Data...")
    weather_df = gen.generate_weather_series()
    weather_df.to_csv(os.path.join(data_dir, "weather_history.csv"), index=False)
    
    print("4. Generating Historical Supply & Demand Series...")
    supply_df = gen.generate_supply_history(farms, weather_df)
    supply_df.to_csv(os.path.join(data_dir, "supply_history.csv"), index=False)
    
    demand_df = gen.generate_retailer_demand_history(weather_df)
    demand_df.to_csv(os.path.join(data_dir, "demand_history.csv"), index=False)
    
    print("5. Generating Seeded Operational Batches for Scenarios...")
    for scen in ["NORMAL", "HEATWAVE", "DEMAND_SPIKE", "FLEET_OUTAGE"]:
        batches = gen.generate_operational_batches(60, scenario=scen)
        with open(os.path.join(data_dir, f"batches_{scen.lower()}.json"), "w") as f:
            json.dump(batches, f, indent=2)
            
    print(f"Data Generation COMPLETE! All files persisted in: {data_dir}")
