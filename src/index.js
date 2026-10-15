const express = require('express');
const broker = require('./broker/broker');
const { alertEvaluator } = require('./evaluator/alertEvaluator');
const { dbWriter } = require('./storage/dbWriter');
const { startWorkers } = require('./workers/notifierWorker');
const routes = require('./api/server');

const app = express();
app.use(express.json());
app.use('/api', routes);

// Wire broker fan-out:
// 1. Storage path: raw vitals → DB writer
broker.on('vitals.received', dbWriter);
// 2. Alert path: vitals → alert evaluator → priority queues → notifier workers
broker.on('vitals.received', alertEvaluator);

// Kick off notifier workers (urgent immediately, routine on interval)
startWorkers();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  Clinical Message System — demo running  ║`);
  console.log(`║  http://localhost:${PORT}                   ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  console.log('Endpoints:');
  console.log('  POST /api/messages           — submit patient vitals');
  console.log('  GET  /api/records/:clinicId  — view stored records');
  console.log('  GET  /api/nurse/worklist     — nurse alert worklist');
  console.log('  POST /api/nurse/ack/:alertId — acknowledge alert');
  console.log('  GET  /api/broker/log         — durable broker log\n');
});
