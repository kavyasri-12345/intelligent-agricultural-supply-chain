const dataStore = require('../models/dataStore');
const aiClient = require('../services/aiServiceClient');

const listBatches = async (req, res) => {
  const { scenario } = req.query;
  try {
    const batches = await aiClient.getActiveBatches(scenario || 'NORMAL');
    return res.json(batches);
  } catch (err) {
    // Fallback to local dataStore batches
    return res.json(dataStore.batches);
  }
};

const submitHarvest = async (req, res) => {
  const { farm_id, quantity_kg, harvest_age_hours, initial_firmness, initial_brix, avg_exposure_temp_c } = req.body;
  if (!farm_id || !quantity_kg) {
    return res.status(400).json({ error: 'Farm ID and harvest quantity are required.' });
  }

  const newBatch = dataStore.addBatch({
    farm_id,
    quantity_kg,
    harvest_age_hours,
    initial_firmness,
    initial_brix,
    avg_exposure_temp_c
  });

  // Calculate real-time AI spoilage prediction for new batch
  try {
    const prediction = await aiClient.predictBatchSpoilage({
      batch_id: newBatch.batch_id,
      harvest_age_hours: newBatch.harvest_age_hours,
      quantity_kg: newBatch.quantity_kg,
      initial_firmness: newBatch.initial_firmness,
      initial_brix: newBatch.initial_brix,
      avg_exposure_temp_c: newBatch.avg_exposure_temp_c
    });

    newBatch.spoilage_probability = prediction.spoilage_probability;
    newBatch.spoilage_risk_category = prediction.risk_category;
    newBatch.remaining_shelf_life_hours = prediction.remaining_shelf_life_hours;
    newBatch.delivery_feasible = prediction.delivery_feasible;
  } catch (err) {
    console.warn('AI prediction service unavailable for harvest submission:', err.message);
  }

  return res.status(201).json({
    message: 'Harvest batch registered successfully',
    batch: newBatch
  });
};

const explainBatch = async (req, res) => {
  try {
    const explanation = await aiClient.explainBatchSpoilage(req.body);
    return res.json(explanation);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to explain batch spoilage', details: err.message });
  }
};

module.exports = {
  listBatches,
  submitHarvest,
  explainBatch
};
