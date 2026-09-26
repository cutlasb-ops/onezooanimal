import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';

export function FaunaPasswordAdmin() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const defaultPass = localStorage.getItem('fauna_admin_pass') || 'animal';
    const isMatch = currentPass === defaultPass;
    setIsCorrect(isMatch);
  }, [currentPass]);

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const defaultPass = localStorage.getItem('fauna_admin_pass') || 'animal';

    if (currentPass !== defaultPass) {
      setMessage({ type: 'error', text: 'Current password is incorrect' });
      return;
    }

    if (!newPass || !confirmPass) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPass.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem('fauna_admin_pass', newPass);
      window.dispatchEvent(new CustomEvent('fauna-password-changed', { detail: { password: newPass } }));

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setLoading(false);

      setTimeout(() => setMessage(null), 4000);
    }, 300);
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
          <Lock size={18} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-50">Admin Password</h3>
          <p className="text-xs text-amber-200/40">Update your Fauna admin access password</p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-2 block">Current password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${isCorrect && currentPass ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                focusRing: '1px solid rgba(245,166,35,0.4)',
              }}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200/30 hover:text-amber-200/60 transition-colors"
            >
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {isCorrect && currentPass && (
            <p className="text-xs text-green-400/70 mt-1">Password verified</p>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-2 block">New password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              placeholder="Create new password"
            />
            <button
              type="button"
              onClick={() => setShowNew(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200/30 hover:text-amber-200/60 transition-colors"
            >
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-[10px] text-amber-200/30 mt-1">Minimum 4 characters</p>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-amber-200/30 font-bold mb-2 block">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: newPass && confirmPass === newPass && confirmPass ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              }}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200/30 hover:text-amber-200/60 transition-colors"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {newPass && confirmPass !== newPass && (
            <p className="text-xs text-red-400/70 mt-1">Passwords do not match</p>
          )}
        </div>

        {message && (
          <div
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg"
            style={{
              background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : message.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
              border: message.type === 'success' ? '1px solid rgba(34,197,94,0.2)' : message.type === 'error' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <AlertCircle size={14} style={{ color: message.type === 'success' ? '#34d399' : message.type === 'error' ? '#ef4444' : '#60a5fa', marginTop: '2px' }} className="shrink-0" />
            <p style={{ color: message.type === 'success' ? '#86efac' : message.type === 'error' ? '#fca5a5' : '#93c5fd' }} className="text-xs">
              {message.text}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isCorrect || loading || !newPass || !confirmPass}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(245,166,35,0.15)',
            color: '#f5a623',
            border: '1px solid rgba(245,166,35,0.25)',
          }}
        >
          <Save size={14} />
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-5 p-3.5 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <p className="text-[10px] text-blue-200/60 leading-relaxed">
          This password protects the Fauna admin panel. Keep it secure and don't share it with unauthorized users.
        </p>
      </div>
    </div>
  );
}
