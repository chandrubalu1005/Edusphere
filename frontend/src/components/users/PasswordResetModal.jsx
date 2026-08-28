import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Icon, ICONS } from '../Layout.jsx';

const ADMIN_API = import.meta.env.VITE_ADMIN_API || 'http://localhost:3015/api';

export default function PasswordResetModal({ userId, isOpen, onClose }) {
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  const resetMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ADMIN_API}/users/${id}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setTemporaryPassword(data.temporaryPassword);
      toast.success('Password reset successfully');
    },
    onError: (err) => {
      toast.error(err.message);
      onClose();
    }
  });

  const handleReset = () => {
    resetMutation.mutate(userId);
  };

  const handleClose = () => {
    setTemporaryPassword(null);
    resetMutation.reset();
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(temporaryPassword);
    toast.success('Copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div className="modal-title">Reset Password?</div>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <Icon d={ICONS.x} size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          {!temporaryPassword ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ margin: '0 auto', width: 48, height: 48, borderRadius: '50%', background: 'rgba(234,88,12,0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
                This will invalidate the user's existing password/session according to the security policy and start a secure reset flow.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button onClick={handleClose} className="btn btn-outline">
                  Cancel
                </button>
                <button 
                  onClick={handleReset}
                  disabled={resetMutation.isPending}
                  className="btn btn-primary"
                  style={{ background: 'var(--danger)' }}
                >
                  {resetMutation.isPending ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ margin: '0 auto', width: 48, height: 48, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
                Password reset successfully. Please securely communicate the temporary password to the user.
              </p>
              <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, letterSpacing: 2, color: 'var(--text-1)' }}>
                  {temporaryPassword}
                </div>
                <button onClick={copyToClipboard} className="btn btn-ghost btn-sm" style={{ color: 'var(--secondary)' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: 6 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Password
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button onClick={handleClose} className="btn btn-primary" style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
