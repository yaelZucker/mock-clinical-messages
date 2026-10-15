const queues = require('../src/queues/priorityQueues');

beforeEach(() => queues._reset());

const ALERT = { patientId: 'p1', message: 'Test alert', severity: 'urgent', clinicId: 'clinic_001' };

describe('priorityQueues', () => {
  test('enqueue returns item with generated alertId', () => {
    const item = queues.enqueue('urgent', ALERT);
    expect(item.alertId).toBeDefined();
    expect(item.enqueuedAt).toBeDefined();
  });

  test('drainUrgent calls handler for every urgent item', () => {
    queues.enqueue('urgent', ALERT);
    queues.enqueue('urgent', ALERT);
    const handler = jest.fn();
    queues.drainUrgent(handler);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test('drainRoutine does not touch urgent queue', () => {
    queues.enqueue('urgent', ALERT);
    const handler = jest.fn();
    queues.drainRoutine(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  test('queues are empty after drain', () => {
    queues.enqueue('urgent', ALERT);
    queues.drainUrgent(jest.fn());
    const handler = jest.fn();
    queues.drainUrgent(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  test('routine items go to routine queue', () => {
    queues.enqueue('routine', { ...ALERT, severity: 'routine' });
    const handler = jest.fn();
    queues.drainRoutine(handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
