const nurse = require('../nurse/nurseService');

const ACK_TIMEOUT_MS = 30_000; // 30s for demo (prod would be minutes)
const tracked = new Map();

function track(alert) {
  const timer = setTimeout(() => {
    const pending = nurse.getPendingAlerts().find(a => a.alertId === alert.alertId);
    if (pending) {
      console.log(`[EscalationTimer] 🚨 ESCALATING: alert ${alert.alertId} not acknowledged within ${ACK_TIMEOUT_MS / 1000}s! Patient=${alert.patientId}`);
      // In prod: page supervisor, send SMS escalation, etc.
    }
  }, ACK_TIMEOUT_MS);

  tracked.set(alert.alertId, timer);
}

function cancel(alertId) {
  const timer = tracked.get(alertId);
  if (timer) {
    clearTimeout(timer);
    tracked.delete(alertId);
  }
}

module.exports = { track, cancel };
