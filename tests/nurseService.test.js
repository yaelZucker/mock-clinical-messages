const nurse = require('../src/nurse/nurseService');

beforeEach(() => nurse._reset());

const ALERT = { alertId: 'a1', patientId: 'p1', severity: 'urgent', message: 'Heart rate high' };

describe('nurseService', () => {
  test('addAlert appears on worklist', () => {
    nurse.addAlert(ALERT);
    expect(nurse.getWorklist()).toHaveLength(1);
    expect(nurse.getWorklist()[0].acknowledged).toBe(false);
  });

  test('acknowledge marks alert as done', () => {
    nurse.addAlert(ALERT);
    const result = nurse.acknowledge('a1');
    expect(result.ok).toBe(true);
    expect(nurse.getWorklist()[0].acknowledged).toBe(true);
    expect(nurse.getWorklist()[0].acknowledgedAt).toBeDefined();
  });

  test('getPendingAlerts excludes acknowledged ones', () => {
    nurse.addAlert(ALERT);
    nurse.addAlert({ ...ALERT, alertId: 'a2' });
    nurse.acknowledge('a1');
    expect(nurse.getPendingAlerts()).toHaveLength(1);
    expect(nurse.getPendingAlerts()[0].alertId).toBe('a2');
  });

  test('acknowledge unknown alertId returns error', () => {
    const result = nurse.acknowledge('does-not-exist');
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
