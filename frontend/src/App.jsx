import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NotificationDrawer from './components/NotificationDrawer';
import StudentProfileModal from './components/StudentProfileModal';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MarkAttendancePage from './pages/MarkAttendancePage';
import ContinuousAbsentPage from './pages/ContinuousAbsentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaveRequestsPage from './pages/LeaveRequestsPage';

import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartattend_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activePage, setActivePage] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Optional polling every 20 seconds for alerts
      const interval = setInterval(loadNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smartattend_token');
    localStorage.removeItem('smartattend_user');
    setUser(null);
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar
        user={user}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {activePage === 'dashboard' && (
          user.role === 'Admin' ? (
            <AdminDashboard onSelectStudent={setSelectedStudentId} onNavigate={setActivePage} />
          ) : user.role === 'Teacher' ? (
            <TeacherDashboard user={user} onSelectStudent={setSelectedStudentId} onNavigate={setActivePage} />
          ) : (
            <StudentDashboard user={user} onNavigate={setActivePage} />
          )
        )}

        {activePage === 'mark-attendance' && (
          <MarkAttendancePage onSelectStudent={setSelectedStudentId} />
        )}

        {activePage === 'continuous-absent' && (
          <ContinuousAbsentPage onSelectStudent={setSelectedStudentId} />
        )}

        {activePage === 'leaves' && (
          <LeaveRequestsPage user={user} onSelectStudent={setSelectedStudentId} />
        )}

        {activePage === 'analytics' && (
          <AnalyticsPage onSelectStudent={setSelectedStudentId} />
        )}
      </main>

      {/* Slide-over Notifications */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifRead}
        onSelectStudent={setSelectedStudentId}
      />

      {/* Feature 10: 360-Degree Smart Student Profile Dossier Modal */}
      <StudentProfileModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
}
