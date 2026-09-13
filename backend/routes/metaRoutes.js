const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all metadata: departments, classes, subjects, teachers
router.get('/all', verifyToken, async (req, res) => {
  try {
    const classes = await db.all(`SELECT * FROM classes ORDER BY name ASC`);
    const subjects = await db.all(
      `SELECT sub.*, t.employee_code, u.name as teacher_name
       FROM subjects sub
       LEFT JOIN teachers t ON sub.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY sub.subject_name ASC`
    );
    const teachers = await db.all(
      `SELECT t.id, t.department, t.employee_code, u.name, u.email
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       ORDER BY u.name ASC`
    );

    // Distinct departments
    const departments = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'];

    res.json({
      success: true,
      departments,
      classes,
      subjects,
      teachers
    });
  } catch (error) {
    console.error('Meta route error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching metadata.' });
  }
});

module.exports = router;
