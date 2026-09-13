import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@smartattend.edu');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      localStorage.setItem('smartattend_token', data.token);
      localStorage.setItem('smartattend_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #eef2ff, #f8fafc)', padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#ffffff', borderRadius: 24, padding: 36, boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 12, boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)' }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            SmartAttend
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4 }}>
            Intelligent Attendance & Absence Monitoring System
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b', fontSize: '0.875rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: 42 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartattend.edu"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: 42 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: 8 }}
          >
            {loading ? 'Authenticating...' : 'Sign In to SmartAttend'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: 12 }}>
            Instant Demo One-Click Access
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('admin@smartattend.edu', 'admin123')}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('teacher@smartattend.edu', 'teacher123')}
            >
              👨‍🏫 Teacher (CSE)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('mukil@smartattend.edu', 'student123')}
            >
              🎓 Mukil (Streak 4)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('mousiga@smartattend.edu', 'student123')}
            >
              🎓 Mousiga (Top 98%)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('ajay@smartattend.edu', 'student123')}
            >
              🎓 Ajay (Warning 70%)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.75rem', padding: '8px 10px', justifyContent: 'flex-start' }}
              onClick={() => setDemoUser('kumar@smartattend.edu', 'student123')}
            >
              🎓 Kumar (Critical 55%)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
