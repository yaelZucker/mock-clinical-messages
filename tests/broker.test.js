const broker = require('../src/broker/broker');

beforeEach(() => {
  broker._durable.length = 0;
  broker.removeAllListeners();
});

describe('Broker', () => {
  test('publish stores message in durable log', () => {
    broker.publish('vitals.received', { idempotencyKey: 'k1' });
    expect(broker.durableLog()).toHaveLength(1);
    expect(broker.durableLog()[0].id).toBe('k1');
  });

  test('publish emits event to subscriber', () => {
    const handler = jest.fn();
    broker.on('vitals.received', handler);
    broker.publish('vitals.received', { idempotencyKey: 'k2' });
    expect(handler).toHaveBeenCalledWith({ idempotencyKey: 'k2' });
  });

  test('fan-out: multiple subscribers all receive the event', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    broker.on('vitals.received', h1);
    broker.on('vitals.received', h2);
    broker.publish('vitals.received', { idempotencyKey: 'k3' });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  test('durableLog grows with each publish', () => {
    broker.publish('vitals.received', { idempotencyKey: 'k4' });
    broker.publish('vitals.received', { idempotencyKey: 'k5' });
    expect(broker.durableLog()).toHaveLength(2);
  });
});
