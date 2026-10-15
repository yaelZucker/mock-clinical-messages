const { v4: uuidv4 } = require('uuid');
const nurse = require('../nurse/nurseService');

// Two queues: urgent (processed immediately) and routine (batched)
const urgentQueue = [];
const routineQueue = [];

function enqueue(severity, alertPayload) {
  const item = { ...alertPayload, alertId: uuidv4(), enqueuedAt: new Date().toISOString() };
  if (severity === 'urgent') {
    urgentQueue.push(item);
    console.log(`[Queue] ⚡ URGENT enqueued: ${item.message} (patient=${item.patientId})`);
  } else {
    routineQueue.push(item);
    console.log(`[Queue] 📋 ROUTINE enqueued: ${item.message} (patient=${item.patientId})`);
  }
  return item;
}

function drainUrgent(handler) {
  while (urgentQueue.length > 0) {
    handler(urgentQueue.shift());
  }
}

function drainRoutine(handler) {
  while (routineQueue.length > 0) {
    handler(routineQueue.shift());
  }
}

function _reset() {
  urgentQueue.length = 0;
  routineQueue.length = 0;
}

module.exports = { enqueue, drainUrgent, drainRoutine, _reset };
