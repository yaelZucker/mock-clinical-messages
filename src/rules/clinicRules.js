// Versioned, cached clinic rules
// In prod this would be fetched from a config service and versioned per clinic
const RULES_VERSION = '2.1.0';

const rulesByClinic = {
  clinic_001: [
    { id: 'r1', metric: 'heartRate',    operator: '>',  threshold: 120, severity: 'urgent',  message: 'Heart rate critically high' },
    { id: 'r2', metric: 'heartRate',    operator: '<',  threshold: 40,  severity: 'urgent',  message: 'Heart rate critically low' },
    { id: 'r3', metric: 'spO2',         operator: '<',  threshold: 90,  severity: 'urgent',  message: 'Oxygen saturation critical' },
    { id: 'r4', metric: 'systolic',     operator: '>',  threshold: 180, severity: 'urgent',  message: 'Hypertensive crisis' },
    { id: 'r5', metric: 'temperature',  operator: '>',  threshold: 39,  severity: 'routine', message: 'Elevated temperature' },
    { id: 'r6', metric: 'heartRate',    operator: '>',  threshold: 100, severity: 'routine', message: 'Elevated heart rate' },
  ],
  clinic_002: [
    { id: 'r1', metric: 'heartRate',    operator: '>',  threshold: 130, severity: 'urgent',  message: 'Heart rate critically high' },
    { id: 'r2', metric: 'spO2',         operator: '<',  threshold: 88,  severity: 'urgent',  message: 'Oxygen saturation critical' },
    { id: 'r3', metric: 'temperature',  operator: '>',  threshold: 38.5,severity: 'routine', message: 'Elevated temperature' },
  ],
};

const cache = new Map();

function getRulesForClinic(clinicId) {
  if (cache.has(clinicId)) {
    return cache.get(clinicId);
  }
  const rules = rulesByClinic[clinicId] || [];
  cache.set(clinicId, { version: RULES_VERSION, rules });
  console.log(`[ClinicRules] Loaded v${RULES_VERSION} rules for ${clinicId} (${rules.length} rules)`);
  return { version: RULES_VERSION, rules };
}

module.exports = { getRulesForClinic };
