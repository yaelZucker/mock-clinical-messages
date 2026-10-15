// Nurse worklist: tracks active alerts awaiting acknowledgment
const worklist = new Map(); // alertId → alert

function addAlert(alert) {
  worklist.set(alert.alertId, { ...alert, acknowledged: false, addedAt: new Date().toISOString() });
  console.log(`[Nurse] 🔔 New alert on worklist: [${alert.severity.toUpperCase()}] ${alert.message} (patient=${alert.patientId})`);
}

function acknowledge(alertId) {
  const alert = worklist.get(alertId);
  if (!alert) return { ok: false, error: 'Alert not found' };
  alert.acknowledged = true;
  alert.acknowledgedAt = new Date().toISOString();
  console.log(`[Nurse] ✅ Alert ${alertId} acknowledged`);
  return { ok: true, alert };
}

function getWorklist() {
  return Array.from(worklist.values());
}

function getPendingAlerts() {
  return Array.from(worklist.values()).filter(a => !a.acknowledged);
}

module.exports = { addAlert, acknowledge, getWorklist, getPendingAlerts };
