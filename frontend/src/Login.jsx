import { useState } from 'react';
import { decodeJwtPayload } from './jwt.js';

export default function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      const { token } = data;
      if (!token) {
        setError('Invalid response from server');
        return;
      }
      const payload = decodeJwtPayload(token);
      const role = payload?.role ?? null;
      localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);
      onLoggedIn({ token, role });
    } catch {
      setError('Could not reach server. Is the backend running on port 3000?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Mission Control</h1>
        <p className="login-subtitle">Sign in with your credentials</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            Username
            <input
              className="login-input"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
