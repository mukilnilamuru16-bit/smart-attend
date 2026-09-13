const { predictFutureAttendance } = require('../services/predictionService');

describe('Feature 8: Attendance Prediction Model', () => {
  test('calculates accurate future attendance based on current trajectory', () => {
    // 70 present out of 100 classes (70%), 20 future classes
    // Expected future: 70% of 20 = 14 present
    // Total: 84 / 120 = 70%
    const result = predictFutureAttendance(70, 100, 20);

    expect(result.currentPercentage).toBe(70);
    expect(result.predictedPercentage).toBe(70);
    expect(result.projectedTotal).toBe(120);
    expect(result.isFeasibleToReach75).toBe(true);
    // Needed to reach 75% of 120 = 90 presents. Currently 70. Needed = 20.
    expect(result.neededPresentsFor75).toBe(20);
  });

  test('correctly identifies when 75% target is mathematically impossible', () => {
    // 30 present out of 100 classes (30%), only 10 future classes
    // Total future = 110. 75% of 110 = 83 presents needed.
    // Max possible presents = 30 + 10 = 40. Far below 83.
    const result = predictFutureAttendance(30, 100, 10);

    expect(result.isFeasibleToReach75).toBe(false);
    expect(result.predictionRisk).toBe('CRITICAL');
  });

  test('handles zero initial classes gracefully', () => {
    const result = predictFutureAttendance(0, 0, 20);
    expect(result.currentPercentage).toBe(100);
    expect(result.isFeasibleToReach75).toBe(true);
  });
});
