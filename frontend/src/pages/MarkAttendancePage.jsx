import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, CheckCircle2, AlertTriangle, Users, BookOpen, Calendar, Check, X } from 'lucide-react';
import { api } from '../services/api';

export default function MarkAttendancePage({ onSelectStudent }) {
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [className, setClassName] = useState('CSE-A');
  const [subjectId, setSubjectId] = useState('sub-dsa');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [alertsGenerated, setAlertsGenerated] = useState([]);

  useEffect(() => {
    loadClassRoster();
  }, [className, date, subjectId]);

  const loadClassRoster = async () => {
    try {
      setLoading(true);
      setSuccessMsg('');
      setAlertsGenerated([]);
      const data = await api.getClassAttendance(className, date, subjectId);
      setStudents(data.students);
    } catch (err) {
      console.error('Failed to load class roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const setStudentStatus = (studentId, status) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const setStudentRemarks = (studentId, remarks) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  };

  const markAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      setAlertsGenerated([]);

      const records = students.map((s) => ({
        studentId: s.id,
        status: s.status,
        remarks: s.remarks || ''
      }));

      const res = await api.saveAttendance({
        subjectId,
        date,
        records
      });

      setSuccessMsg(res.message);
      if (res.alertsGenerated && res.alertsGenerated.length > 0) {
        setAlertsGenerated(res.alertsGenerated);
      }
    } catch (err) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.filter((s) => s.status === 'Absent').length;
  const leaveCount = students.filter((s) => s.status === 'Leave').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarCheck size={28} color="#4f46e5" />
            Feature 1: Attendance Management Session
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
            Select department, class section, subject, and session date to record attendance
          </p>
        </div>

        <button 
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
          onClick={handleSaveAttendance}
          disabled={saving || loading || students.length === 0}
        >
          <Save size={18} />
          <span>{saving ? 'Saving Records...' : 'SAVE ATTENDANCE'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, color: '#065f46' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

      {/* Real-time Alert generation report */}
      {alertsGenerated.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 700 }}>
            <AlertTriangle size={18} />
            <span>Real-time In-App Alerts Generated ({alertsGenerated.length}):</span>
          </div>
          {alertsGenerated.map((item, i) => (
            <div key={i} style={{ fontSize: '0.8125rem', color: '#78350f', paddingLeft: 26 }}>
              {item.alerts.map((a, j) => (
                <div key={j}>• {a.title}: {a.message}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Filters Form Card */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class</label>
            <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject</label>
            <select className="form-select" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="sub-dsa">CS301 - Data Structures & Algorithms</option>
              <option value="sub-dbms">CS302 - Database Management Systems</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* Quick Status Bar & Batch Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
            Class Roster: <strong>{students.length} Students</strong>
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 700 }}>
            ● Present: {presentCount}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 700 }}>
            ● Absent: {absentCount}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#f59e0b', fontWeight: 700 }}>
            ● Leave: {leaveCount}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => markAll('Present')}>
            <Check size={14} color="#10b981" /> Mark All Present
          </button>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => markAll('Absent')}>
            <X size={14} color="#ef4444" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Roll No</th>
                <th>Student Name</th>
                <th style={{ textAlign: 'center', width: 280 }}>Attendance Status</th>
                <th>Remarks / Notes</th>
                <th style={{ width: 100 }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    Loading Class Attendance Roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    No students found in this class section.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id}>
                    <td style={{ fontWeight: 600 }}>{stu.roll_number}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{stu.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="status-toggle-group">
                        <button
                          type="button"
                          className={`status-toggle-btn ${stu.status === 'Present' ? 'active-present' : ''}`}
                          onClick={() => setStudentStatus(stu.id, 'Present')}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={`status-toggle-btn ${stu.status === 'Absent' ? 'active-absent' : ''}`}
                          onClick={() => setStudentStatus(stu.id, 'Absent')}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          className={`status-toggle-btn ${stu.status === 'Leave' ? 'active-leave' : ''}`}
                          onClick={() => setStudentStatus(stu.id, 'Leave')}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional remarks..."
                        style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                        value={stu.remarks || ''}
                        onChange={(e) => setStudentRemarks(stu.id, e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => onSelectStudent(stu.id)}
                      >
                        Dossier
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
  );
}
