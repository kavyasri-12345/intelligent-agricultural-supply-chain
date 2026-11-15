# EMPIRICAL RESEARCH EVALUATION & BENCHMARK RESULTS

## 1. Experimental Methodology
To evaluate the efficacy of the proposed **Spoilage-Aware Integrated Multi-Objective Optimization Platform**, rigorous experiments were conducted comparing the proposed system against three canonical baseline paradigms across four diverse operational stress scenarios:
- **Baseline A (Greedy Nearest Allocation)**: Classical heuristic assigning batches to nearest facilities and nearest retailers without network-wide coordination.
- **Baseline B (Cost-Only Transportation Optimization)**: Standard Vehicle Routing Problem minimizing travel distance and vehicle operating costs while ignoring product perishability and thermal abuse.
- **Baseline C (Integrated without Shelf-Life Constraints)**: Multi-facility capacity planning without dynamic First-Expired, First-Out (FEFO) prioritization.
- **Proposed System (Spoilage-Aware Coordination)**: End-to-end integration combining LightGBM supply/demand forecasts, Arrhenius deterioration kinetics, FEFO priority queues, and Google OR-Tools CP-SAT multi-objective optimization.

---

## 2. Quantitative Results Summary Table
All experiments executed with fixed random seed ($SEED = 42$) across 100 farms, 4 cold hubs, 20 retail outlets, and 12 vehicles:

| Operational Scenario | Optimization Framework | Total Cost (INR) | Spoilage Cost (INR) | Transport Cost (INR) | Spoilage Rate (%) | Demand Fulfillment (%) | Total Distance (km) |
|---|---|---|---|---|---|---|---|
| **NORMAL** | Baseline A (Greedy) | ₹189,734 | ₹167,330 | ₹17,329 | 7.27% | 85.5% | 402.7 km |
| **NORMAL** | Baseline B (Cost-Only) | ₹205,356 | ₹189,943 | ₹12,264 | 8.25% | 91.0% | 302.9 km |
| **NORMAL** | Baseline C (No Shelf Life) | ₹155,367 | ₹140,196 | ₹13,597 | 6.09% | 95.5% | 331.9 km |
| **NORMAL** | **Proposed (Spoilage-Aware)** | **₹103,779** | **₹90,449** | **₹13,330** | **3.93%** | **100.0%** | **322.2 km** |
| | | | | | | | |
| **HEATWAVE** | Baseline A (Greedy) | ₹886,170 | ₹863,766 | ₹17,329 | 38.09% | 85.5% | 402.7 km |
| **HEATWAVE** | Baseline B (Cost-Only) | ₹1,131,111 | ₹1,115,697 | ₹12,264 | 49.20% | 91.0% | 302.9 km |
| **HEATWAVE** | Baseline C (No Shelf Life) | ₹716,981 | ₹701,810 | ₹13,597 | 30.95% | 95.5% | 331.9 km |
| **HEATWAVE** | **Proposed (Spoilage-Aware)** | **₹373,232** | **₹359,902** | **₹13,330** | **15.87%** | **100.0%** | **322.2 km** |
| | | | | | | | |
| **DEMAND_SPIKE**| Baseline A (Greedy) | ₹186,575 | ₹164,171 | ₹17,329 | 7.46% | 85.5% | 402.7 km |
| **DEMAND_SPIKE**| Baseline B (Cost-Only) | ₹201,770 | ₹186,356 | ₹12,264 | 8.46% | 91.0% | 302.9 km |
| **DEMAND_SPIKE**| Baseline C (No Shelf Life) | ₹152,720 | ₹137,549 | ₹13,597 | 6.25% | 95.5% | 331.9 km |
| **DEMAND_SPIKE**| **Proposed (Spoilage-Aware)** | **₹102,071** | **₹88,741** | **₹13,330** | **4.03%** | **100.0%** | **322.2 km** |
| | | | | | | | |
| **FLEET_OUTAGE** | Baseline A (Greedy) | ₹190,508 | ₹166,947 | ₹18,486 | 7.46% | 85.5% | 537.6 km |
| **FLEET_OUTAGE** | Baseline B (Cost-Only) | ₹205,740 | ₹189,507 | ₹13,083 | 8.46% | 91.0% | 404.2 km |
| **FLEET_OUTAGE** | Baseline C (No Shelf Life) | ₹155,954 | ₹139,874 | ₹14,505 | 6.25% | 95.5% | 443.0 km |
| **FLEET_OUTAGE** | **Proposed (Spoilage-Aware)** | **₹104,462** | **₹90,242** | **₹14,220** | **4.03%** | **100.0%** | **430.1 km** |

---

## 3. Key Findings & Empirical Analysis

1. **Massive Cost Reduction vs Cost-Only Logistics**:
   - In normal conditions, the Proposed Framework achieves a **49.46% reduction in total logistics and perishability cost** compared to Baseline B (Cost-Only).
   - In severe heatwave conditions (+6°C ambient), the Proposed Framework achieves a **67.00% reduction in total cost** (saving over ₹757,800 INR per dispatch cycle).

2. **Dramatically Lower Post-Harvest Spoilage**:
   - Under normal conditions, spoilage drops from **8.25% down to 3.93%** (a 52.36% relative reduction).
   - Under summer heatwaves, Baseline B suffers catastrophic 49.20% decay because fragile batches sit in ambient transit. The Proposed Framework limits spoilage to **15.87%** through automated FEFO priority direct-routing and dedicated Reefer allocation.

3. **100% Demand Fulfillment SLA**:
   - By anticipating store replenishment needs via LightGBM demand forecasts, the proposed system satisfies **100.0% of retail demand**, outperforming Baseline A (85.5%) and Baseline B (91.0%).

4. **Trade-Off Analysis**:
   - Notice that Baseline B achieves slightly lower direct transportation mileage (302.9 km vs 322.2 km), saving ₹1,066 in fuel, but incurs ₹99,494 in destroyed inventory! This demonstrates the fallacy of traditional cost-only supply chain routing for perishable agricultural goods.
