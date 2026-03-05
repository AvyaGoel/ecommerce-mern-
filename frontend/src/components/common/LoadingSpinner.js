import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  const s = size === 'small' ? 24 : size === 'large' ? 56 : 36;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '40px' }}>
      <div style={{ width: s, height: s, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;