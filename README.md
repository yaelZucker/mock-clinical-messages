# demo-clinical-messages

A Node.js demo of a clinical patient-alert messaging system, based on the architecture below.

## Architecture

```
Patient App  ──►  API (idempotency key)  ──►  Broker (fan-out, durable)
                                               │              │
                  Clinic Rules ──►  Alert Evaluator    DB Writer (idempotent)
                  (versioned,         │                     │
                   cached)       Priority Queues        Database
                               (urgent / routine)     (clinic-scoped)
                                     │
                  Escalation ──►  Notifier Workers  ──►  Nurse
                  Timer               (push, SMS,        (worklist, alerts)
                  (no ack:             retries)
                   escalate)
```

**Three paths:**
- **Alert path** (fast): vitals → evaluator → queues → notifiers → nurse
- **Storage path**: vitals → DB writer → in-memory DB
- **Entry & support**: API gateway, clinic rules cache, escalation timer

## Getting Started

```bash
npm install

# Run the HTTP server (port 3000)
npm start

# Or run the simulation script (no server needed)
npm run demo
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/messages` | Submit patient vitals. Set `Idempotency-Key` header for safe retries. |
| `GET` | `/api/records/:clinicId` | View stored vitals for a clinic |
| `GET` | `/api/nurse/worklist` | See all alerts on the nurse's worklist |
| `POST` | `/api/nurse/ack/:alertId` | Acknowledge an alert (stops escalation timer) |
| `GET` | `/api/broker/log` | Inspect the durable broker log |

## Example Request

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-001" \
  -d '{
    "patientId": "patient_001",
    "clinicId": "clinic_001",
    "vitals": {
      "heartRate": 145,
      "spO2": 87,
      "systolic": 195,
      "temperature": 38.2
    }
  }'
```

## Components

| File | Role |
|------|------|
| `src/api/server.js` | Express routes — idempotency key, fan-out via broker |
| `src/broker/broker.js` | EventEmitter-based durable broker |
| `src/rules/clinicRules.js` | Versioned, clinic-scoped alert rules (cached) |
| `src/evaluator/alertEvaluator.js` | Applies rules, routes alerts to priority queues |
| `src/queues/priorityQueues.js` | Urgent + routine queues |
| `src/workers/notifierWorker.js` | Push/SMS delivery with retries |
| `src/timer/escalationTimer.js` | Escalates unacknowledged alerts |
| `src/storage/database.js` | In-memory clinic-scoped fake DB |
| `src/storage/dbWriter.js` | Idempotent insert to fake DB |
| `src/nurse/nurseService.js` | Nurse worklist + acknowledgment |
| `demo/simulate.js` | End-to-end simulation (no server needed) |
