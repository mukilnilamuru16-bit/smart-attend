import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Phone, Mail, Eye, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ContinuousAbsentPage({ onSelectStudent }) {
  const [minStreak, setMinStreak] = useState(2);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContinuousAbsent();
  }, [minStreak]);

  const loadContinuousAbsent = async () => {
    try {
      setLoading(true);
      const data = await api.getContinuousAbsent(minStreak);
      setStudents(data.students);
    } catch (err) {
      console.error('Continuous absent load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={28} color="#f59e0b" />
            Feature 2: Continuous Absence Detection Engine ⭐
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
            Automatically tracks consecutive absent streaks and flags students requiring intervention
          </p>
        </div>

        {/* Streak Threshold Filters */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, gap: 4 }}>
          <button
            className={`btn ${minStreak === 2 ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '6px 14px', fontSize: '0.8125rem' }}
            onClick={() => setMinStreak(2)}
          >
            Streak ≥ 2 Days
          </button>
          <button
            className={`btn ${minStreak === 3 ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '6px 14px', fontSize: '0.8125rem' }}
            onClick={() => setMinStreak(3)}
          >
            Streak ≥ 3 Days (Alert)
          </button>
          <button
            className={`btn ${minStreak === 5 ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '6px 14px', fontSize: '0.8125rem' }}
            onClick={() => setMinStreak(5)}
          >
            Streak ≥ 5 Days (Critical)
          </button>
        </div>
      </div>

      {/* Streak Explanation Banner */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#92400e' }}>
            Continuous Streak Tracking Logic
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#78350f', marginTop: 2 }}>
            "If Absent $\rightarrow$ Increase streak count. If Present $\rightarrow$ Reset streak to 0." Database queries automatically detect consecutive absence intervals.
          </p>
        </div>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#b45309' }}>
          {students.length} Flagged
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class / Dept</th>
                <th>Current Streak</th>
                <th>Longest Streak</th>
                <th>Overall %</th>
                <th>Risk State</th>
                <th>Parent Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    Computing absence streaks...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    No students currently meet the minimum streak of {minStreak} consecutive days.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{stu.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stu.roll_number}</div>
                    </td>
                    <td>
                      <div>{stu.class_name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{stu.department}</div>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', padding: '4px 10px', borderRadius: 8, border: '1px solid #fecaca' }}>
                        <AlertTriangle size={14} color="#ef4444" />
                        <span style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.9375rem' }}>
                          {stu.currentStreak} Days
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#475569' }}>{stu.longestStreak} Days</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {stu.percentage}%
                    </td>
                    <td>
                      <span className={`badge badge-${stu.riskStatus ? stu.riskStatus.toLowerCase() : 'warning'}`}>
                        {stu.riskBadge || stu.riskStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {stu.parent_phone || stu.phone || 'Not recorded'}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => onSelectStudent(stu.id)}
                      >
                        <Eye size={14} /> Full Dossier
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
