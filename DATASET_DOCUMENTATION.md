# DATASET DOCUMENTATION & PROVENANCE

## 1. Overview & Provenance Standards
In accordance with ethical scientific computing and reproducibility standards, all datasets utilized within this research platform maintain strict provenance documentation:
1. **Public Meteorological Data (NASA POWER API)**: Daily temperature, precipitation, relative humidity, and solar radiation for the Kolar/Bengaluru district catchment ($13.13^\circ\text{N}, 78.13^\circ\text{E}$).
2. **Public Agricultural Market Data (AGMARKNET)**: Daily modal prices ($\text{INR}/quintal$) and market arrival volumes ($MT$) for tomatoes in Kolar and Azadpur APMC markets.
3. **OpenStreetMap (OSM) & OSRM**: Real-world road graph coordinates, inter-facility transit times, and highway geometries across Karnataka / National Highway 75.
4. **Seeded Synthetic Operational Dataset**: Because farm-level hourly IoT telemetry, internal cold-storage bay temperatures, and vehicle route telematics are proprietary and not publicly archived at individual batch resolution, a scientifically rigorous, seeded generator synthesizes these operational records.

---

## 2. Seeded Synthetic Operational Data Generator Details
- **Random Seed**: Fixed at `SEED = 42` for exact reproducibility across runs.
- **Entities Generated**:
  - **Farms**: $N = 100$ farms distributed realistically across Kolar agricultural taluks (Kolar, Malur, Bangarapet, Srinivaspur, Mulbagal).
  - **Retailers**: $M = 20$ retail supermarkets/distributors located across urban Bengaluru (Indiranagar, Whitefield, Koramangala, Jayanagar, Malleshwaram, Yelahanka, HSR Layout, etc.).
  - **Cold-Storage Facilities**: $K = 4$ regional cold-chain distribution centers (Kolar APMC Hub, Hoskote Cold Store, Whitefield Logistics Center, Devanahalli Fresh Hub).
  - **Fleet Vehicles**: $V = 12$ vehicles (4 Reefer Trucks with active cooling $4-10^\circ\text{C}$, 4 Ventilated Vans, 4 Ambient Pickups).
- **Time Horizon**: 365 days of historical data + 7 days rolling forward test horizon.
- **Sensory & Physical Variables**:
  - Tomato firmness ($N \cdot cm^{-2}$), Soluble Solids Content (Brix), transit vibration index ($g_{rms}$), ambient exposure duration ($hr$), storage chamber setpoints ($^\circ\text{C}$).
- **Stress Scenarios**:
  - **Scenario 1: Normal Operations** (Seasonal average weather, steady demand).
  - **Scenario 2: Heatwave Event** (Ambient temperatures surge $+6^\circ\text{C}$ to $38^\circ\text{C}$, accelerating spoilage rates by $2.5\times$).
  - **Scenario 3: Demand Spike** (Urban demand surges $+45\%$ due to festival holiday demand).
  - **Scenario 4: Storage Outage & Fleet Breakdown** (Cold Hub 2 compressor failure and 2 Reefer trucks out of service).
