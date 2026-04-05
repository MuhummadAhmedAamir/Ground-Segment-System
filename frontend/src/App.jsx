import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import GroundController from './GroundController.jsx';
import MissionEngineerDashboard from './MissionEngineerDashboard.jsx';
import { decodeJwtPayload } from './jwt.js';

function logoutStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const payload = decodeJwtPayload(token);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      logoutStorage();
      return;
    }
    setSession({ token, role: payload?.role ?? localStorage.getItem('role') });
  }, []);

  function handleLogout() {
    logoutStorage();
    setSession(null);
  }

  if (!session) {
    return <Login onLoggedIn={setSession} />;
  }

  if (session.role === 'GROUND_STATION_OPERATOR') {
    return <GroundController onLogout={handleLogout} />;
  }

  if (session.role === 'MISSION_ENGINEER') {
    return <MissionEngineerDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="post-login-placeholder">
      <p>
        Logged in as <strong>{session.role ?? 'unknown role'}</strong>.
      </p>
      <p className="muted">Dashboard for this role is not built yet.</p>
      <button type="button" className="logout-button" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
