import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function LeaveRequestsPage({ user, onSelectStudent }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [actionMsg, setActionMsg] = useState('');

  const isFaculty = user.role === 'Admin' || user.role === 'Teacher';

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaveRequests();
      setRequests(data.requests);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const comments = prompt('Enter approval note (optional):', 'Approved as requested.') || 'Approved';
    try {
      await api.approveLeave(id, comments);
      setActionMsg('Leave request approved. Attendance records synchronized to Leave status.');
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    const comments = prompt('Enter reason for rejection:', 'Insufficient justification or attendance below threshold.');
    if (comments === null) return;
    try {
      await api.rejectLeave(id, comments);
      setActionMsg('Leave request rejected.');
      await loadRequests();
    } catch (err) {
      alert(err.message || 'Failed to reject leave');
    }
  };

  const filteredRequests = requests.filter((r) => filter === 'All' || r.status === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={28} color="#4f46e5" />
            Feature 9: Student Leave Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 2 }}>
            {isFaculty ? 'Review, approve, or reject student leave requests with automatic attendance sync' : 'Track your submitted leave requests and review status'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 12, gap: 4 }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              className={`btn ${filter === tab ? 'btn-primary' : 'btn-outline'}`}
              style={{ border: 'none', padding: '6px 14px', fontSize: '0.8125rem' }}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '12px 18px', color: '#065f46', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Feedback</th>
                {isFaculty && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    Loading leave requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                    No leave requests found under the '{filter}' filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.roll_number} | {req.class_name}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{req.leave_type}</span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {req.start_date} → {req.end_date}
                    </td>
                    <td style={{ maxWidth: 260, fontSize: '0.8125rem', color: '#334155' }}>
                      {req.reason}
                    </td>
                    <td>
                      <span className={`badge ${req.status === 'Approved' ? 'badge-safe' : req.status === 'Rejected' ? 'badge-critical' : 'badge-warning'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {req.reviewer_comments || 'Pending review'}
                    </td>
                    {isFaculty && (
                      <td>
                        {req.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success"
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            onClick={() => onSelectStudent(req.student_id)}
                          >
                            <Eye size={13} /> Dossier
                          </button>
                        )}
                      </td>
                    )}
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
