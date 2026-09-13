const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { calculateMetricsAndStreak } = require('../services/attendanceService');
const { predictFutureAttendance } = require('../services/predictionService');

router.get('/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const futureClasses = parseInt(req.query.futureClasses || '20', 10);

    const student = await db.get(
      `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [studentId]
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const records = await db.all(
      `SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC`,
      [studentId]
    );

    const metrics = calculateMetricsAndStreak(records);
    const recentRecords = records.slice(0, 10); // Last 10 records for weighted velocity

    const prediction = predictFutureAttendance(
      metrics.presentCount,
      metrics.totalClasses,
      futureClasses,
      recentRecords
    );

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        department: student.department,
        className: student.class_name
      },
      currentMetrics: metrics,
      prediction
    });
  } catch (error) {
    console.error('Prediction route error:', error);
    res.status(500).json({ success: false, message: 'Server error computing prediction.' });
  }
});

module.exports = router;
