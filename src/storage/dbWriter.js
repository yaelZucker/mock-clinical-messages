const db = require('./database');

// Idempotent DB writer — receives raw vitals from broker and stores them
function dbWriter(payload) {
  const result = db.insertIdempotent(payload.clinicId, {
    idempotencyKey: payload.idempotencyKey,
    patientId: payload.patientId,
    clinicId: payload.clinicId,
    vitals: payload.vitals,
    receivedAt: payload.receivedAt,
  });

  if (result.inserted) {
    console.log(`[DBWriter] Stored vitals for patient=${payload.patientId} clinic=${payload.clinicId}`);
  }
}

module.exports = { dbWriter };
