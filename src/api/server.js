const express = require('express');
const { v4: uuidv4 } = require('uuid');
const broker = require('../broker/broker');

const router = express.Router();

// POST /api/messages — accepts patient vitals from the patient app
// Idempotency-Key header prevents duplicate processing on retries
router.post('/messages', (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'] || uuidv4();
  const { patientId, clinicId, vitals } = req.body;

  if (!patientId || !clinicId || !vitals) {
    return res.status(400).json({ error: 'patientId, clinicId, and vitals are required' });
  }

  const payload = {
    idempotencyKey,
    patientId,
    clinicId,
    vitals,
    receivedAt: new Date().toISOString(),
  };

  console.log(`[API] Received vitals from patient=${patientId} clinic=${clinicId} key=${idempotencyKey}`);
  broker.publish('vitals.received', payload);

  res.status(202).json({ accepted: true, idempotencyKey });
});

// GET /api/records/:clinicId — view stored records (DB path)
router.get('/records/:clinicId', (req, res) => {
  const db = require('../storage/database');
  res.json(db.getRecords(req.params.clinicId));
});

// GET /api/nurse/worklist — nurse sees all alerts
router.get('/nurse/worklist', (req, res) => {
  const nurse = require('../nurse/nurseService');
  res.json(nurse.getWorklist());
});

// POST /api/nurse/ack/:alertId — nurse acknowledges an alert
router.post('/nurse/ack/:alertId', (req, res) => {
  const nurse = require('../nurse/nurseService');
  const escalation = require('../timer/escalationTimer');
  const result = nurse.acknowledge(req.params.alertId);
  if (result.ok) escalation.cancel(req.params.alertId);
  res.json(result);
});

// GET /api/broker/log — inspect broker durable log
router.get('/broker/log', (req, res) => {
  res.json(broker.durableLog());
});

module.exports = router;
