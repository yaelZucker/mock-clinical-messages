jest.mock('../src/queues/priorityQueues', () => ({
  enqueue: jest.fn(),
}));

const queues = require('../src/queues/priorityQueues');
const { alertEvaluator } = require('../src/evaluator/alertEvaluator');

const BASE = {
  idempotencyKey: 'k1',
  patientId: 'p1',
  clinicId: 'clinic_001',
};

beforeEach(() => jest.clearAllMocks());

describe('alertEvaluator', () => {
  test('no alerts for normal vitals', () => {
    alertEvaluator({ ...BASE, vitals: { heartRate: 72, spO2: 98, systolic: 120, temperature: 37.0 } });
    expect(queues.enqueue).not.toHaveBeenCalled();
  });

  test('urgent alert when heart rate > 120', () => {
    alertEvaluator({ ...BASE, vitals: { heartRate: 145 } });
    expect(queues.enqueue).toHaveBeenCalledWith('urgent', expect.objectContaining({
      metric: 'heartRate',
      severity: 'urgent',
    }));
  });

  test('urgent alert when spO2 < 90', () => {
    alertEvaluator({ ...BASE, vitals: { spO2: 85 } });
    expect(queues.enqueue).toHaveBeenCalledWith('urgent', expect.objectContaining({
      metric: 'spO2',
      severity: 'urgent',
    }));
  });

  test('routine alert when heart rate > 100 but <= 120', () => {
    alertEvaluator({ ...BASE, vitals: { heartRate: 105 } });
    expect(queues.enqueue).toHaveBeenCalledWith('routine', expect.objectContaining({
      metric: 'heartRate',
      severity: 'routine',
    }));
  });

  test('multiple rules can fire in one evaluation', () => {
    // heartRate 145: triggers r1 (urgent >120) and r6 (routine >100)
    // spO2 85:       triggers r3 (urgent <90)
    alertEvaluator({ ...BASE, vitals: { heartRate: 145, spO2: 85 } });
    expect(queues.enqueue).toHaveBeenCalledTimes(3);
  });

  test('unknown clinic produces no alerts', () => {
    alertEvaluator({ ...BASE, clinicId: 'clinic_999', vitals: { heartRate: 200 } });
    expect(queues.enqueue).not.toHaveBeenCalled();
  });
});
