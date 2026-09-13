/**
 * Attendance Prediction Service
 * Calculates future attendance projections, target feasibility, and required attendances
 */

function predictFutureAttendance(presentCount, totalClasses, futureClasses = 20, recentRecords = []) {
  if (totalClasses === 0) {
    return {
      currentPercentage: 100,
      predictedPercentage: 100,
      futureClasses,
      maxPossiblePercentage: 100,
      requiredClassesFor75: 0,
      isFeasibleToReach75: true,
      predictionRisk: 'LOW',
      statusText: 'New semester, not enough data yet.'
    };
  }

  const currentRate = presentCount / totalClasses;
  const currentPercentage = Math.round(currentRate * 100);

  // Weight recent trend if available
  let trendRate = currentRate;
  if (recentRecords.length >= 5) {
    const recentPresent = recentRecords.filter((r) => r.status === 'Present').length;
    trendRate = recentPresent / recentRecords.length;
  }

  // Projected attendance based on current trend
  const projectedFuturePresents = Math.round(trendRate * futureClasses);
  const projectedTotal = totalClasses + futureClasses;
  const projectedPresentTotal = presentCount + projectedFuturePresents;
  const predictedPercentage = Math.round((projectedPresentTotal / projectedTotal) * 100);

  // Maximum possible attendance if student attends 100% of remaining classes
  const maxPossiblePresents = presentCount + futureClasses;
  const maxPossiblePercentage = Math.round((maxPossiblePresents / projectedTotal) * 100);

  // Minimum required attendances in future to secure >= 75%
  // (presentCount + x) / projectedTotal >= 0.75 => x >= 0.75 * projectedTotal - presentCount
  const target75Presents = Math.ceil(0.75 * projectedTotal);
  const neededPresents = Math.max(0, target75Presents - presentCount);

  const isFeasibleToReach75 = neededPresents <= futureClasses;

  let predictionRisk = 'SAFE';
  let statusText = 'Projected to maintain safe attendance threshold.';

  if (predictedPercentage < 65) {
    predictionRisk = 'CRITICAL';
    statusText = 'High certainty of severe attendance shortage (< 65%). Immediate intervention needed.';
  } else if (predictedPercentage < 75) {
    predictionRisk = 'HIGH RISK';
    statusText = `Projected to fall below mandatory 75% (${predictedPercentage}%). Student must attend at least ${neededPresents} out of the next ${futureClasses} classes.`;
  } else if (currentPercentage < 75 && isFeasibleToReach75) {
    predictionRisk = 'RECOVERABLE';
    statusText = `Currently below 75%, but can recover to ${maxPossiblePercentage}% if attending at least ${neededPresents} of the next ${futureClasses} classes.`;
  }

  return {
    currentPercentage,
    predictedPercentage,
    futureClasses,
    projectedTotal,
    maxPossiblePercentage,
    neededPresentsFor75: neededPresents,
    isFeasibleToReach75,
    predictionRisk,
    statusText
  };
}

module.exports = {
  predictFutureAttendance
};
