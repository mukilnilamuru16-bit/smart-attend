import React, { useEffect, useState } from 'react';
import { 
  CalendarCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Eye, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function TeacherDashboard({ user, onNavigate, onSelectStudent }) {
  const [continuousAbsent, setContinuousAbsent] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, streakData, leaveData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getContinuousAbsent(2),
        api.getLeaveRequests()
      ]);

      setStats(dashData.stats);
      setContinuousAbsent(streakData.students);
      setPendingLeaves(leaveData.requests.filter((r) => r.status === 'Pending'));
    } catch (err) {
      console.error('Teacher dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Faculty Portal
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 4 }}>
            Welcome back, {user.name}! 👨‍🏫
          </h1>
          <p style={{ color: '#c7d2fe', fontSize: '0.9375rem', marginTop: 4, maxWidth: 540 }}>
            Department of Computer Science & Engineering. Track real-time attendance, monitor absence streaks, and review student leave applications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-primary"
            style={{ background: '#ffffff', color: '#1e1b4b', fontWeight: 700, padding: '12px 20px' }}
            onClick={() => onNavigate('mark-attendance')}
          >
            <CalendarCheck size={18} color="#4f46e5" />
            <span>Mark Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Continuous Absent"
          value={continuousAbsent.length}
          subtitle="Streak ≥ 2 days missed"
          icon={AlertTriangle}
          color="amber"
          badgeText={continuousAbsent.length > 0 ? 'Requires Action' : 'All Clear'}
          badgeColor={continuousAbsent.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves.length}
          subtitle="Student applications"
          icon={FileText}
          color="sky"
        />
        <StatCard
          title="Class Attendance"
          value={stats ? `${stats.averageAttendance}%` : '-'}
          subtitle="CSE-A Section average"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value="2"
          subtitle="DSA (CS301), DBMS (CS302)"
          icon={BookOpen}
          color="indigo"
        />
      </div>

      {/* Main Teacher Content Grid */}
      <div className="grid-cols-2">
        
        {/* Continuous Absence Alerts List */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#f59e0b" />
                Feature 2: Continuous Absence Alerts
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Students flagged for consecutive missed days</p>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => onNavigate('continuous-absent')}
            >
              All Streaks →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {continuousAbsent.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                No active continuous absence streaks.
              </div>
            ) : (
              continuousAbsent.slice(0, 4).map((stu) => (
                <div key={stu.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{stu.name}</span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stu.roll_number} | {stu.class_name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.875rem' }}>
                        {stu.currentStreak} Days
                      </span>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Current Streak</div>
                    </div>
                    <button 
                      className="btn btn-outline" 
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      onClick={() => onSelectStudent(stu.id)}
                    >
                      <Eye size={14} /> Dossier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Leave Requests */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#0284c7" />
                Feature 9: Leave Approval Queue
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Awaiting faculty approval</p>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              onClick={() => onNavigate('leaves')}
            >
              Review All ({pendingLeaves.length}) →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>
                No pending leave requests to review.
              </div>
            ) : (
              pendingLeaves.slice(0, 3).map((lve) => (
                <div key={lve.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{lve.student_name}</span>
                    <span className="badge badge-warning">{lve.leave_type}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '4px 0' }}>{lve.reason}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
                    <span>{lve.start_date} to {lve.end_date}</span>
                    <button 
                      onClick={() => onNavigate('leaves')}
                      style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Process Leave →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
