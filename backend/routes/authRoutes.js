const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { JWT_SECRET, verifyToken } = require('../middleware/authMiddleware');

function generateId() {
  return 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, rollNumber, className, employeeCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), hashedPassword, role]
    );

    // Profile extension based on role
    if (role === 'Student') {
      const studentId = 'stu-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
      await db.run(
        `INSERT INTO students (id, user_id, roll_number, department, class_name) VALUES (?, ?, ?, ?, ?)`,
        [studentId, userId, rollNumber || 'ROLL-' + Math.floor(1000 + Math.random() * 9000), department || 'Computer Science', className || 'CSE-A']
      );
    } else if (role === 'Teacher') {
      const teacherId = 'tch-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
      await db.run(
        `INSERT INTO teachers (id, user_id, department, employee_code) VALUES (?, ?, ?, ?)`,
        [teacherId, userId, department || 'Computer Science', employeeCode || 'EMP-' + Math.floor(100 + Math.random() * 900)]
      );
    }

    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), role, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let extra = {};
    if (user.role === 'Student') {
      const student = await db.get(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
      extra.student = student;
    } else if (user.role === 'Teacher') {
      const teacher = await db.get(`SELECT * FROM teachers WHERE user_id = ?`, [user.id]);
      extra.teacher = teacher;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, ...extra },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        ...extra
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.get(`SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?`, [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let extra = {};
    if (user.role === 'Student') {
      const student = await db.get(`SELECT * FROM students WHERE user_id = ?`, [user.id]);
      extra.student = student;
    } else if (user.role === 'Teacher') {
      const teacher = await db.get(`SELECT * FROM teachers WHERE user_id = ?`, [user.id]);
      extra.teacher = teacher;
    }

    res.json({
      success: true,
      user: { ...user, ...extra }
    });
  } catch (error) {
    console.error('Me route error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
});

module.exports = router;
