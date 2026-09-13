import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentProfileModal({ studentId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [futureSimClasses, setFutureSimClasses] = useState(20);

  useEffect(() => {
    if (!studentId) return;
    loadProfile(studentId);
  }, [studentId]);

  const loadProfile = async (id) => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile(id);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: 800, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem' }}>
              {profile ? profile.personal.name.charAt(0) : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {profile ? profile.personal.name : 'Loading Profile...'}
                </h2>
                {profile && (
                  <span className={`badge badge-${profile.risk.code}`}>
                    {profile.risk.badge}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 2 }}>
                Roll No: <strong>{profile?.personal.rollNumber}</strong> | Class: <strong>{profile?.personal.className}</strong> | Dept: <strong>{profile?.personal.department}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div className="animate-spin" style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #cbd5e1', borderTopColor: '#4f46e5', borderRadius: '50%' }} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>Loading Dossier...</p>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
            <p>{error}</p>
          </div>
        ) : (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Feature 10 Dossier Stats Grid */}
            <div className="grid-cols-4" style={{ gap: 14 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Attendance Rate</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: profile.risk.code === 'safe' ? '#10b981' : profile.risk.code === 'warning' ? '#f59e0b' : '#ef4444', marginTop: 4 }}>
                  {profile.metrics.percentage}%
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {profile.metrics.presentCount} of {profile.metrics.totalClasses} classes
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Streak</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: profile.metrics.currentStreak > 0 ? '#ef4444' : '#10b981', marginTop: 4 }}>
                  {profile.metrics.currentStreak} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Days</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {profile.metrics.currentStreak >= 2 ? '⚠️ Consecutive Absence' : 'Active Attendance'}
                </span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Longest Streak</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                  {profile.metrics.longestStreak} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Days</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Max consecutive missed</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status Breakdown</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span title="Present" style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                    P: {profile.metrics.presentCount}
                  </span>
                  <span title="Absent" style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#991b1b', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                    A: {profile.metrics.absentCount}
                  </span>
                  <span title="Leave" style={{ fontSize: '0.75rem', background: '#fffbeb', color: '#92400e', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
                    L: {profile.metrics.leaveCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Feature 7 & 8: Pattern Analysis & AI Attendance Prediction */}
            <div className="grid-cols-2" style={{ gap: 16 }}>
              {/* Feature 7: Absence Pattern */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Sparkles size={18} color="#4f46e5" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                    Feature 7: Absence Pattern Analysis 🤖
                  </h4>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600, background: '#f1f5f9', padding: '8px 12px', borderRadius: 8 }}>
                  {profile.pattern.patternDescription}
                </p>

                {/* Day distribution bars */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(profile.pattern.dayDistribution).map(([day, count]) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', gap: 8 }}>
                      <span style={{ width: 70, color: '#64748b', fontWeight: 600 }}>{day}</span>
                      <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, count * 20)}%`, height: '100%', background: day === profile.pattern.mostFrequentAbsentDay && count > 1 ? '#ef4444' : '#6366f1', borderRadius: 4 }} />
                      </div>
                      <span style={{ width: 24, textAlign: 'right', fontWeight: 700, color: count > 0 ? '#0f172a' : '#94a3b8' }}>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature 8: Future Attendance Prediction */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <TrendingUp size={18} color="#059669" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                    Feature 8: Predictive Trajectory 🤖
                  </h4>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '10px 14px', borderRadius: 10, border: '1px solid #a7f3d0' }}>
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#065f46' }}>Predicted Final Attendance</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: profile.prediction.predictedPercentage >= 75 ? '#065f46' : '#b91c1c' }}>
                      {profile.prediction.predictedPercentage}%
                    </div>
                  </div>
                  <span className={`badge ${profile.prediction.isFeasibleToReach75 ? 'badge-safe' : 'badge-critical'}`}>
                    {profile.prediction.predictionRisk}
                  </span>
                </div>

                <div style={{ marginTop: 12, fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    Target 75% Requirement: <strong>{profile.prediction.neededPresentsFor75}</strong> more presents out of next {profile.prediction.futureClasses} classes.
                  </div>
                  <div>
                    Maximum Possible: <strong>{profile.prediction.maxPossiblePercentage}%</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginTop: 4 }}>
                    "{profile.prediction.statusText}"
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance History Calendar Feed */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color="#4f46e5" />
                Recent Attendance History Log (Last 15 Sessions)
              </h4>

              <div className="table-container" style={{ maxHeight: 220 }}>
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
                    {profile.attendanceHistory.slice(0, 15).map((rec, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{rec.date}</td>
                        <td>{rec.subject_name || 'General'} ({rec.subject_code || 'CS301'})</td>
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

          </div>
        )}

      </div>
    </div>
  );
}
