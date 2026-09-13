const crypto = require('crypto');
const { db } = require('../config/db');

function generateId() {
  return 'notif-' + crypto.randomUUID();
}

/**
 * Creates in-app alerts for attendance events
 */
async function triggerAttendanceAlerts(student, metrics, streakInfo) {
  const alertsToCreate = [];

  // 1. Continuous Absence Alert
  if (streakInfo.currentStreak >= 3) {
    alertsToCreate.push({
      title: `⚠️ Continuous Absence Alert: ${student.name}`,
      message: `${student.name} (${student.roll_number}) has been absent for ${streakInfo.currentStreak} consecutive days.`,
      type: streakInfo.currentStreak >= 5 ? 'Critical' : 'Alert'
    });
  } else if (streakInfo.currentStreak === 2) {
    alertsToCreate.push({
      title: `⚠️ Consecutive Absence Warning: ${student.name}`,
      message: `${student.name} (${student.roll_number}) has missed 2 consecutive days.`,
      type: 'Warning'
    });
  }

  // 2. Attendance Threshold Alerts
  if (metrics.percentage < 65 && metrics.totalClasses >= 5) {
    alertsToCreate.push({
      title: `🚨 Critical Attendance Shortage: ${student.name}`,
      message: `${student.name}'s attendance is critically low at ${metrics.percentage}%. Below exam eligibility criteria.`,
      type: 'Critical'
    });
  } else if (metrics.percentage < 75 && metrics.totalClasses >= 5) {
    alertsToCreate.push({
      title: `⚠️ Low Attendance Warning: ${student.name}`,
      message: `${student.name}'s attendance has fallen to ${metrics.percentage}%, below the 75% threshold.`,
      type: 'Warning'
    });
  }

  // Insert notification for student's user account and admins
  for (const alert of alertsToCreate) {
    // Alert for student user
    if (student.user_id) {
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [generateId(), student.user_id, alert.title, alert.message, alert.type, student.id]
      );
    }

    // Alert for Admins
    const admins = await db.all(`SELECT id FROM users WHERE role = 'Admin'`);
    for (const admin of admins) {
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [generateId(), admin.id, alert.title, alert.message, alert.type, student.id]
      );
    }
  }

  return alertsToCreate;
}

module.exports = {
  triggerAttendanceAlerts
};
