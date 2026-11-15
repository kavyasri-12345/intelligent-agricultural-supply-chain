const dataStore = require('../models/dataStore');

const listVehicles = (req, res) => {
  return res.json(dataStore.vehicles);
};

const updateVehicleStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const veh = dataStore.vehicles.find(v => v.id === id);
  if (!veh) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  veh.status = status;
  return res.json({ message: 'Vehicle status updated', vehicle: veh });
};

module.exports = {
  listVehicles,
  updateVehicleStatus
};
