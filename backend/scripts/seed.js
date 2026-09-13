const bcrypt = require('bcryptjs');
const { db, initDb } = require('../config/db');

async function seed() {
  console.log('🌱 Initializing database schema...');
  await initDb();

  console.log('🧹 Clearing existing data...');
  const tables = ['notifications', 'leave_requests', 'attendance', 'subjects', 'teachers', 'students', 'classes', 'users'];
  for (const table of tables) {
    try {
      await db.run(`DELETE FROM ${table}`);
    } catch (e) {
      // Ignore if table doesn't exist yet
    }
  }

  console.log('👥 Creating users and roles...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  // 1. Admin
  await db.run(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['usr-admin-01', 'System Administrator', 'admin@smartattend.edu', adminHash, 'Admin']
  );

  // 2. Teachers
  await db.run(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['usr-teacher-01', 'Prof. Ramesh Kannan', 'teacher@smartattend.edu', teacherHash, 'Teacher']
  );
  await db.run(
    `INSERT INTO teachers (id, user_id, department, employee_code) VALUES (?, ?, ?, ?)`,
    ['tch-01', 'usr-teacher-01', 'Computer Science & Engineering', 'EMP-CSE-101']
  );

  await db.run(
    `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    ['usr-teacher-02', 'Dr. Sarah Jenkins', 'sarah@smartattend.edu', teacherHash, 'Teacher']
  );
  await db.run(
    `INSERT INTO teachers (id, user_id, department, employee_code) VALUES (?, ?, ?, ?)`,
    ['tch-02', 'usr-teacher-02', 'Computer Science & Engineering', 'EMP-CSE-102']
  );

  // 3. Classes
  await db.run(
    `INSERT INTO classes (id, name, department, academic_year) VALUES (?, ?, ?, ?)`,
    ['cls-csea', 'CSE-A', 'Computer Science & Engineering', '2025-2026']
  );
  await db.run(
    `INSERT INTO classes (id, name, department, academic_year) VALUES (?, ?, ?, ?)`,
    ['cls-cseb', 'CSE-B', 'Computer Science & Engineering', '2025-2026']
  );

  // 4. Subjects
  await db.run(
    `INSERT INTO subjects (id, subject_code, subject_name, department, teacher_id, class_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['sub-dsa', 'CS301', 'Data Structures & Algorithms', 'Computer Science & Engineering', 'tch-01', 'cls-csea']
  );
  await db.run(
    `INSERT INTO subjects (id, subject_code, subject_name, department, teacher_id, class_id) VALUES (?, ?, ?, ?, ?, ?)`,
    ['sub-dbms', 'CS302', 'Database Management Systems', 'Computer Science & Engineering', 'tch-02', 'cls-csea']
  );

  // 5. Students
  const studentData = [
    {
      userId: 'usr-stu-mukil',
      studentId: 'stu-mukil',
      name: 'Mukil Nila',
      email: 'mukil@smartattend.edu',
      rollNumber: '23CSR001',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43210',
      parentPhone: '+91 98765 43211',
      profileType: 'streak_and_friday' // will have current absent streak = 4, frequently absent on Friday
    },
    {
      userId: 'usr-stu-ajay',
      studentId: 'stu-ajay',
      name: 'Muthu Ajay',
      email: 'ajay@smartattend.edu',
      rollNumber: '23CSR002',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43212',
      parentPhone: '+91 98765 43213',
      profileType: 'warning' // ~70%
    },
    {
      userId: 'usr-stu-mousiga',
      studentId: 'stu-mousiga',
      name: 'Mousiga',
      email: 'mousiga@smartattend.edu',
      rollNumber: '23CSR003',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43214',
      parentPhone: '+91 98765 43215',
      profileType: 'top1' // 98%
    },
    {
      userId: 'usr-stu-nagendran',
      studentId: 'stu-nagendran',
      name: 'Nagendran',
      email: 'nagendran@smartattend.edu',
      rollNumber: '23CSR004',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43216',
      parentPhone: '+91 98765 43217',
      profileType: 'top2' // 96%
    },
    {
      userId: 'usr-stu-kumar',
      studentId: 'stu-kumar',
      name: 'Kumar Vel',
      email: 'kumar@smartattend.edu',
      rollNumber: '23CSR005',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43218',
      parentPhone: '+91 98765 43219',
      profileType: 'critical' // 55%
    },
    {
      userId: 'usr-stu-priya',
      studentId: 'stu-priya',
      name: 'Priya Ramesh',
      email: 'priya@smartattend.edu',
      rollNumber: '23CSR006',
      dept: 'Computer Science & Engineering',
      className: 'CSE-A',
      phone: '+91 98765 43220',
      parentPhone: '+91 98765 43221',
      profileType: 'safe' // ~88%
    }
  ];

  for (const s of studentData) {
    await db.run(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      [s.userId, s.name, s.email, studentHash, 'Student']
    );
    await db.run(
      `INSERT INTO students (id, user_id, roll_number, department, class_name, phone, parent_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.studentId, s.userId, s.rollNumber, s.dept, s.className, s.phone, s.parentPhone]
    );
  }

  // 6. Generate 30 working days of realistic attendance history
  console.log('📅 Generating 30 days of attendance records...');
  const dates = [];
  let d = new Date();
  // Generate past 40 calendar days and filter out weekends to get ~30 school days
  while (dates.length < 30) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Monday to Friday
      dates.unshift(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() - 1);
  }

  // dates is now sorted ascending chronologically
  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay(); // 1=Mon, 5=Fri
    const isRecent4Days = i >= dates.length - 4;

    for (const s of studentData) {
      let status = 'Present';

      if (s.profileType === 'streak_and_friday') {
        // Mukil Nila: absent on recent 4 days (Current Streak = 4) + frequently absent on Friday
        if (isRecent4Days) {
          status = 'Absent';
        } else if (dayOfWeek === 5 && (i % 2 === 0)) {
          status = 'Absent'; // Absent on Fridays
        } else if (i === 12) {
          status = 'Leave';
        } else {
          status = 'Present';
        }
      } else if (s.profileType === 'warning') {
        // Muthu Ajay: ~70% attendance
        if (i % 3 === 0) {
          status = 'Absent';
        } else {
          status = 'Present';
        }
      } else if (s.profileType === 'critical') {
        // Kumar Vel: ~55% attendance
        if (i % 2 === 0) {
          status = 'Absent';
        } else {
          status = 'Present';
        }
      } else if (s.profileType === 'top1') {
        // Mousiga: 98% (only 1 absence)
        if (i === 10) {
          status = 'Absent';
        } else {
          status = 'Present';
        }
      } else if (s.profileType === 'top2') {
        // Nagendran: 96% (only 1 absence, 1 leave)
        if (i === 8) {
          status = 'Absent';
        } else if (i === 15) {
          status = 'Leave';
        } else {
          status = 'Present';
        }
      } else {
        // Priya: ~88%
        if (i % 7 === 0) {
          status = 'Absent';
        } else {
          status = 'Present';
        }
      }

      await db.run(
        `INSERT INTO attendance (id, student_id, subject_id, date, status, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`att-${s.studentId}-${i}`, s.studentId, 'sub-dsa', dateStr, status, status === 'Leave' ? 'Medical Leave' : '']
      );
    }
  }

  // 7. Seed Sample Leave Requests
  console.log('📝 Creating sample leave requests...');
  await db.run(
    `INSERT INTO leave_requests (id, student_id, reason, leave_type, start_date, end_date, status, reviewer_comments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'lve-01',
      'stu-mukil',
      'Severe viral fever and doctor recommended bed rest',
      'Medical',
      dates[dates.length - 2],
      dates[dates.length - 1],
      'Pending',
      null
    ]
  );
  await db.run(
    `INSERT INTO leave_requests (id, student_id, reason, leave_type, start_date, end_date, status, reviewer_comments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'lve-02',
      'stu-priya',
      'Attending National Level Hackathon',
      'On Duty',
      dates[5],
      dates[6],
      'Approved',
      'Granted on-duty leave. Good luck!'
    ]
  );

  // 8. Seed In-App Notifications
  console.log('🔔 Creating sample in-app notifications...');
  await db.run(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'notif-01',
      'usr-teacher-01',
      '⚠️ Continuous Absence Alert: Mukil Nila',
      'Mukil Nila (23CSR001) has been absent for 4 consecutive days.',
      'Alert',
      0,
      'stu-mukil'
    ]
  );
  await db.run(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'notif-02',
      'usr-admin-01',
      '🚨 Critical Attendance Shortage: Kumar Vel',
      'Kumar Vel has dropped to 55% attendance (Critical threshold < 65%).',
      'Critical',
      0,
      'stu-kumar'
    ]
  );
  await db.run(
    `INSERT INTO notifications (id, user_id, title, message, type, is_read, student_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'notif-03',
      'usr-stu-mukil',
      '⚠️ Attendance Streak Warning',
      'You have missed 4 consecutive classes. Please submit a medical certificate or contact your class advisor.',
      'Warning',
      0,
      'stu-mukil'
    ]
  );

  console.log('🎉 Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Logins:');
  console.log('👑 Admin:   admin@smartattend.edu   / admin123');
  console.log('👨‍🏫 Teacher: teacher@smartattend.edu / teacher123');
  console.log('🎓 Student: mukil@smartattend.edu   / student123 (4-day streak, Friday absence pattern)');
  console.log('🎓 Student: mousiga@smartattend.edu / student123 (Top regular student 98%)');
  console.log('🎓 Student: ajay@smartattend.edu    / student123 (Warning 70%)');
  console.log('🎓 Student: kumar@smartattend.edu   / student123 (Critical 55%)');
  console.log('----------------------------------------------------');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
