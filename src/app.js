const express = require('express');
const broker = require('./broker/broker');
const { alertEvaluator } = require('./evaluator/alertEvaluator');
const { dbWriter } = require('./storage/dbWriter');
const routes = require('./api/server');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  broker.on('vitals.received', dbWriter);
  broker.on('vitals.received', alertEvaluator);
  return app;
}

module.exports = { createApp };
