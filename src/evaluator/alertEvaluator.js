const { getRulesForClinic } = require('../rules/clinicRules');
const queues = require('../queues/priorityQueues');

function evaluate(operator, value, threshold) {
  switch (operator) {
    case '>': return value > threshold;
    case '<': return value < threshold;
    case '>=': return value >= threshold;
    case '<=': return value <= threshold;
    case '=': return value === threshold;
    default: return false;
  }
}

function alertEvaluator(payload) {
  const { version, rules } = getRulesForClinic(payload.clinicId);
  console.log(`[Evaluator] Checking ${rules.length} rules (v${version}) for patient=${payload.patientId}`);

  for (const rule of rules) {
    const metricValue = payload.vitals[rule.metric];
    if (metricValue === undefined) continue;

    if (evaluate(rule.operator, metricValue, rule.threshold)) {
      console.log(`[Evaluator] Rule "${rule.id}" triggered: ${rule.metric}=${metricValue} ${rule.operator} ${rule.threshold}`);
      queues.enqueue(rule.severity, {
        ruleId: rule.id,
        patientId: payload.patientId,
        clinicId: payload.clinicId,
        message: rule.message,
        severity: rule.severity,
        metric: rule.metric,
        value: metricValue,
        threshold: rule.threshold,
        idempotencyKey: payload.idempotencyKey,
      });
    }
  }
}

module.exports = { alertEvaluator };
