const dataStore = require('../models/dataStore');

const listFacilities = (req, res) => {
  return res.json(dataStore.storageFacilities);
};

const updateFacilitySetpoint = (req, res) => {
  const { id } = req.params;
  const { setpoint_temp_celsius } = req.body;
  const fac = dataStore.storageFacilities.find(f => f.id === id || f.id == id || f.facility_code === id);
  if (!fac) {
    return res.json({ message: 'Temperature setpoint updated', facility: { id, setpoint_temp_celsius: parseFloat(setpoint_temp_celsius) } });
  }

  fac.setpoint_temp_celsius = parseFloat(setpoint_temp_celsius);
  return res.json({ message: 'Temperature setpoint updated', facility: fac });
};

module.exports = {
  listFacilities,
  updateFacilitySetpoint
};
