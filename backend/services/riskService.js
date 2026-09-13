/**
 * Attendance Risk Analysis Service
 * Evaluates student attendance percentage against institutional thresholds:
 * 🟢 SAFE: >= 75%
 * 🟡 WARNING: 65% - 74%
 * 🔴 CRITICAL: < 65%
 */

function evaluateRisk(percentage) {
  const rounded = Math.round(percentage);

  if (rounded >= 75) {
    return {
      status: 'SAFE',
      badge: '🟢 Safe',
      color: 'emerald',
      code: 'safe',
      recommendation: 'Attendance is satisfactory. Keep maintaining regular presence.'
    };
  } else if (rounded >= 65) {
    return {
      status: 'WARNING',
      badge: '🟡 Warning',
      color: 'amber',
      code: 'warning',
      recommendation: 'Attendance has fallen below 75%. Student is at risk of exam shortage.'
    };
  } else {
    return {
      status: 'CRITICAL',
      badge: '🔴 Critical',
      color: 'rose',
      code: 'critical',
      recommendation: 'Attendance is critically low (< 65%). Immediate guardian contact and remedial intervention required.'
    };
  }
}

module.exports = {
  evaluateRisk
};
