/**
 * Absence Pattern Analysis Service
 * Detects behavioral absence trends:
 * - Day-of-week frequency (Mondays, Fridays, etc.)
 * - Recurring pattern synthesis
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function analyzeAbsencePatterns(records = []) {
  const dayCounts = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  };

  const absences = records.filter((r) => r.status === 'Absent');

  absences.forEach((record) => {
    // Note: ensure date string parsing handles YYYY-MM-DD cleanly without timezone offset drift
    const parts = record.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const dayName = DAYS[d.getDay()];
      if (dayCounts[dayName] !== undefined) {
        dayCounts[dayName]++;
      }
    }
  });

  // Find most frequent absent day
  let maxDay = null;
  let maxCount = 0;

  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = day;
    }
  });

  let patternDescription = 'No prominent absence pattern detected.';
  let hasPattern = false;

  if (maxCount >= 2) {
    hasPattern = true;
    if (maxDay === 'Friday' || maxDay === 'Monday') {
      patternDescription = `Frequently absent on ${maxDay}s (${maxCount} times). Indicates weekend extension tendency.`;
    } else {
      patternDescription = `Frequently absent on ${maxDay}s (${maxCount} times).`;
    }
  } else if (absences.length > 0) {
    patternDescription = `Sporadic absences across the week (${absences.length} total).`;
  }

  return {
    dayDistribution: dayCounts,
    mostFrequentAbsentDay: maxDay,
    maxAbsencesOnDay: maxCount,
    totalAbsences: absences.length,
    hasPattern,
    patternDescription
  };
}

module.exports = {
  analyzeAbsencePatterns
};
