const { evaluateRisk } = require('../services/riskService');

describe('Feature 3: Attendance Risk Categorization System', () => {
  test('categorizes >= 75% as SAFE', () => {
    const res85 = evaluateRisk(85);
    expect(res85.code).toBe('safe');
    expect(res85.status).toBe('SAFE');

    const res75 = evaluateRisk(75);
    expect(res75.code).toBe('safe');
    expect(res75.status).toBe('SAFE');
  });

  test('categorizes 65% to 74% as WARNING', () => {
    const res70 = evaluateRisk(70);
    expect(res70.code).toBe('warning');
    expect(res70.status).toBe('WARNING');

    const res65 = evaluateRisk(65);
    expect(res65.code).toBe('warning');
    expect(res65.status).toBe('WARNING');
  });

  test('categorizes < 65% as CRITICAL', () => {
    const res55 = evaluateRisk(55);
    expect(res55.code).toBe('critical');
    expect(res55.status).toBe('CRITICAL');

    const res64 = evaluateRisk(64);
    expect(res64.code).toBe('critical');
    expect(res64.status).toBe('CRITICAL');
  });
});
