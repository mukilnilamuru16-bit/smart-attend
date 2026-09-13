const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all notifications for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await db.all(
      `SELECT n.*, s.roll_number, u.name as student_name
       FROM notifications n
       LEFT JOIN students s ON n.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [req.user.id]
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    res.json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notification.' });
  }
});

// Mark all as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    await db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error updating notifications.' });
  }
});

module.exports = router;
