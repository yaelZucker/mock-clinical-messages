const EventEmitter = require('events');

// Simulates a durable fan-out message broker (Kafka/RabbitMQ style)
class Broker extends EventEmitter {
  constructor() {
    super();
    this._durable = []; // in-memory durable log
  }

  publish(topic, payload) {
    const envelope = {
      id: payload.idempotencyKey,
      topic,
      payload,
      publishedAt: new Date().toISOString(),
    };
    this._durable.push(envelope);
    console.log(`[Broker] → topic="${topic}" id=${envelope.id}`);
    this.emit(topic, payload);
  }

  durableLog() {
    return this._durable;
  }
}

module.exports = new Broker();
