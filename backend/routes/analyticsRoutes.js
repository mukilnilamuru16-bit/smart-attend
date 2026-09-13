const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');
const { calculateMetricsAndStreak } = require('../services/attendanceService');
const { evaluateRisk } = require('../services/riskService');
const { analyzeAbsencePatterns } = require('../services/patternService');

// Dashboard KPIs and High-level Summary
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. Total Students
    const totalStudentsResult = await db.get(`SELECT COUNT(*) as count FROM students`);
    const totalStudents = totalStudentsResult ? totalStudentsResult.count : 0;

    // 2. Total Teachers
    const totalTeachersResult = await db.get(`SELECT COUNT(*) as count FROM teachers`);
    const totalTeachers = totalTeachersResult ? totalTeachersResult.count : 0;

    // 3. Today's attendance
    const todayAttendance = await db.all(`SELECT status FROM attendance WHERE date = ?`, [today]);
    const presentToday = todayAttendance.filter((r) => r.status === 'Present').length;
    const absentToday = todayAttendance.filter((r) => r.status === 'Absent').length;
    const leaveToday = todayAttendance.filter((r) => r.status === 'Leave').length;

    // 4. Institution-wide attendance rate & Risk counts
    const students = await db.all(`SELECT id FROM students`);
    let safeCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let totalPercentageSum = 0;
    let continuousAbsentCount = 0;

    for (const student of students) {
      const records = await db.all(`SELECT date, status FROM attendance WHERE student_id = ?`, [student.id]);
      const metrics = calculateMetricsAndStreak(records);
      const risk = evaluateRisk(metrics.percentage);

      totalPercentageSum += metrics.percentage;

      if (risk.code === 'safe') safeCount++;
      else if (risk.code === 'warning') warningCount++;
      else if (risk.code === 'critical') criticalCount++;

      if (metrics.currentStreak >= 2) {
        continuousAbsentCount++;
      }
    }

    const averageAttendance = students.length > 0 ? Math.round(totalPercentageSum / students.length) : 0;

    // 5. Recent 7 days trend
    const recentRecords = await db.all(
      `SELECT date, status, COUNT(*) as count 
       FROM attendance 
       GROUP BY date, status 
       ORDER BY date DESC 
       LIMIT 21`
    );

    // Group by date
    const dateMap = {};
    recentRecords.forEach((r) => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { date: r.date, present: 0, absent: 0, leave: 0 };
      }
      if (r.status === 'Present') dateMap[r.date].present = r.count;
      if (r.status === 'Absent') dateMap[r.date].absent = r.count;
      if (r.status === 'Leave') dateMap[r.date].leave = r.count;
    });

    const trend = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        presentToday,
        absentToday,
        leaveToday,
        averageAttendance,
        continuousAbsentCount,
        riskBreakdown: {
          safe: safeCount,
          warning: warningCount,
          critical: criticalCount
        }
      },
      trend
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard analytics.' });
  }
});

// Feature 6: Most Regular Students (Leaderboard 🏆)
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const students = await db.all(
      `SELECT s.id, s.roll_number, s.class_name, s.department, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id`
    );

    const studentList = [];

    for (const student of students) {
      const records = await db.all(`SELECT date, status FROM attendance WHERE student_id = ?`, [student.id]);
      const metrics = calculateMetricsAndStreak(records);
      const risk = evaluateRisk(metrics.percentage);

      studentList.push({
        id: student.id,
        name: student.name,
        rollNumber: student.roll_number,
        department: student.department,
        className: student.class_name,
        percentage: metrics.percentage,
        presentCount: metrics.presentCount,
        totalClasses: metrics.totalClasses,
        currentStreak: metrics.currentStreak,
        riskBadge: risk.badge,
        riskCode: risk.code
      });
    }

    // Sort highest to lowest percentage
    studentList.sort((a, b) => b.percentage - a.percentage || b.presentCount - a.presentCount);

    res.json({
      success: true,
      leaderboard: studentList.slice(0, 10), // Top 10
      allStudents: studentList
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard.' });
  }
});

// Feature 7: Absence Pattern Analysis across institution or specific student
router.get('/pattern', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.query;

    let records;
    if (studentId) {
      records = await db.all(`SELECT date, status FROM attendance WHERE student_id = ?`, [studentId]);
    } else {
      records = await db.all(`SELECT date, status FROM attendance`);
    }

    const pattern = analyzeAbsencePatterns(records);

    res.json({
      success: true,
      pattern
    });
  } catch (error) {
    console.error('Pattern error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching absence pattern.' });
  }
});

// Feature 3: Risk Categorization List
router.get('/risk', verifyToken, async (req, res) => {
  try {
    const students = await db.all(
      `SELECT s.id, s.roll_number, s.class_name, s.department, s.phone, s.parent_phone, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id`
    );

    const safe = [];
    const warning = [];
    const critical = [];

    for (const student of students) {
      const records = await db.all(`SELECT date, status FROM attendance WHERE student_id = ?`, [student.id]);
      const metrics = calculateMetricsAndStreak(records);
      const risk = evaluateRisk(metrics.percentage);

      const item = {
        ...student,
        percentage: metrics.percentage,
        totalClasses: metrics.totalClasses,
        presentCount: metrics.presentCount,
        absentCount: metrics.absentCount,
        currentStreak: metrics.currentStreak,
        riskStatus: risk.status,
        riskBadge: risk.badge,
        recommendation: risk.recommendation
      };

      if (risk.code === 'safe') safe.push(item);
      else if (risk.code === 'warning') warning.push(item);
      else critical.push(item);
    }

    res.json({
      success: true,
      summary: {
        safeCount: safe.length,
        warningCount: warning.length,
        criticalCount: critical.length
      },
      safe,
      warning,
      critical
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching risk analytics.' });
  }
});

module.exports = router;
