# INTELLIGENT SPOILAGE-AWARE COORDINATION AND OPTIMIZATION OF PERISHABLE AGRICULTURAL SUPPLY CHAINS
### Final-Year B.Tech CSE Capstone Project & Research Decision-Support Platform

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Node.js 22](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![Google OR-Tools](https://img.shields.io/badge/Optimization-Google_OR--Tools_CP--SAT-red.svg)](https://developers.google.com/optimization)
[![PyTorch](https://img.shields.io/badge/Deep_Learning-PyTorch-EE4C2C.svg)](https://pytorch.org/)

---

## 1. Project Overview
Post-harvest losses in perishable produce (specifically tomatoes in peri-urban catchments like Kolar/Bengaluru, India) often reach 30–40% due to uncoordinated farm collection, lack of cold-chain visibility, and traditional cost-only logistics that ignore product shelf life.

This project delivers an integrated, enterprise-grade AI decision-support platform combining:
1. **Supply Forecasting**: LightGBM, XGBoost, and PyTorch LSTM/GRU sequence models over 7-day horizons with prediction intervals.
2. **Retailer Demand Forecasting**: Store-level demand prediction using BiLSTM and Gradient Boosting.
3. **Intelligent Farmer Clustering**: Spatial & capacity-weighted K-Means & DBSCAN with Farm Graph connectivity.
4. **Deep Learning Spoilage Prediction**: Multi-layer sensor sequence classifier (LSTM & XGBoost) mapping temperature/humidity exposure to spoilage risk.
5. **Temperature-Aware Shelf-Life Estimation**: Arrhenius kinetic deterioration modeling with dynamic First-Expired, First-Out (FEFO) routing.
6. **Cold-Storage Allocation**: Mixed-integer constraint programming (OR-Tools CP-SAT) for multi-facility capacity allocation.
7. **Vehicle Assignment & Route Optimization**: Heterogeneous Fleet Capacitated VRP with Time Windows (VRPTW).
8. **Integrated Multi-Objective Optimization**: Joint minimization of spoilage, transportation, refrigeration, and unmet demand penalties.
9. **Explainable AI (XAI)**: SHAP feature importance, waterfall attributions, and binding constraint slack analysis.
10. **Full-Stack SaaS Platform**: Modern Next.js 14 frontend, Express.js backend, and PostgreSQL + PostGIS database.

---

## 2. Directory Structure
```
agrisupplychain/
├── ai_service/             # FastAPI AI, Deep Learning & OR-Tools Optimization
│   ├── app/
│   │   ├── api/            # REST API routers (supply, demand, spoilage, routing, etc.)
│   │   ├── core/           # Configuration & logging
│   │   ├── data/           # Seeded generator & public dataset ingestion
│   │   ├── models/         # LightGBM, XGBoost, PyTorch LSTM, Arrhenius kinetic models
│   │   ├── optimization/   # OR-Tools CP-SAT storage allocator, VRPTW, Multi-objective
│   │   └── artifacts/      # Trained model weights & scalers
│   └── tests/              # Pytest model & optimization validation suite
├── backend/                # Node.js + Express.js API & RBAC Authentication
├── frontend/               # Next.js 14 + React + TypeScript + Tailwind + MapLibre GL
├── database/               # PostgreSQL schema & seed migration scripts
├── experiments/            # Benchmark runner (Baselines A, B, C vs Proposed) & plots
├── docs/                   # Complete architectural, model, and dataset specifications
└── docker-compose.yml      # Multi-container orchestration
```

---

## 3. Getting Started
Refer to [DEPLOYMENT.md](file:///c:/Users/kavya/OneDrive/Desktop/agrisupplychain/DEPLOYMENT.md) for step-by-step setup and execution instructions.
