import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CalendarCheck, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Users, 
  Bell, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({ user, activePage, setActivePage, onLogout, unreadCount, onOpenNotifications }) {
  if (!user) return null;

  const role = user.role;

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 20px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setActivePage('dashboard')}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #4f46e5, #1e1b4b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SmartAttend
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligent Attendance
            </div>
          </div>
        </div>

        {/* Navigation links based on role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button 
            className={`btn ${activePage === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '8px 14px' }}
            onClick={() => setActivePage('dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </button>

          {(role === 'Admin' || role === 'Teacher') && (
            <button 
              className={`btn ${activePage === 'mark-attendance' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', padding: '8px 14px' }}
              onClick={() => setActivePage('mark-attendance')}
            >
              <CalendarCheck size={17} />
              <span>Mark Attendance</span>
            </button>
          )}

          {(role === 'Admin' || role === 'Teacher') && (
            <button 
              className={`btn ${activePage === 'continuous-absent' ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', padding: '8px 14px' }}
              onClick={() => setActivePage('continuous-absent')}
            >
              <AlertTriangle size={17} color={activePage === 'continuous-absent' ? 'white' : '#f59e0b'} />
              <span>Absence Streaks</span>
            </button>
          )}

          <button 
            className={`btn ${activePage === 'leaves' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '8px 14px' }}
            onClick={() => setActivePage('leaves')}
          >
            <FileText size={17} />
            <span>Leaves</span>
          </button>

          <button 
            className={`btn ${activePage === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', padding: '8px 14px' }}
            onClick={() => setActivePage('analytics')}
          >
            <BarChart3 size={17} />
            <span>Analytics & Leaderboard</span>
          </button>
        </nav>

        {/* User profile, notifications, logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          
          {/* Notification Bell */}
          <button 
            onClick={onOpenNotifications}
            style={{ position: 'relative', background: '#f1f5f9', border: 'none', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
            title="In-App Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: 'white', fontSize: '0.6875rem', fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* User badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: role === 'Admin' ? '#6366f1' : role === 'Teacher' ? '#0ea5e9' : '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>{user.name}</span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b' }}>
                {role === 'Admin' ? '👑 Admin' : role === 'Teacher' ? '👨‍🏫 Faculty' : '🎓 Student'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={onLogout}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center' }}
            title="Sign Out"
          >
            <LogOut size={19} />
          </button>
        </div>

      </div>
    </header>
  );
}
