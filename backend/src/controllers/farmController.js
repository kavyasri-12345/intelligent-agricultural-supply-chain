const dataStore = require('../models/dataStore');
const aiClient = require('../services/aiServiceClient');

const listFarms = (req, res) => {
  const { taluk, limit } = req.query;
  let results = dataStore.farms;
  if (taluk) {
    results = results.filter(f => f.taluk.toLowerCase() === taluk.toLowerCase());
  }
  if (limit) {
    results = results.slice(0, parseInt(limit));
  }
  return res.json(results);
};

const getFarmClusters = async (req, res) => {
  try {
    const { method, n_clusters, eps_km } = req.query;
    const clusters = await aiClient.getFarmClusters({
      method: method || 'kmeans',
      n_clusters: n_clusters ? parseInt(n_clusters) : 5,
      eps_km: eps_km ? parseFloat(eps_km) : 6.0
    });
    return res.json(clusters);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute farm clusters from AI service', details: err.message });
  }
};

const getFarmNetwork = async (req, res) => {
  try {
    const network = await aiClient.getFarmNetworkGraph();
    return res.json(network);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch farm network graph', details: err.message });
  }
};

const registerFarm = (req, res) => {
  const { name, taluk, lat, lng, acreage, base_yield_kg, soil_type, irrigation } = req.body;
  if (!name || !lat || !lng) {
    return res.status(400).json({ error: 'Farm name, latitude, and longitude are required.' });
  }

  const newFarm = {
    farm_id: `FRM-${dataStore.farms.length + 1}`,
    name,
    taluk: taluk || 'Kolar',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    acreage: parseFloat(acreage || 2.5),
    crop: 'Tomato (Hybrid Shivam)',
    base_yield_kg: parseFloat(base_yield_kg || 1500.0),
    soil_type: soil_type || 'Red Loam',
    irrigation: irrigation || 'Drip Irrigation',
    farmer_phone: req.user.phone || '+91-9845012345'
  };

  dataStore.farms.push(newFarm);
  return res.status(201).json({ message: 'Farm registered successfully', farm: newFarm });
};

module.exports = {
  listFarms,
  getFarmClusters,
  getFarmNetwork,
  registerFarm
};
