const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

function generateId() {
  return 'lve-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

// Submit Leave Request (Students or Admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { reason, leaveType = 'Medical', startDate, endDate, studentId } = req.body;

    if (!reason || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Reason, startDate, and endDate are required.' });
    }

    let targetStudentId = studentId;

    if (req.user.role === 'Student') {
      const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (!student) {
        return res.status(400).json({ success: false, message: 'No student profile linked to this user.' });
      }
      targetStudentId = student.id;
    }

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const leaveId = generateId();

    await db.run(
      `INSERT INTO leave_requests (id, student_id, reason, leave_type, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [leaveId, targetStudentId, reason, leaveType, startDate, endDate]
    );

    // Notify Teachers and Admins about new leave request
    const studentInfo = await db.get(
      `SELECT s.roll_number, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [targetStudentId]
    );

    const faculty = await db.all(`SELECT id FROM users WHERE role IN ('Teacher', 'Admin')`);
    for (const member of faculty) {
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
         VALUES (?, ?, ?, ?, 'Info', 0, ?)`,
        [
          'notif-' + Math.random().toString(36).substr(2, 9),
          member.id,
          '📩 New Leave Request',
          `${studentInfo ? studentInfo.name : 'A student'} submitted a ${leaveType} leave request from ${startDate} to ${endDate}.`,
          targetStudentId
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully. Pending approval.',
      leaveId
    });
  } catch (error) {
    console.error('Submit leave error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting leave request.' });
  }
});

// List Leave Requests
router.get('/', verifyToken, async (req, res) => {
  try {
    let requests;

    if (req.user.role === 'Student') {
      const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
      if (!student) {
        return res.json({ success: true, requests: [] });
      }
      requests = await db.all(
        `SELECT lr.*, s.roll_number, s.class_name, u.name as student_name
         FROM leave_requests lr
         JOIN students s ON lr.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE lr.student_id = ?
         ORDER BY lr.created_at DESC`,
        [student.id]
      );
    } else {
      requests = await db.all(
        `SELECT lr.*, s.roll_number, s.class_name, s.department, u.name as student_name
         FROM leave_requests lr
         JOIN students s ON lr.student_id = s.id
         JOIN users u ON s.user_id = u.id
         ORDER BY lr.created_at DESC`
      );
    }

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leave requests.' });
  }
});

// Helper to get dates between start and end inclusive
function getDatesInRange(startDateStr, endDateStr) {
  const dates = [];
  const curr = new Date(startDateStr);
  const end = new Date(endDateStr);
  while (curr <= end) {
    dates.push(curr.toISOString().slice(0, 10));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

// Approve Leave Request
router.put('/:id/approve', verifyToken, requireRole('Teacher', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { comments = '' } = req.body;

    const leave = await db.get(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    await db.run(
      `UPDATE leave_requests SET status = 'Approved', reviewer_comments = ? WHERE id = ?`,
      [comments, id]
    );

    // Automatically update attendance records in that date range to 'Leave'
    const dates = getDatesInRange(leave.start_date, leave.end_date);
    const subjects = await db.all(`SELECT id FROM subjects`);
    const defaultSubjectId = subjects.length > 0 ? subjects[0].id : 'sub-default';

    for (const d of dates) {
      const existing = await db.get(
        `SELECT id FROM attendance WHERE student_id = ? AND date = ?`,
        [leave.student_id, d]
      );
      if (existing) {
        await db.run(
          `UPDATE attendance SET status = 'Leave', remarks = ? WHERE id = ?`,
          [`Approved Leave: ${leave.reason}`, existing.id]
        );
      } else {
        await db.run(
          `INSERT INTO attendance (id, student_id, subject_id, date, status, remarks)
           VALUES (?, ?, ?, ?, 'Leave', ?)`,
          ['att-' + Math.random().toString(36).substr(2, 9), leave.student_id, defaultSubjectId, d, `Approved Leave: ${leave.reason}`]
        );
      }
    }

    // Notify Student
    const studentUser = await db.get(`SELECT user_id FROM students WHERE id = ?`, [leave.student_id]);
    if (studentUser) {
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
         VALUES (?, ?, '✅ Leave Request Approved', ?, 'Success', 0, ?)`,
        [
          'notif-' + Math.random().toString(36).substr(2, 9),
          studentUser.user_id,
          `Your leave request from ${leave.start_date} to ${leave.end_date} has been approved.`,
          leave.student_id
        ]
      );
    }

    res.json({ success: true, message: 'Leave request approved and attendance updated to Leave status.' });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ success: false, message: 'Server error approving leave.' });
  }
});

// Reject Leave Request
router.put('/:id/reject', verifyToken, requireRole('Teacher', 'Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { comments = 'Leave request rejected.' } = req.body;

    const leave = await db.get(`SELECT * FROM leave_requests WHERE id = ?`, [id]);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    await db.run(
      `UPDATE leave_requests SET status = 'Rejected', reviewer_comments = ? WHERE id = ?`,
      [comments, id]
    );

    // Notify Student
    const studentUser = await db.get(`SELECT user_id FROM students WHERE id = ?`, [leave.student_id]);
    if (studentUser) {
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
         VALUES (?, ?, '❌ Leave Request Rejected', ?, 'Warning', 0, ?)`,
        [
          'notif-' + Math.random().toString(36).substr(2, 9),
          studentUser.user_id,
          `Your leave request from ${leave.start_date} to ${leave.end_date} was rejected. Note: ${comments}`,
          leave.student_id
        ]
      );
    }

    res.json({ success: true, message: 'Leave request rejected.' });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting leave.' });
  }
});

module.exports = router;
