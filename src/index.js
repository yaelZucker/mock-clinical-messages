const { createApp } = require('./app');
const { startWorkers } = require('./workers/notifierWorker');

const app = createApp();
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
