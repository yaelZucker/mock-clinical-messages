/**
 * Demo simulation script — runs without starting the HTTP server.
 * Directly exercises all components: API → Broker → Evaluator + DBWriter → Queues → Notifier → Nurse → Escalation
 */
const broker = require('../src/broker/broker');
const { alertEvaluator } = require('../src/evaluator/alertEvaluator');
const { dbWriter } = require('../src/storage/dbWriter');
const { startWorkers, sendNotification } = require('../src/workers/notifierWorker');
const nurse = require('../src/nurse/nurseService');
const db = require('../src/storage/database');
const { v4: uuidv4 } = require('uuid');

// Wire broker (same as index.js)
broker.on('vitals.received', dbWriter);
broker.on('vitals.received', alertEvaluator);

// Start notifier workers
const queues = require('../src/queues/priorityQueues');
queues.drainUrgent(sendNotification);

console.log('=== Clinical Message System — Simulation ===\n');

// Scenario 1: Normal vitals — no alerts
console.log('--- Scenario 1: Normal vitals ---');
broker.publish('vitals.received', {
  idempotencyKey: uuidv4(),
  patientId: 'patient_001',
  clinicId: 'clinic_001',
  vitals: { heartRate: 72, spO2: 98, systolic: 120, temperature: 37.1 },
  receivedAt: new Date().toISOString(),
});

console.log('\n--- Scenario 2: Critical vitals (urgent alert) ---');
broker.publish('vitals.received', {
  idempotencyKey: uuidv4(),
  patientId: 'patient_002',
  clinicId: 'clinic_001',
  vitals: { heartRate: 145, spO2: 87, systolic: 195, temperature: 38.2 },
  receivedAt: new Date().toISOString(),
});

console.log('\n--- Scenario 3: Duplicate message (idempotency check) ---');
const dupKey = uuidv4();
broker.publish('vitals.received', {
  idempotencyKey: dupKey,
  patientId: 'patient_003',
  clinicId: 'clinic_001',
  vitals: { heartRate: 80, spO2: 96, systolic: 115, temperature: 37.5 },
  receivedAt: new Date().toISOString(),
});
broker.publish('vitals.received', {
  idempotencyKey: dupKey, // same key → DB write should be skipped
  patientId: 'patient_003',
  clinicId: 'clinic_001',
  vitals: { heartRate: 80, spO2: 96, systolic: 115, temperature: 37.5 },
  receivedAt: new Date().toISOString(),
});

// Drain urgent queue immediately
queues.drainUrgent(sendNotification);

setTimeout(() => {
  console.log('\n=== Final State ===');
  console.log('\nNurse Worklist:', JSON.stringify(nurse.getWorklist(), null, 2));
  console.log('\nDB Records (clinic_001):', JSON.stringify(db.getRecords('clinic_001'), null, 2));
  console.log('\nBroker Durable Log:', broker.durableLog().length, 'messages');
}, 500);
