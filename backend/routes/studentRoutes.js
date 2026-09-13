const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { calculateMetricsAndStreak, getStreakSeverity } = require('../services/attendanceService');
const { evaluateRisk } = require('../services/riskService');
const { analyzeAbsencePatterns } = require('../services/patternService');
const { predictFutureAttendance } = require('../services/predictionService');

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

// List all students with metrics summary
router.get('/', verifyToken, async (req, res) => {
  try {
    const { department, className, search } = req.query;

    let query = `
      SELECT s.id, s.roll_number, s.department, s.class_name, s.semester, s.phone, s.parent_phone,
             u.id as user_id, u.name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      query += ` AND s.department = ?`;
      params.push(department);
    }
    if (className) {
      query += ` AND s.class_name = ?`;
      params.push(className);
    }
    if (search) {
      query += ` AND (u.name LIKE ? OR s.roll_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY s.roll_number ASC`;

    const students = await db.all(query, params);

    const enriched = [];
    for (const student of students) {
      const records = await db.all(
        `SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date ASC`,
        [student.id]
      );
      const metrics = calculateMetricsAndStreak(records);
      const risk = evaluateRisk(metrics.percentage);
      const severity = getStreakSeverity(metrics.currentStreak);

      enriched.push({
        ...student,
        metrics,
        risk,
        streakSeverity: severity
      });
    }

    res.json({ success: true, count: enriched.length, students: enriched });
  } catch (error) {
    console.error('List students error:', error);
    res.status(500).json({ success: false, message: 'Server error listing students.' });
  }
});

// Feature 10: Smart Student Profile (360 Degree Dossier)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db.get(
      `SELECT s.*, u.name, u.email, u.avatar_url
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
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
      [id]
    );

    // Metrics & Streak
    const metrics = calculateMetricsAndStreak(records);
    const risk = evaluateRisk(metrics.percentage);
    const streakSeverity = getStreakSeverity(metrics.currentStreak);

    // Pattern Analysis
    const pattern = analyzeAbsencePatterns(records);

    // Future Prediction (Next 20 classes)
    const prediction = predictFutureAttendance(
      metrics.presentCount,
      metrics.totalClasses,
      20,
      records.slice(0, 10)
    );

    // Recent leave requests
    const leaves = await db.all(
      `SELECT * FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    res.json({
      success: true,
      profile: {
        personal: {
          id: student.id,
          userId: student.user_id,
          name: student.name,
          email: student.email,
          rollNumber: student.roll_number,
          department: student.department,
          className: student.class_name,
          semester: student.semester,
          phone: student.phone,
          parentPhone: student.parent_phone,
          avatarUrl: student.avatar_url
        },
        metrics,
        risk,
        streakSeverity,
        pattern,
        prediction,
        recentLeaves: leaves,
        attendanceHistory: records
      }
    });
  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching student profile.' });
  }
});

// Create Student (Admin only)
router.post('/', verifyToken, requireRole('Admin'), async (req, res) => {
  try {
    const { name, email, password = 'password123', rollNumber, department, className, phone, parentPhone } = req.body;

    if (!name || !email || !rollNumber) {
      return res.status(400).json({ success: false, message: 'Name, email, and roll number are required.' });
    }

    const existingUser = await db.get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const existingRoll = await db.get(`SELECT id FROM students WHERE roll_number = ?`, [rollNumber]);
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Roll number is already registered.' });
    }

    const userId = generateId('usr');
    const studentId = generateId('stu');
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'Student')`,
      [userId, name, email.toLowerCase(), hashedPassword]
    );

    await db.run(
      `INSERT INTO students (id, user_id, roll_number, department, class_name, phone, parent_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, userId, rollNumber, department || 'Computer Science', className || 'CSE-A', phone || '', parentPhone || '']
    );

    res.status(201).json({
      success: true,
      message: 'Student added successfully.',
      student: { id: studentId, userId, name, email, rollNumber, department, className }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Server error creating student.' });
  }
});

// Update Student (Admin only)
router.put('/:id', verifyToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, className, phone, parentPhone } = req.body;

    const student = await db.get(`SELECT * FROM students WHERE id = ?`, [id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await db.run(
      `UPDATE students SET department = ?, class_name = ?, phone = ?, parent_phone = ? WHERE id = ?`,
      [department || student.department, className || student.class_name, phone, parentPhone, id]
    );

    if (name) {
      await db.run(`UPDATE users SET name = ? WHERE id = ?`, [name, student.user_id]);
    }

    res.json({ success: true, message: 'Student updated successfully.' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error updating student.' });
  }
});

// Delete Student (Admin only)
router.delete('/:id', verifyToken, requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const student = await db.get(`SELECT user_id FROM students WHERE id = ?`, [id]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await db.run(`DELETE FROM students WHERE id = ?`, [id]);
    await db.run(`DELETE FROM users WHERE id = ?`, [student.user_id]);

    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student.' });
  }
});

module.exports = router;
