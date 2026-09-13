import React from 'react';
import { X, Check, Bell, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkRead, onMarkAllRead, onSelectStudent }) {
  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Critical':
        return <ShieldAlert size={18} color="#ef4444" />;
      case 'Alert':
      case 'Warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'Success':
        return <CheckCircle2 size={18} color="#10b981" />;
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>In-App Notifications</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Attendance alerts & continuous absence notices</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              onClick={onMarkAllRead} 
              className="btn btn-outline" 
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              title="Mark all as read"
            >
              <Check size={14} /> Mark all read
            </button>
            <button 
              onClick={onClose}
              style={{ background: '#f1f5f9', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Bell size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 600 }}>No notifications at this moment.</p>
              <p style={{ fontSize: '0.8125rem' }}>All student attendance states are normal.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                style={{
                  padding: '14px',
                  borderRadius: 12,
                  background: notif.is_read ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${notif.is_read ? '#e2e8f0' : '#c7d2fe'}`,
                  display: 'flex',
                  gap: 12,
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ marginTop: 2 }}>{getTypeIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: notif.is_read ? 600 : 700, color: '#0f172a' }}>
                      {notif.title}
                    </span>
                    {!notif.is_read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' }} />
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 4 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {notif.student_id && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectStudent(notif.student_id);
                          }}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          View Profile →
                        </button>
                      )}
                      {!notif.is_read && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
