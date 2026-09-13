import React, { useEffect, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function AdminDashboard({ onSelectStudent, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [continuousAbsent, setContinuousAbsent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    className: 'CSE-A',
    phone: '',
    parentPhone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, stuData, streakData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getStudents(),
        api.getContinuousAbsent(2)
      ]);

      setStats(dashData.stats);
      setStudents(stuData.students);
      setContinuousAbsent(streakData.students);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.createStudent(newStudent);
      setShowAddModal(false);
      setNewStudent({
        name: '',
        email: '',
        rollNumber: '',
        department: 'Computer Science & Engineering',
        className: 'CSE-A',
        phone: '',
        parentPhone: ''
      });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteStudent(id);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Administrative Control Center 👑
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
            Campus attendance health, risk categorization, and student roster management
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats ? stats.totalStudents : '-'}
          subtitle="Enrolled undergraduates"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Faculty Members"
          value={stats ? stats.totalTeachers : '-'}
          subtitle="Active instructors"
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Average Attendance"
          value={stats ? `${stats.averageAttendance}%` : '-'}
          subtitle="Campus wide benchmark"
          icon={CheckCircle2}
          color="emerald"
          badgeText={stats && stats.averageAttendance >= 75 ? 'Optimal' : 'Needs Focus'}
          badgeColor={stats && stats.averageAttendance >= 75 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Continuous Absent"
          value={stats ? stats.continuousAbsentCount : '-'}
          subtitle="Streak ≥ 2 days flagged"
          icon={AlertTriangle}
          color="amber"
          badgeText="Active Streaks"
          badgeColor="rose"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: 24, marginTop: 8 }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid #4f46e5' : '3px solid transparent',
            padding: '12px 4px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: activeTab === 'overview' ? '#4f46e5' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Attendance Risk & Streak Watchlist
        </button>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'students' ? '3px solid #4f46e5' : '3px solid transparent',
            padding: '12px 4px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: activeTab === 'students' ? '#4f46e5' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Student Directory ({students.length})
        </button>
      </div>

      {/* Tab 1: Overview & Watchlist */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Continuous Absences Section */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={20} color="#f59e0b" />
                  Feature 2: Continuous Absence Flagged Students ⭐
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Students missing 2 or more consecutive classes requiring immediate outreach
                </p>
              </div>
              <button 
                className="btn btn-outline" 
                style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                onClick={() => onNavigate('continuous-absent')}
              >
                View Dedicated Streak Engine →
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Class</th>
                    <th>Current Streak</th>
                    <th>Longest Streak</th>
                    <th>Overall %</th>
                    <th>Risk Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {continuousAbsent.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                        No continuous absence flags currently active.
                      </td>
                    </tr>
                  ) : (
                    continuousAbsent.map((stu) => (
                      <tr key={stu.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{stu.name}</td>
                        <td style={{ fontWeight: 600 }}>{stu.roll_number}</td>
                        <td>{stu.class_name}</td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.9375rem' }}>
                            {stu.currentStreak} Days
                          </span>
                        </td>
                        <td>{stu.longestStreak} Days</td>
                        <td style={{ fontWeight: 700 }}>{stu.percentage}%</td>
                        <td>
                          <span className={`badge badge-${stu.riskStatus ? stu.riskStatus.toLowerCase() : 'warning'}`}>
                            {stu.riskBadge || stu.riskStatus}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => onSelectStudent(stu.id)}
                          >
                            <Eye size={14} /> Dossier
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Students Directory */}
      {activeTab === 'students' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                className="form-input"
                style={{ paddingLeft: 42 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Attendance %</th>
                  <th>Current Streak</th>
                  <th>Risk Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td style={{ fontWeight: 600 }}>{stu.roll_number}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{stu.name}</td>
                    <td>{stu.department}</td>
                    <td>{stu.class_name}</td>
                    <td style={{ fontWeight: 700, color: stu.metrics.percentage >= 75 ? '#10b981' : stu.metrics.percentage >= 65 ? '#f59e0b' : '#ef4444' }}>
                      {stu.metrics.percentage}%
                    </td>
                    <td>{stu.metrics.currentStreak} Days</td>
                    <td>
                      <span className={`badge badge-${stu.risk.code}`}>
                        {stu.risk.badge}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => onSelectStudent(stu.id)}
                          title="View 360 Profile Dossier"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          onClick={() => handleDeleteStudent(stu.id, stu.name)}
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Enroll New Student
            </h3>
            
            <form onSubmit={handleAddStudent}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Mukil Nila"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="student@smartattend.edu"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. 23CSR007"
                    value={newStudent.rollNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select
                    className="form-select"
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                  >
                    <option value="CSE-A">CSE-A</option>
                    <option value="CSE-B">CSE-B</option>
                    <option value="IT-A">IT-A</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
