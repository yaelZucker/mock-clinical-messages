const db = require('../src/storage/database');

beforeEach(() => db._reset());

describe('database', () => {
  test('inserts a record successfully', () => {
    const result = db.insertIdempotent('clinic_001', { idempotencyKey: 'k1', patientId: 'p1' });
    expect(result.inserted).toBe(true);
    expect(db.getRecords('clinic_001')).toHaveLength(1);
  });

  test('rejects duplicate idempotency key', () => {
    db.insertIdempotent('clinic_001', { idempotencyKey: 'k1', patientId: 'p1' });
    const result = db.insertIdempotent('clinic_001', { idempotencyKey: 'k1', patientId: 'p1' });
    expect(result.inserted).toBe(false);
    expect(result.reason).toBe('duplicate');
    expect(db.getRecords('clinic_001')).toHaveLength(1);
  });

  test('records are scoped per clinic', () => {
    db.insertIdempotent('clinic_001', { idempotencyKey: 'k1' });
    db.insertIdempotent('clinic_002', { idempotencyKey: 'k2' });
    expect(db.getRecords('clinic_001')).toHaveLength(1);
    expect(db.getRecords('clinic_002')).toHaveLength(1);
  });

  test('unknown clinic returns empty list', () => {
    expect(db.getRecords('clinic_999')).toEqual([]);
  });
});
