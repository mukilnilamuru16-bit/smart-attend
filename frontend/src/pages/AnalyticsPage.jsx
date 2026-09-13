import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  PieChart as PieIcon, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

export default function AnalyticsPage({ onSelectStudent }) {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pattern, setPattern] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [dashData, leadData, patData, riskData] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getLeaderboard(),
        api.getAbsencePattern(),
        api.getRiskList()
      ]);

      setStats(dashData.stats);
      setTrend(dashData.trend);
      setLeaderboard(leadData.leaderboard);
      setPattern(patData.pattern);
      setRiskSummary(riskData.summary);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontWeight: 600 }}>Loading institution analytics & leaderboard...</p>
      </div>
    );
  }

  // Calculate Present vs Absent distribution
  const totalSafe = riskSummary ? riskSummary.safeCount : 0;
  const totalWarning = riskSummary ? riskSummary.warningCount : 0;
  const totalCritical = riskSummary ? riskSummary.criticalCount : 0;
  const totalStudents = totalSafe + totalWarning + totalCritical;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={28} color="#4f46e5" />
          Feature 4 & 6: Analytics Dashboard & Leaderboard 🏆
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
          Institutional attendance trends, day-of-week distribution, and top regular student honors
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats ? stats.totalStudents : 0}
          subtitle="Enrolled Cohort"
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={stats ? stats.presentToday : 0}
          subtitle="In classroom"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={stats ? stats.absentToday : 0}
          subtitle="Unexcused absentees"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Class Average"
          value={stats ? `${stats.averageAttendance}%` : '0%'}
          subtitle="Overall attendance benchmark"
          icon={TrendingUp}
          color="sky"
        />
      </div>

      {/* Leaderboard & Risk Distribution Grid */}
      <div className="grid-cols-2">
        
        {/* Feature 6: Most Regular Students (Leaderboard 🏆) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={20} color="#f59e0b" />
                Feature 6: Attendance Leaderboard 🏆
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Top regular students sorted by attendance percentage</p>
            </div>
            <span className="badge badge-safe">Top Performers</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.slice(0, 5).map((student, rank) => (
              <div 
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: rank === 0 ? '#fefce8' : rank === 1 ? '#f8fafc' : rank === 2 ? '#fff7ed' : '#ffffff',
                  border: `1px solid ${rank === 0 ? '#fde047' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: rank === 0 ? '#eab308' : rank === 1 ? '#94a3b8' : rank === 2 ? '#f97316' : '#e2e8f0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.875rem'
                  }}>
                    {rank + 1}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                      {student.name}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {student.rollNumber} | {student.className}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#10b981' }}>
                    {student.percentage}%
                  </span>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                    {student.presentCount}/{student.totalClasses} classes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 3: Attendance Risk System Distribution */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieIcon size={20} color="#4f46e5" />
                Feature 3: Attendance Risk Distribution
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Categorized institutional student populations</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Safe Tier */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#065f46' }}>🟢 Safe Tier (≥ 75%)</span>
                <strong>{totalSafe} Students ({totalStudents ? Math.round((totalSafe/totalStudents)*100) : 0}%)</strong>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${totalStudents ? (totalSafe/totalStudents)*100 : 0}%`, height: '100%', background: '#10b981', borderRadius: 6 }} />
              </div>
            </div>

            {/* Warning Tier */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#92400e' }}>🟡 Warning Tier (65% - 74%)</span>
                <strong>{totalWarning} Students ({totalStudents ? Math.round((totalWarning/totalStudents)*100) : 0}%)</strong>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${totalStudents ? (totalWarning/totalStudents)*100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: 6 }} />
              </div>
            </div>

            {/* Critical Tier */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#991b1b' }}>🔴 Critical Tier (&lt; 65%)</span>
                <strong>{totalCritical} Students ({totalStudents ? Math.round((totalCritical/totalStudents)*100) : 0}%)</strong>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${totalStudents ? (totalCritical/totalStudents)*100 : 0}%`, height: '100%', background: '#ef4444', borderRadius: 6 }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 10, fontSize: '0.8125rem', color: '#475569', marginTop: 8 }}>
              💡 <strong>Institutional Policy:</strong> Students in the 🟡 Warning tier receive automatic early intervention notices. Students in 🔴 Critical tier require administrative counseling and parent notification.
            </div>
          </div>
        </div>

      </div>

      {/* Feature 4 & 7: Charts Grid (Daily Trend & Day-of-Week Pattern) */}
      <div className="grid-cols-2">
        
        {/* Daily Trend Line Graph Visualizer */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="#4f46e5" />
            Daily Attendance Trend (Last 7 Sessions)
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 20 }}>Session-by-session present vs absent headcounts</p>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180, paddingTop: 20 }}>
            {trend.slice(-7).map((item, i) => {
              const total = item.present + item.absent + item.leave;
              const heightPct = total > 0 ? Math.round((item.present / total) * 100) : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#4f46e5' }}>{item.present}P</span>
                  <div style={{ width: '100%', maxWidth: 36, height: `${Math.max(15, heightPct)}%`, background: 'linear-gradient(180deg, #6366f1, #4f46e5)', borderRadius: '6px 6px 0 0' }} />
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', transform: 'rotate(-30deg)', transformOrigin: 'top left', marginTop: 8 }}>
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature 7: Day of the Week Absence Pattern */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={20} color="#4f46e5" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
              Feature 7: Day-of-Week Absence Patterns 🤖
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 16 }}>
            {pattern ? pattern.patternDescription : 'Detecting behavioral absence trends'}
          </p>

          {pattern && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(pattern.dayDistribution).map(([day, count]) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem' }}>
                  <span style={{ width: 80, color: '#475569', fontWeight: 600 }}>{day}</span>
                  <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, count * 15)}%`, height: '100%', background: day === pattern.mostFrequentAbsentDay && count > 1 ? '#ef4444' : '#4f46e5', borderRadius: 6 }} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', fontWeight: 700, color: count > 0 ? '#0f172a' : '#94a3b8' }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
