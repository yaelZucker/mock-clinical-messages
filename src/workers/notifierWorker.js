const nurse = require('../nurse/nurseService');
const queues = require('../queues/priorityQueues');
const escalation = require('../timer/escalationTimer');

const MAX_RETRIES = 3;

function sendNotification(alert, attempt = 1) {
  // Simulate push/SMS delivery (90% success rate)
  const delivered = Math.random() > 0.1;
  if (delivered) {
    console.log(`[Notifier] 📲 Delivered [${alert.severity.toUpperCase()}] "${alert.message}" to nurse (attempt ${attempt})`);
    nurse.addAlert(alert);
    escalation.track(alert);
  } else if (attempt < MAX_RETRIES) {
    console.log(`[Notifier] ⚠️  Delivery failed, retrying (attempt ${attempt + 1})…`);
    sendNotification(alert, attempt + 1);
  } else {
    console.log(`[Notifier] ❌ Failed to deliver after ${MAX_RETRIES} attempts: "${alert.message}"`);
  }
}

function startWorkers() {
  // Drain urgent immediately
  queues.drainUrgent(sendNotification);

  // Drain routine on a slow interval (simulates batching)
  setInterval(() => {
    queues.drainRoutine(sendNotification);
  }, 5000);
}

module.exports = { startWorkers, sendNotification };
