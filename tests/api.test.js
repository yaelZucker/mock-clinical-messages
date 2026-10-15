jest.mock('../src/broker/broker', () => ({
  on: jest.fn(),
  publish: jest.fn(),
  durableLog: jest.fn(() => []),
}));

const request = require('supertest');
const express = require('express');
const routes = require('../src/api/server');
const broker = require('../src/broker/broker');
const db = require('../src/storage/database');
const nurse = require('../src/nurse/nurseService');

const app = express();
app.use(express.json());
app.use('/api', routes);

beforeEach(() => {
  jest.clearAllMocks();
  db._reset();
  nurse._reset();
});

describe('POST /api/messages', () => {
  const BODY = { patientId: 'p1', clinicId: 'clinic_001', vitals: { heartRate: 72 } };

  test('returns 202 and publishes to broker', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Idempotency-Key', 'key-001')
      .send(BODY);
    expect(res.status).toBe(202);
    expect(res.body.idempotencyKey).toBe('key-001');
    expect(broker.publish).toHaveBeenCalledWith('vitals.received', expect.objectContaining({
      patientId: 'p1',
      idempotencyKey: 'key-001',
    }));
  });

  test('generates idempotency key when header is absent', async () => {
    const res = await request(app).post('/api/messages').send(BODY);
    expect(res.status).toBe(202);
    expect(res.body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/); // UUID
  });

  test('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/messages').send({ patientId: 'p1' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/records/:clinicId', () => {
  test('returns stored records for a clinic', async () => {
    db.insertIdempotent('clinic_001', { idempotencyKey: 'k1', patientId: 'p1' });
    const res = await request(app).get('/api/records/clinic_001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('returns empty array for unknown clinic', async () => {
    const res = await request(app).get('/api/records/clinic_999');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/nurse/worklist', () => {
  test('returns all alerts on the worklist', async () => {
    nurse.addAlert({ alertId: 'a1', patientId: 'p1', severity: 'urgent', message: 'Test' });
    const res = await request(app).get('/api/nurse/worklist');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/nurse/ack/:alertId', () => {
  test('acknowledges an existing alert', async () => {
    nurse.addAlert({ alertId: 'a1', patientId: 'p1', severity: 'urgent', message: 'Test' });
    const res = await request(app).post('/api/nurse/ack/a1');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('returns error for unknown alertId', async () => {
    const res = await request(app).post('/api/nurse/ack/unknown');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(false);
  });
});
