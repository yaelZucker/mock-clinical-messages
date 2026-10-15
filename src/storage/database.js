// In-memory clinic-scoped database (fake)
// Keyed by clinicId → array of records
const store = new Map();
const idempotencyKeys = new Set(); // dedup log

function getClinicStore(clinicId) {
  if (!store.has(clinicId)) store.set(clinicId, []);
  return store.get(clinicId);
}

function insertIdempotent(clinicId, record) {
  if (idempotencyKeys.has(record.idempotencyKey)) {
    console.log(`[Database] Duplicate insert skipped for key=${record.idempotencyKey}`);
    return { inserted: false, reason: 'duplicate' };
  }
  idempotencyKeys.add(record.idempotencyKey);
  getClinicStore(clinicId).push({ ...record, storedAt: new Date().toISOString() });
  return { inserted: true };
}

function getRecords(clinicId) {
  return getClinicStore(clinicId);
}

function _reset() {
  store.clear();
  idempotencyKeys.clear();
}

module.exports = { insertIdempotent, getRecords, _reset };
