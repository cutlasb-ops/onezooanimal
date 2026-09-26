import { useState, useEffect } from 'react';
import { Key, ArrowLeft } from 'lucide-react';
import { FaunaPasswordAdmin } from './fauna/FaunaPasswordAdmin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FaunaAdminPanel({ isOpen, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [storedPassword] = useState(() => localStorage.getItem('fauna_admin_pass') || 'animal');

  if (!isOpen) return null;

  const handleAuthenticate = () => {
    setError(false);
    if (password === storedPassword) {
      setAuthenticated(true);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleClose = () => {
    setAuthenticated(false);
    setPassword('');
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a1628 0%, #0d2e14 50%, #1a1a0f 100%)',
          border: '1px solid rgba(245,166,35,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <Key size={18} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-50">Fauna Settings</h2>
            <p className="text-xs text-amber-200/35">Manage admin password & access</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="px-6 py-6">
          {!authenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-amber-200/50 mb-4">Enter your current Fauna admin password to access settings:</p>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  onKeyDown={e => e.key === 'Enter' && handleAuthenticate()}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-amber-50 placeholder-amber-200/20 outline-none focus:ring-1 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: error ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                  autoFocus
                />
                {error && <p className="text-xs text-red-400 mt-2">Incorrect password</p>}
              </div>

              <button
                onClick={handleAuthenticate}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(245,166,35,0.15)',
                  color: '#f5a623',
                  border: '1px solid rgba(245,166,35,0.25)',
                }}
              >
                Continue
              </button>
            </div>
          ) : (
            <div>
              <FaunaPasswordAdmin />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setAuthenticated(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(245,166,35,0.15)',
                    color: '#f5a623',
                    border: '1px solid rgba(245,166,35,0.25)',
                  }}
                >
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
