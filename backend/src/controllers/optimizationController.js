const dataStore = require('../models/dataStore');
const aiClient = require('../services/aiServiceClient');

const runOptimization = async (req, res) => {
  const { scenario, planning_horizon_days, weights } = req.body;
  try {
    const solution = await aiClient.solveOptimization({
      scenario: scenario || 'NORMAL',
      planning_horizon_days: planning_horizon_days || 7,
      weights
    });

    const runRecord = dataStore.addOptimizationRun(solution, false);
    return res.json(runRecord);
  } catch (err) {
    return res.status(500).json({ error: 'Optimization execution failed', details: err.message });
  }
};

const approveOptimizationPlan = (req, res) => {
  const { id } = req.params;
  const run = dataStore.optimizationRuns.find(r => r.id === id);
  if (!run) {
    return res.status(404).json({ error: 'Optimization run not found.' });
  }

  run.is_approved = true;
  run.approved_by = req.user.fullName;
  run.approved_at = new Date().toISOString();

  return res.json({ message: 'Optimization plan approved by Supply Chain Planner', plan: run });
};

const compareBaselines = async (req, res) => {
  const { scenario } = req.query;
  try {
    const comparison = await aiClient.compareBaselines({ scenario: scenario || 'NORMAL' });
    return res.json(comparison);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to benchmark baselines', details: err.message });
  }
};

const listRuns = (req, res) => {
  return res.json(dataStore.optimizationRuns);
};

module.exports = {
  runOptimization,
  approveOptimizationPlan,
  compareBaselines,
  listRuns
};
