import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', badgeText, badgeColor = 'emerald' }) {
  const colorMap = {
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    emerald: { bg: '#ecfdf5', text: '#10b981' },
    amber: { bg: '#fffbeb', text: '#f59e0b' },
    rose: { bg: '#fef2f2', text: '#ef4444' },
    sky: { bg: '#f0f9ff', text: '#0ea5e9' }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ width: 38, height: 38, borderRadius: 10, background: scheme.bg, color: scheme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {badgeText && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: badgeColor === 'emerald' ? '#ecfdf5' : badgeColor === 'rose' ? '#fef2f2' : '#fffbeb', color: badgeColor === 'emerald' ? '#065f46' : badgeColor === 'rose' ? '#991b1b' : '#92400e' }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
