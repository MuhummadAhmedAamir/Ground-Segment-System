import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import { decodeJwtPayload } from './jwt.js';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = decodeJwtPayload(token);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return;
    }
    setSession({ token, role: payload?.role ?? localStorage.getItem('role') });
  }, []);

  if (!session) {
    return <Login onLoggedIn={setSession} />;
  }

  return (
    <div className="post-login-placeholder">
      <p>
        Logged in as <strong>{session.role ?? 'unknown role'}</strong>.
      </p>
      <p className="muted">Replace this block with role-specific dashboards next.</p>
      <button
        type="button"
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setSession(null);
        }}
      >
        Log out
      </button>
    </div>
  );
}
