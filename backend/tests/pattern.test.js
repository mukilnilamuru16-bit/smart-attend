const { analyzeAbsencePatterns } = require('../services/patternService');

describe('Feature 7: Absence Pattern Detection', () => {
  test('detects high Friday absence frequency pattern', () => {
    // 2026-09-04 is a Friday, 2026-09-11 is a Friday, 2026-09-18 is a Friday
    const records = [
      { date: '2026-09-04', status: 'Absent' }, // Fri
      { date: '2026-09-07', status: 'Present' }, // Mon
      { date: '2026-09-11', status: 'Absent' }, // Fri
      { date: '2026-09-15', status: 'Present' }, // Tue
      { date: '2026-09-18', status: 'Absent' }  // Fri
    ];

    const result = analyzeAbsencePatterns(records);

    expect(result.hasPattern).toBe(true);
    expect(result.mostFrequentAbsentDay).toBe('Friday');
    expect(result.maxAbsencesOnDay).toBe(3);
    expect(result.patternDescription).toContain('Friday');
  });

  test('reports no prominent pattern when absences are minimal', () => {
    const records = [
      { date: '2026-09-01', status: 'Present' },
      { date: '2026-09-02', status: 'Present' }
    ];

    const result = analyzeAbsencePatterns(records);
    expect(result.hasPattern).toBe(false);
  });
});
