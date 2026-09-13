const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { calculateMetricsAndStreak, getStreakSeverity } = require('../services/attendanceService');
const { evaluateRisk } = require('../services/riskService');
const { triggerAttendanceAlerts } = require('../services/alertService');

function generateId() {
  return 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

// Mark batch attendance
router.post('/', verifyToken, requireRole('Admin', 'Teacher'), async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;

    if (!subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'subjectId, date, and records array are required.' });
    }

    const processedAlerts = [];

    for (const record of records) {
      const { studentId, status, remarks = '' } = record;
      if (!studentId || !['Present', 'Absent', 'Leave'].includes(status)) {
        continue;
      }

      // Check existing attendance for this student, subject, and date
      const existing = await db.get(
        `SELECT id FROM attendance WHERE student_id = ? AND subject_id = ? AND date = ?`,
        [studentId, subjectId, date]
      );

      if (existing) {
        await db.run(
          `UPDATE attendance SET status = ?, remarks = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [status, remarks, existing.id]
        );
      } else {
        await db.run(
          `INSERT INTO attendance (id, student_id, subject_id, date, status, remarks) VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId(), studentId, subjectId, date, status, remarks]
        );
      }

      // Fetch student details
      const student = await db.get(
        `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
        [studentId]
      );

      if (student) {
        // Fetch all student records to compute updated metrics and streaks
        const allStudentRecords = await db.all(
          `SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date ASC`,
          [studentId]
        );

        const metrics = calculateMetricsAndStreak(allStudentRecords);
        const streakInfo = { currentStreak: metrics.currentStreak, longestStreak: metrics.longestStreak };
        
        // Trigger alerts if continuous absence or low threshold detected
        const alerts = await triggerAttendanceAlerts(student, metrics, streakInfo);
        if (alerts.length > 0) {
          processedAlerts.push({ studentName: student.name, alerts });
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully recorded attendance for ${records.length} students.`,
      alertsGenerated: processedAlerts
    });
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error saving attendance.' });
  }
});

// Get attendance for a class on a specific date and subject
router.get('/class', verifyToken, async (req, res) => {
  try {
    const { className, subjectId, date } = req.query;

    if (!className || !date) {
      return res.status(400).json({ success: false, message: 'className and date are required.' });
    }

    // Get all students in the class
    const students = await db.all(
      `SELECT s.id, s.roll_number, s.class_name, s.department, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.class_name = ?
       ORDER BY s.roll_number ASC`,
      [className]
    );

    // Get attendance records for this date & subject
    const attendanceRecords = await db.all(
      `SELECT student_id, status, remarks FROM attendance WHERE date = ? ${subjectId ? 'AND subject_id = ?' : ''}`,
      subjectId ? [date, subjectId] : [date]
    );

    const recordMap = new Map();
    attendanceRecords.forEach((r) => recordMap.set(r.student_id, r));

    const result = students.map((s) => {
      const rec = recordMap.get(s.id);
      return {
        ...s,
        status: rec ? rec.status : 'Present', // default to Present for convenience
        recorded: Boolean(rec),
        remarks: rec ? rec.remarks : ''
      };
    });

    res.json({ success: true, date, className, students: result });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching class attendance.' });
  }
});

// Continuous Absent Students List (Feature 2)
router.get('/continuous-absent', verifyToken, async (req, res) => {
  try {
    const minStreak = parseInt(req.query.minStreak || '2', 10);

    const students = await db.all(
      `SELECT s.id, s.roll_number, s.department, s.class_name, s.phone, s.parent_phone, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id`
    );

    const continuousAbsentList = [];

    for (const student of students) {
      const records = await db.all(
        `SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date ASC`,
        [student.id]
      );

      const metrics = calculateMetricsAndStreak(records);
      if (metrics.currentStreak >= minStreak) {
        const severity = getStreakSeverity(metrics.currentStreak);
        const risk = evaluateRisk(metrics.percentage);

        continuousAbsentList.push({
          ...student,
          currentStreak: metrics.currentStreak,
          longestStreak: metrics.longestStreak,
          percentage: metrics.percentage,
          severity,
          riskStatus: risk.status,
          riskBadge: risk.badge
        });
      }
    }

    // Sort by current streak descending
    continuousAbsentList.sort((a, b) => b.currentStreak - a.currentStreak);

    res.json({
      success: true,
      count: continuousAbsentList.length,
      students: continuousAbsentList
    });
  } catch (error) {
    console.error('Continuous absent error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching continuous absent list.' });
  }
});

// Get individual student attendance history
router.get('/student/:id', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await db.get(
      `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const records = await db.all(
      `SELECT a.id, a.date, a.status, a.remarks, sub.subject_name, sub.subject_code
       FROM attendance a
       LEFT JOIN subjects sub ON a.subject_id = sub.id
       WHERE a.student_id = ?
       ORDER BY a.date DESC`,
      [studentId]
    );

    const metrics = calculateMetricsAndStreak(records);
    const risk = evaluateRisk(metrics.percentage);

    res.json({
      success: true,
      student,
      metrics,
      risk,
      history: records
    });
  } catch (error) {
    console.error('Student attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student attendance history.' });
  }
});

module.exports = router;
