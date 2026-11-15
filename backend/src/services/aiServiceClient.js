const axios = require('axios');

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

class AiServiceClient {
  constructor() {
    this.client = axios.create({
      baseURL: AI_SERVICE_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getHealth() {
    const res = await this.client.get('/');
    return res.data;
  }

  async getSupplyForecast(params = {}) {
    const res = await this.client.post('/api/v1/forecast/supply', {
      crop: params.crop || 'tomato',
      horizon_days: params.horizon_days || 7,
      model: params.model || 'lightgbm'
    });
    return res.data;
  }

  async getHistoricalSupply(limitDays = 30) {
    const res = await this.client.get(`/api/v1/forecast/supply/historical?limit_days=${limitDays}`);
    return res.data;
  }

  async getDemandForecast(params = {}) {
    const res = await this.client.post('/api/v1/forecast/demand', {
      crop: params.crop || 'tomato',
      horizon_days: params.horizon_days || 7,
      retailer_code: params.retailer_code || null
    });
    return res.data;
  }

  async getFarmClusters(params = {}) {
    const res = await this.client.post('/api/v1/clustering/farms', {
      method: params.method || 'kmeans',
      n_clusters: params.n_clusters || 5,
      weighted_by_yield: params.weighted_by_yield !== false,
      eps_km: params.eps_km || 6.0
    });
    return res.data;
  }

  async getFarmNetworkGraph() {
    const res = await this.client.get('/api/v1/clustering/network-graph');
    return res.data;
  }

  async predictBatchSpoilage(batchData) {
    const res = await this.client.post('/api/v1/spoilage/predict-batch', batchData);
    return res.data;
  }

  async getActiveBatches(scenario = 'NORMAL') {
    const res = await this.client.get(`/api/v1/spoilage/active-batches?scenario=${scenario}`);
    return res.data;
  }

  async solveOptimization(params = {}) {
    const res = await this.client.post('/api/v1/optimization/solve', {
      scenario: params.scenario || 'NORMAL',
      planning_horizon_days: params.planning_horizon_days || 7,
      weights: params.weights || null
    });
    return res.data;
  }

  async compareBaselines(params = {}) {
    const res = await this.client.post('/api/v1/optimization/compare-baselines', {
      scenario: params.scenario || 'NORMAL'
    });
    return res.data;
  }

  async getSupplyFeatureImportance() {
    const res = await this.client.get('/api/v1/explainability/supply-importance');
    return res.data;
  }

  async explainBatchSpoilage(batchData) {
    const res = await this.client.post('/api/v1/explainability/batch-spoilage-attribution', batchData);
    return res.data;
  }

  async getScenarios() {
    const res = await this.client.get('/api/v1/scenarios');
    return res.data;
  }

  async getModelMetricsSummary() {
    const res = await this.client.get('/api/v1/scenarios/metrics-summary');
    return res.data;
  }
}

module.exports = new AiServiceClient();
