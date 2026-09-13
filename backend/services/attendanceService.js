/**
 * Attendance Intelligence Service
 * Core logic for calculating streaks, attendance metrics, and continuous absence detection
 */

function calculateMetricsAndStreak(records = []) {
  // Sort chronologically ascending
  const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  for (const record of sorted) {
    const status = record.status;
    if (status === 'Present') {
      presentCount++;
      currentStreak = 0;
    } else if (status === 'Absent') {
      absentCount++;
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (status === 'Leave') {
      leaveCount++;
      currentStreak = 0; // Authorized leave does not count towards unexcused absent streak
    }
  }

  const totalClasses = sorted.length;
  const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 100;

  return {
    totalClasses,
    presentCount,
    absentCount,
    leaveCount,
    percentage,
    currentStreak,
    longestStreak
  };
}

/**
 * Categorize streak severity
 */
function getStreakSeverity(streak) {
  if (streak >= 5) {
    return { level: 'Critical', label: 'Critical Continuous Absence (5+ Days)', color: 'red' };
  } else if (streak >= 3) {
    return { level: 'Alert', label: 'Continuous Absence Alert (3-4 Days)', color: 'orange' };
  } else if (streak >= 2) {
    return { level: 'Warning', label: 'Consecutive Absence Warning (2 Days)', color: 'yellow' };
  }
  return { level: 'Normal', label: 'Normal', color: 'green' };
}

module.exports = {
  calculateMetricsAndStreak,
  getStreakSeverity
};
