const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateMetricsAndStreak, getStreakSeverity } = require('../services/attendanceService');
const { evaluateRisk } = require('../services/riskService');
const { predictFutureAttendance } = require('../services/predictionService');
const { analyzeAbsencePatterns } = require('../services/patternService');

test('Feature 1 & 2: Continuous Absence Streak Engine', async (t) => {
  await t.test('increments absent streak on consecutive absences', () => {
    const records = [
      { date: '2026-09-01', status: 'Present' },
      { date: '2026-09-02', status: 'Absent' },
      { date: '2026-09-03', status: 'Absent' },
      { date: '2026-09-04', status: 'Absent' },
      { date: '2026-09-05', status: 'Absent' }
    ];

    const metrics = calculateMetricsAndStreak(records);
    assert.equal(metrics.totalClasses, 5);
    assert.equal(metrics.presentCount, 1);
    assert.equal(metrics.absentCount, 4);
    assert.equal(metrics.currentStreak, 4);
    assert.equal(metrics.longestStreak, 4);
    assert.equal(metrics.percentage, 20);
  });

  await t.test('resets current streak to 0 on presence', () => {
    const records = [
      { date: '2026-09-01', status: 'Absent' },
      { date: '2026-09-02', status: 'Absent' },
      { date: '2026-09-03', status: 'Present' }
    ];

    const metrics = calculateMetricsAndStreak(records);
    assert.equal(metrics.currentStreak, 0);
    assert.equal(metrics.longestStreak, 2);
    assert.equal(metrics.presentCount, 1);
  });

  await t.test('properly assigns streak severity thresholds (2, 3, 5+ days)', () => {
    assert.equal(getStreakSeverity(1).level, 'Normal');
    assert.equal(getStreakSeverity(2).level, 'Warning');
    assert.equal(getStreakSeverity(3).level, 'Alert');
    assert.equal(getStreakSeverity(5).level, 'Critical');
  });
});

test('Feature 3: Attendance Risk Categorization System', async (t) => {
  await t.test('categorizes >= 75% as SAFE', () => {
    assert.equal(evaluateRisk(85).code, 'safe');
    assert.equal(evaluateRisk(75).code, 'safe');
  });

  await t.test('categorizes 65% - 74% as WARNING', () => {
    assert.equal(evaluateRisk(70).code, 'warning');
    assert.equal(evaluateRisk(65).code, 'warning');
  });

  await t.test('categorizes < 65% as CRITICAL', () => {
    assert.equal(evaluateRisk(55).code, 'critical');
    assert.equal(evaluateRisk(64).code, 'critical');
  });
});

test('Feature 8: Attendance Prediction Model', async (t) => {
  await t.test('projects future attendance and needed classes for 75%', () => {
    const result = predictFutureAttendance(70, 100, 20);
    assert.equal(result.currentPercentage, 70);
    assert.equal(result.predictedPercentage, 70);
    assert.equal(result.projectedTotal, 120);
    assert.equal(result.isFeasibleToReach75, true);
    assert.equal(result.neededPresentsFor75, 20);
  });

  await t.test('flags critical shortage when 75% target is impossible', () => {
    const result = predictFutureAttendance(30, 100, 10);
    assert.equal(result.isFeasibleToReach75, false);
    assert.equal(result.predictionRisk, 'CRITICAL');
  });
});

test('Feature 7: Absence Pattern Detection', async (t) => {
  await t.test('identifies Friday recurring absenteeism', () => {
    const records = [
      { date: '2026-09-04', status: 'Absent' }, // Fri
      { date: '2026-09-07', status: 'Present' },
      { date: '2026-09-11', status: 'Absent' }, // Fri
      { date: '2026-09-15', status: 'Present' },
      { date: '2026-09-18', status: 'Absent' }  // Fri
    ];

    const result = analyzeAbsencePatterns(records);
    assert.equal(result.hasPattern, true);
    assert.equal(result.mostFrequentAbsentDay, 'Friday');
    assert.equal(result.maxAbsencesOnDay, 3);
  });
});
