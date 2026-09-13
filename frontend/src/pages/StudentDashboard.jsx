import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function StudentDashboard({ user, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [futureClassesSim, setFutureClassesSim] = useState(20);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    leaveType: 'Medical',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });
  const [leaveMsg, setLeaveMsg] = useState('');

  useEffect(() => {
    loadStudentDetails();
  }, [user]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      // If user has student profile id:
      let studentId = user.student ? user.student.id : null;
      if (!studentId) {
        // Find student record matching user.id
        const stuList = await api.getStudents();
        const found = stuList.students.find((s) => s.user_id === user.id);
        if (found) studentId = found.id;
      }

      if (studentId) {
        const data = await api.getStudentProfile(studentId);
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.submitLeaveRequest({
        studentId: profile.personal.id,
        ...leaveForm
      });
      setShowLeaveModal(false);
      setLeaveMsg('Leave application submitted successfully. Awaiting faculty review.');
      await loadStudentDetails();
    } catch (err) {
      alert(err.message || 'Failed to submit leave request.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontWeight: 600 }}>Loading your student portal...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No Student Record Found</h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4 }}>
          This user is not currently linked with an active student profile.
        </p>
      </div>
    );
  }

  const { personal, metrics, risk, pattern, prediction, attendanceHistory } = profile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Top Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #312e81, #4338ca)', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Student Attendance Portal
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
            Hello, {personal.name}! 🎓
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.9375rem', marginTop: 4 }}>
            Roll No: <strong>{personal.rollNumber}</strong> | Class: <strong>{personal.className}</strong> | Dept: <strong>{personal.department}</strong>
          </p>
        </div>

        <button 
          className="btn btn-primary"
          style={{ background: '#ffffff', color: '#312e81', fontWeight: 700, padding: '12px 20px' }}
          onClick={() => setShowLeaveModal(true)}
        >
          <Plus size={18} color="#4338ca" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {leaveMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 18px', color: '#065f46', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{leaveMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Attendance Score"
          value={`${metrics.percentage}%`}
          subtitle={`${metrics.presentCount} of ${metrics.totalClasses} classes attended`}
          icon={CheckCircle2}
          color={risk.code === 'safe' ? 'emerald' : risk.code === 'warning' ? 'amber' : 'rose'}
          badgeText={risk.badge}
          badgeColor={risk.code === 'safe' ? 'emerald' : risk.code === 'warning' ? 'amber' : 'rose'}
        />
        <StatCard
          title="Current Absent Streak"
          value={`${metrics.currentStreak} Days`}
          subtitle={metrics.currentStreak >= 2 ? '⚠️ Continuous Absence' : 'Active Attendance'}
          icon={AlertTriangle}
          color={metrics.currentStreak > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Longest Absent Streak"
          value={`${metrics.longestStreak} Days`}
          subtitle="Max consecutive missed"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Authorized Leaves"
          value={`${metrics.leaveCount} Days`}
          subtitle="Approved on-duty & medical"
          icon={FileText}
          color="sky"
        />
      </div>

      {/* Intelligence Row: Feature 7 Absence Pattern & Feature 8 Prediction Simulator */}
      <div className="grid-cols-2">
        
        {/* Feature 7: Absence Pattern Insight */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Sparkles size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
              Feature 7: Personal Absence Pattern 🤖
            </h3>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9375rem' }}>
              {pattern.patternDescription}
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4 }}>
              Total absences: <strong>{pattern.totalAbsences}</strong>. Most frequent absent day: <strong>{pattern.mostFrequentAbsentDay || 'None'}</strong>.
            </p>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Weekly Absence Distribution
            </span>
            {Object.entries(pattern.dayDistribution).map(([day, count]) => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem' }}>
                <span style={{ width: 80, color: '#475569', fontWeight: 600 }}>{day}</span>
                <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, count * 25)}%`, height: '100%', background: count >= 3 ? '#ef4444' : '#4f46e5', borderRadius: 6 }} />
                </div>
                <span style={{ width: 28, textAlign: 'right', fontWeight: 700, color: count > 0 ? '#0f172a' : '#94a3b8' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 8: Future Attendance Prediction Simulator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={20} color="#059669" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
              Feature 8: Attendance Prediction Engine 🤖
            </h3>
          </div>

          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
                  Projected Final Attendance
                </span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: prediction.predictedPercentage >= 75 ? '#065f46' : '#b91c1c' }}>
                  {prediction.predictedPercentage}%
                </div>
              </div>
              <span className={`badge ${prediction.predictedPercentage >= 75 ? 'badge-safe' : 'badge-critical'}`}>
                {prediction.predictionRisk}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#047857', marginTop: 8 }}>
              {prediction.statusText}
            </p>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span>Minimum Classes Needed for 75%:</span>
              <strong>{prediction.neededPresentsFor75} of next {prediction.futureClasses}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <span>Maximum Possible Attendance:</span>
              <strong>{prediction.maxPossiblePercentage}%</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Attendance History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={20} color="#4f46e5" />
            Attendance History Log
          </h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((rec, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{rec.date}</td>
                  <td>{rec.subject_name || 'General'}</td>
                  <td>
                    <span className={`badge ${rec.status === 'Present' ? 'badge-safe' : rec.status === 'Absent' ? 'badge-critical' : 'badge-warning'}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{rec.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Submit Leave Request (Feature 9)
            </h3>

            <form onSubmit={handleApplyLeave}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select 
                  className="form-select"
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                >
                  <option value="Medical">Medical Leave</option>
                  <option value="On Duty">On Duty / Event</option>
                  <option value="Personal">Personal / Family</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="Provide reason for absence..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
