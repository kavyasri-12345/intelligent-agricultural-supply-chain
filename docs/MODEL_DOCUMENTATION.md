# MODEL DOCUMENTATION & SPECIFICATIONS

## 1. Supply Forecasting Models (Module A)
- **Target**: Daily harvest quantity ($kg$) aggregated at district/cluster/farm levels over a 7-day rolling horizon.
- **Formulation**:
  - Seasonal Naive: Baseline $\hat{y}_{t+h} = y_{t+h-7}$.
  - LightGBM Regressor: Multi-output or recursive autoregression using 7, 14, 21-day lags, rolling mean/std (7-day), weather covariates (temp_max, temp_min, rainfall, humidity), and cyclical day-of-year embeddings.
  - XGBoost Regressor: Gradient-boosted decision trees with quantile regression ($\alpha \in \{0.05, 0.50, 0.95\}$) for prediction intervals.
  - PyTorch LSTM/GRU: Recurrent neural network mapping $T=30$ historical days of multivariate sequences $[y_{t-29:t}, W_{t-29:t}]$ to $\hat{y}_{t+1:t+7}$.
- **Metrics**:
  - Mean Absolute Error (MAE): $\frac{1}{N}\sum |y_i - \hat{y}_i|$
  - Root Mean Squared Error (RMSE): $\sqrt{\frac{1}{N}\sum (y_i - \hat{y}_i)^2}$
  - Weighted Absolute Percentage Error (WAPE): $\frac{\sum |y_i - \hat{y}_i|}{\sum y_i}$

---

## 2. Retailer Demand Forecasting Models (Module B)
- **Target**: Daily order quantity ($kg$) for each of the 20 retail outlets across Bengaluru urban zones.
- **Formulation**:
  - LightGBM / XGBoost: Features include day-of-week, weekend indicator, historical store-level sales lags (1, 7, 14 days), local market retail price, holiday flags, and weather.
  - PyTorch BiLSTM: Bidirectional LSTM capturing forward and backward temporal patterns in grocery restocking cycles.
- **Metrics**: MAE, RMSE, WAPE, and Stockout Penalty Metric.

---

## 3. Intelligent Farmer Clustering (Module C)
- **Algorithms**:
  - Spatial-Capacity K-Means: Clusters farms based on geographic coordinates $(lat, lon)$ weighted by daily harvest volume to optimize collection vehicle dispatch.
  - DBSCAN: Density-Based Spatial Clustering of Applications with Noise, identifying dense farm pockets and flagging isolated outlier farms that require bespoke consolidation.
  - Farm Graph Representation: Graph with nodes representing farms and edges representing road travel time $\le 30$ mins.

---

## 4. Deep Learning Spoilage Prediction (Module D)
- **Target**: Spoilage status ($0 = \text{Fresh/Salable}, 1 = \text{Deteriorated/Spoiled}$) and probability $p \in [0, 1]$.
- **Formulation**:
  - Random Forest Classifier (Baseline).
  - XGBoost Binary Classifier with calibrated probability outputs.
  - PyTorch Sequential LSTM: Ingests sequential sensor logs $[T_1, H_1], [T_2, H_2], \dots, [T_k, H_k]$ recorded every hour during farm storage and transit.
- **Metrics**: Precision, Recall, F1-Score, ROC-AUC, Brier Score.

---

## 5. Temperature-Aware Shelf-Life Estimation (Module E)
- **Kinetic Deterioration Model**:
  Quality index $Q(t) \in [0, 1]$ degrades according to temperature-dependent kinetics:
  $$\frac{dQ}{dt} = -k(T)$$
  $$k(T) = k_{ref} \cdot Q_{10}^{\frac{T - T_{ref}}{10}}$$
  For tomatoes: $T_{ref} = 12^\circ\text{C}$, $Q_{10} \approx 2.2$.
  Under ambient thermal abuse ($32^\circ\text{C}$ in summer heatwave), $k(32) = k_{ref} \cdot 2.2^2 \approx 4.84 \cdot k_{ref}$, reducing shelf life from 14 days to less than 3 days.
- **FEFO Dispatch Rule**: Batches are strictly prioritized based on $\text{RSL} = \max(0, \frac{Q(t) - Q_{min}}{k(T_{proj})})$.

---

## 6. Cold-Storage Allocation & VRPTW Optimization (Modules F, G, H)
- **Google OR-Tools CP-SAT Mixed-Integer Optimization**:
  - Decision Variables:
    - $x_{b, s} \in \{0, 1\}$: Binary assignment of batch $b$ to storage facility $s$.
    - $y_{b, r} \in \{0, 1\}$: Direct assignment of batch $b$ to retailer $r$.
    - $z_{v, i, j} \in \{0, 1\}$: Vehicle $v$ traverses arc $(i, j)$ in the network.
    - $t_i$: Arrival time at node $i$.
  - Objective:
    $$\min \sum_{b} C_{\text{spoilage}} \cdot \text{Risk}_b \cdot Q_b + \sum_{v, i, j} d_{ij} \cdot c_v \cdot z_{v,i,j} + \sum_{b, s} c_s \cdot Q_b \cdot x_{b,s} + \sum_{r} P_{\text{unmet}} \cdot (D_r - \sum_b S_{b,r})$$
  - Constraints:
    - Facility capacity: $\sum_b Q_b \cdot x_{b, s} \le \text{Cap}_s \quad \forall s$
    - Vehicle capacity: $\sum_{i \in \text{Route}(v)} Q_i \le \text{Cap}_v \quad \forall v$
    - Time windows: $e_i \le t_i \le l_i \quad \forall i$
    - Shelf-life feasibility: $t_{\text{delivery}, b} \le t_{\text{harvest}, b} + \text{RSL}_b$
    - Cold-chain compatibility: High-spoilage batches assigned only to Reefer vehicles ($is\_reefer_v = 1$).
