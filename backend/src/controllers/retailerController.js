const dataStore = require('../models/dataStore');
const aiClient = require('../services/aiServiceClient');

const listRetailers = (req, res) => {
  return res.json(dataStore.retailers);
};

const getDemandForecast = async (req, res) => {
  const { retailer_code, horizon_days } = req.query;
  try {
    const forecast = await aiClient.getDemandForecast({
      retailer_code,
      horizon_days: horizon_days ? parseInt(horizon_days) : 7
    });
    return res.json(forecast);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch demand forecast', details: err.message });
  }
};

const createOrder = (req, res) => {
  const { retailer_code, requested_quantity_kg, delivery_window } = req.body;
  if (!retailer_code || !requested_quantity_kg) {
    return res.status(400).json({ error: 'Retailer code and requested quantity are required.' });
  }

  const newOrder = dataStore.addOrder({
    retailer_code,
    requested_quantity_kg,
    delivery_window
  });

  return res.status(201).json({
    message: 'Retail order placed successfully',
    order: newOrder
  });
};

const listOrders = (req, res) => {
  return res.json(dataStore.orders);
};

module.exports = {
  listRetailers,
  getDemandForecast,
  createOrder,
  listOrders
};
