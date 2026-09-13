const { calculateMetricsAndStreak, getStreakSeverity } = require('../services/attendanceService');

describe('Feature 1 & 2: Attendance Metrics & Continuous Absence Streak Engine', () => {
  test('increments absent streak on consecutive absences and resets on presence', () => {
    const records = [
      { date: '2026-09-01', status: 'Present' },
      { date: '2026-09-02', status: 'Absent' },
      { date: '2026-09-03', status: 'Absent' },
      { date: '2026-09-04', status: 'Absent' },
      { date: '2026-09-05', status: 'Absent' }
    ];

    const metrics = calculateMetricsAndStreak(records);

    expect(metrics.totalClasses).toBe(5);
    expect(metrics.presentCount).toBe(1);
    expect(metrics.absentCount).toBe(4);
    expect(metrics.currentStreak).toBe(4);
    expect(metrics.longestStreak).toBe(4);
    expect(metrics.percentage).toBe(20);
  });

  test('resets current streak to 0 when student attends class', () => {
    const records = [
      { date: '2026-09-01', status: 'Absent' },
      { date: '2026-09-02', status: 'Absent' },
      { date: '2026-09-03', status: 'Absent' },
      { date: '2026-09-04', status: 'Present' }
    ];

    const metrics = calculateMetricsAndStreak(records);

    expect(metrics.currentStreak).toBe(0);
    expect(metrics.longestStreak).toBe(3);
    expect(metrics.presentCount).toBe(1);
  });

  test('handles authorized Leave without counting towards unexcused absent streak', () => {
    const records = [
      { date: '2026-09-01', status: 'Absent' },
      { date: '2026-09-02', status: 'Leave' }
    ];

    const metrics = calculateMetricsAndStreak(records);
    expect(metrics.currentStreak).toBe(0);
    expect(metrics.leaveCount).toBe(1);
  });

  test('assigns correct streak severity labels', () => {
    expect(getStreakSeverity(1).level).toBe('Normal');
    expect(getStreakSeverity(2).level).toBe('Warning');
    expect(getStreakSeverity(3).level).toBe('Alert');
    expect(getStreakSeverity(5).level).toBe('Critical');
  });
});
