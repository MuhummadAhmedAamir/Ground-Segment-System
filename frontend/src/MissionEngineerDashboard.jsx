import { useCallback, useEffect, useState } from 'react';
import { authJsonHeaders, parseJsonResponse } from './api.js';

function Modal({ title, children, onClose }) {
  return (
    <div className="mce-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="mce-modal"
        role="dialog"
        aria-labelledby="mce-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="mce-modal-title" className="mce-modal-title">
          {title}
        </h3>
        {children}
        <button type="button" className="mce-modal-close" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MissionEngineerDashboard({ onLogout }) {
  const [missions, setMissions] = useState([]);
  const [satellites, setSatellites] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);
  const [debrisRows, setDebrisRows] = useState([]);
  const [debrisWarnings, setDebrisWarnings] = useState([]);
  const [debrisLoading, setDebrisLoading] = useState(false);
  const [debrisError, setDebrisError] = useState('');
  const [pendingPlans, setPendingPlans] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const [missionModal, setMissionModal] = useState(false);
  const [satModal, setSatModal] = useState(false);
  const [maneuverModal, setManeuverModal] = useState(false);
  const [gcModal, setGcModal] = useState(false);

  const [mccId, setMccId] = useState('1');
  const [missionName, setMissionName] = useState('');
  const [missionGoal, setMissionGoal] = useState('');
  const [startDate, setStartDate] = useState('');

  const [addMissionId, setAddMissionId] = useState('');
  const [modelName, setModelName] = useState('');
  const [satStatus, setSatStatus] = useState('ACTIVE');
  const [orbitId, setOrbitId] = useState('1');
  const [fuelLevel, setFuelLevel] = useState('500');
  const [velocity, setVelocity] = useState('7.8');

  const [targetOrbit, setTargetOrbit] = useState('2');
  const [thrustValue, setThrustValue] = useState('10');

  const [gcLabel, setGcLabel] = useState('');
  const [gcStateId, setGcStateId] = useState('');
  const [gcDishId, setGcDishId] = useState('1');
  const [gcGsId, setGcGsId] = useState('1');

  const loadMissions = useCallback(async () => {
    const res = await fetch('/missions/', { headers: authJsonHeaders() });
    const data = await parseJsonResponse(res);
    setMissions(Array.isArray(data) ? data : []);
  }, []);

  const loadSatellites = useCallback(async () => {
    const res = await fetch('/satellite/engineer/all', { headers: authJsonHeaders() });
    const data = await parseJsonResponse(res);
    setSatellites(Array.isArray(data) ? data : []);
  }, []);

  const loadPendingPlans = useCallback(async (satId) => {
    if (!satId) {
      setPendingPlans([]);
      return;
    }
    const res = await fetch(`/plan/pending/satellite/${satId}`, { headers: authJsonHeaders() });
    const data = await parseJsonResponse(res);
    setPendingPlans(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    loadMissions();
    loadSatellites();
  }, [loadMissions, loadSatellites]);

  useEffect(() => {
    if (selectedSat?.sat_id != null) {
      loadPendingPlans(selectedSat.sat_id);
    }
  }, [selectedSat, loadPendingPlans]);

  async function fetchDebrisForSat(sat) {
    if (!sat?.sat_id) return;
    setDebrisLoading(true);
    setDebrisError('');
    try {
      const res = await fetch(`/debris/check/${sat.sat_id}`, {
        method: 'POST',
        headers: authJsonHeaders(),
      });
      const data = await parseJsonResponse(res);
      setDebrisRows(Array.isArray(data.observations) ? data.observations : []);
      setDebrisWarnings(Array.isArray(data.warnings) ? data.warnings : []);
    } catch (e) {
      setDebrisRows([]);
      setDebrisWarnings([]);
      setDebrisError(e.message || 'Debris check failed');
    } finally {
      setDebrisLoading(false);
    }
  }

  function selectSatellite(sat) {
    setSelectedSat(sat);
    setDebrisRows([]);
    setDebrisWarnings([]);
    setDebrisError('');
    fetchDebrisForSat(sat);
  }

  async function submitMission(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/missions/', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          mcc_id: Number(mccId),
          mission_name: missionName,
          mission_goal: missionGoal,
          start_date: startDate,
        }),
      });
      await parseJsonResponse(res);
      setMissionModal(false);
      setMissionName('');
      setMissionGoal('');
      setStartDate('');
      await loadMissions();
    } catch (err) {
      setMsg(err.message || 'Could not create mission');
    } finally {
      setBusy(false);
    }
  }

  async function submitSatellite(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(`/missions/${addMissionId}/satellites`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          model_name: modelName,
          status: satStatus,
          orbit_id: Number(orbitId),
          fuel_level: Number(fuelLevel),
          velocity: Number(velocity),
        }),
      });
      await parseJsonResponse(res);
      setSatModal(false);
      setModelName('');
      await loadSatellites();
      await loadMissions();
    } catch (err) {
      setMsg(err.message || 'Could not add satellite');
    } finally {
      setBusy(false);
    }
  }

  async function submitManeuver(e) {
    e.preventDefault();
    if (!selectedSat) return;
    setBusy(true);
    setMsg('');
    try {
      const planRes = await fetch('/plan/', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          sat_id: selectedSat.sat_id,
          target_orbit: Number(targetOrbit),
          thrust_value: Number(thrustValue),
        }),
      });
      const planData = await parseJsonResponse(planRes);
      const planId = planData.plan_id;
      if (planId == null) throw new Error('No plan_id returned');

      const execRes = await fetch(`/maneuver/${planId}/execute`, {
        method: 'POST',
        headers: authJsonHeaders(),
      });
      await parseJsonResponse(execRes);
      setManeuverModal(false);
      await loadSatellites();
      await loadMissions();
      const allRes = await fetch('/satellite/engineer/all', { headers: authJsonHeaders() });
      const allRows = await parseJsonResponse(allRes);
      const updated = Array.isArray(allRows)
        ? allRows.find((x) => x.sat_id === selectedSat.sat_id)
        : null;
      if (updated) {
        setSelectedSat(updated);
        await loadPendingPlans(updated.sat_id);
        fetchDebrisForSat(updated);
      }
    } catch (err) {
      setMsg(err.message || 'Maneuver failed');
    } finally {
      setBusy(false);
    }
  }

  async function submitGcRequest(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/gc-requests/', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          label: gcLabel || 'Ground pass request',
          state_id: Number(gcStateId),
          dish_id: Number(gcDishId),
          gs_id: Number(gcGsId),
        }),
      });
      await parseJsonResponse(res);
      setGcModal(false);
      setGcLabel('');
    } catch (err) {
      setMsg(err.message || 'Could not send request');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (selectedSat?.state_id != null) {
      setGcStateId(String(selectedSat.state_id));
    }
  }, [selectedSat]);

  function isSatActive(status) {
    const s = (status || '').toUpperCase();
    return s.includes('ACTIVE');
  }

  return (
    <div className="mce-page">
      <header className="gc-header">
        <h1 className="gc-title">Mission control engineer</h1>
        <button type="button" className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </header>

      {msg ? <p className="login-error mce-banner">{msg}</p> : null}

      <div className="mce-grid">
        <section className="gc-panel mce-panel">
          <div className="mce-panel-head">
            <h2 className="gc-panel-title">Missions</h2>
            <button type="button" className="mce-add-btn" onClick={() => setMissionModal(true)}>
              New mission
            </button>
          </div>
          <div className="gc-scroll">
            {missions.length === 0 ? (
              <p className="gc-muted">No missions.</p>
            ) : (
              <ul className="mce-mission-list">
                {missions.map((m) => (
                  <li key={m.mission_id} className="mce-mission-card">
                    <div className="mce-mission-name">{m.mission_name}</div>
                    <div className="mce-mission-meta">MCC {m.mcc_id} · starts {m.start_date}</div>
                    <div className="mce-mission-status">
                      Status:{' '}
                      <strong>
                        {m.active_satellite_count ?? 0}/{m.satellite_count ?? 0} active satellites
                      </strong>
                    </div>
                    <p className="mce-mission-goal">{m.mission_goal}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="gc-panel mce-panel">
          <div className="mce-panel-head">
            <h2 className="gc-panel-title">Satellites</h2>
            <button type="button" className="mce-add-btn" onClick={() => setSatModal(true)}>
              Add satellite
            </button>
          </div>
          <div className="gc-scroll">
            {satellites.length === 0 ? (
              <p className="gc-muted">No satellites.</p>
            ) : (
              <ul className="gc-list">
                {satellites.map((s) => (
                  <li key={s.sat_id}>
                    <button
                      type="button"
                      className={`gc-list-item ${selectedSat?.sat_id === s.sat_id ? 'gc-list-item--active' : ''}`}
                      onClick={() => selectSatellite(s)}
                    >
                      <span className="gc-list-name">{s.model_name}</span>
                      <span
                        className={`mce-status-pill ${isSatActive(s.status) ? 'mce-status-pill--active' : 'mce-status-pill--inactive'}`}
                      >
                        {isSatActive(s.status) ? 'Active' : 'Inactive'}
                      </span>
                      <span className="gc-list-meta">#{s.sat_id}</span>
                      <span className="gc-list-meta">orbit {s.orbit_id}</span>
                      <span className="gc-list-meta">θ {s.theta_deg}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mce-actions">
            <button
              type="button"
              className="login-button"
              disabled={!selectedSat || busy}
              onClick={() => setManeuverModal(true)}
            >
              Carry out maneuver
            </button>
            <button
              type="button"
              className="mce-secondary-btn"
              disabled={!selectedSat || busy}
              onClick={() => fetchDebrisForSat(selectedSat)}
            >
              Refresh debris check
            </button>
          </div>

          {selectedSat ? (
            <div className="mce-debris-block">
              <h3 className="mce-subtitle">
                Debris vs satellite #{selectedSat.sat_id} ({selectedSat.model_name})
              </h3>
              {debrisLoading ? <p className="gc-muted">Loading…</p> : null}
              {debrisError ? <p className="login-error">{debrisError}</p> : null}
              {!debrisLoading && debrisRows.length === 0 && !debrisError ? (
                <p className="gc-muted">No same-orbit debris pairs (or empty result).</p>
              ) : null}
              {debrisRows.length > 0 ? (
                <div className="mce-table-wrap">
                  <table className="mce-table">
                    <thead>
                      <tr>
                        <th>Orbit ID</th>
                        <th>Debris ID</th>
                        <th>Sat θ (°)</th>
                        <th>Debris θ (°)</th>
                        <th>Angular sep. (°)</th>
                        <th>Distance metric</th>
                        <th>Danger radius (km)</th>
                        <th>Risk level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debrisRows.map((row, i) => (
                        <tr key={`${row.debris_id}-${i}`}>
                          <td>{row.orbit_id}</td>
                          <td>{row.debris_id}</td>
                          <td>{row.sat_theta_deg}</td>
                          <td>{row.debris_theta_deg}</td>
                          <td>{row.angular_separation_deg}</td>
                          <td>{row.distance_metric}</td>
                          <td>{row.danger_radius_km}</td>
                          <td>{row.debris_risk_level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {debrisWarnings.length > 0 ? (
                <ul className="mce-warnings">
                  {debrisWarnings.map((w, i) => (
                    <li key={i}>
                      Debris {w.debris_id}: {w.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {selectedSat && pendingPlans.length > 0 ? (
            <p className="gc-hint mce-plans-hint">
              Pending plans for this satellite:{' '}
              {pendingPlans.map((p) => `#${p.plan_id} → orbit ${p.target_orbit}`).join(', ')}
            </p>
          ) : null}
        </section>

        <section className="gc-panel mce-panel">
          <div className="mce-panel-head">
            <h2 className="gc-panel-title">Requests to ground control</h2>
            <button type="button" className="mce-add-btn" onClick={() => setGcModal(true)}>
              New request
            </button>
          </div>
          <p className="gc-muted mce-help">
            Create a pass / comm window request for GC. Optionally select a satellite first to fill
            state_id.
          </p>
        </section>
      </div>

      {missionModal ? (
        <Modal title="Create mission" onClose={() => !busy && setMissionModal(false)}>
          <form className="mce-form" onSubmit={submitMission}>
            <label className="login-label">
              MCC ID (1 or 2)
              <input
                className="login-input"
                value={mccId}
                onChange={(e) => setMccId(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Mission name
              <input
                className="login-input"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Mission goal
              <textarea
                className="login-input mce-textarea"
                rows={3}
                value={missionGoal}
                onChange={(e) => setMissionGoal(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Start date (YYYY-MM-DD)
              <input
                className="login-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-button" disabled={busy}>
              Create
            </button>
          </form>
        </Modal>
      ) : null}

      {satModal ? (
        <Modal title="Add satellite to mission" onClose={() => !busy && setSatModal(false)}>
          <form className="mce-form" onSubmit={submitSatellite}>
            <label className="login-label">
              Mission ID
              <input
                className="login-input"
                value={addMissionId}
                onChange={(e) => setAddMissionId(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Model name
              <input
                className="login-input"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Status
              <select
                className="login-input"
                value={satStatus}
                onChange={(e) => setSatStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SAFE_MODE">SAFE_MODE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
            <label className="login-label">
              Orbit ID
              <input
                className="login-input"
                value={orbitId}
                onChange={(e) => setOrbitId(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Fuel level
              <input
                className="login-input"
                value={fuelLevel}
                onChange={(e) => setFuelLevel(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Velocity (km/s)
              <input
                className="login-input"
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-button" disabled={busy}>
              Add satellite
            </button>
          </form>
        </Modal>
      ) : null}

      {maneuverModal ? (
        <Modal title="Maneuver satellite" onClose={() => !busy && setManeuverModal(false)}>
          <p className="gc-muted">
            Creates a pending maneuver plan, then executes it immediately for satellite #
            {selectedSat?.sat_id}.
          </p>
          <form className="mce-form" onSubmit={submitManeuver}>
            <label className="login-label">
              Target orbit
              <input
                className="login-input"
                value={targetOrbit}
                onChange={(e) => setTargetOrbit(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Thrust value
              <input
                className="login-input"
                value={thrustValue}
                onChange={(e) => setThrustValue(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-button" disabled={busy}>
              Create plan &amp; execute
            </button>
          </form>
        </Modal>
      ) : null}

      {gcModal ? (
        <Modal title="Request to ground control" onClose={() => !busy && setGcModal(false)}>
          <form className="mce-form" onSubmit={submitGcRequest}>
            <label className="login-label">
              Label
              <input
                className="login-input"
                value={gcLabel}
                onChange={(e) => setGcLabel(e.target.value)}
                placeholder="e.g. Scheduled pass — Orion"
              />
            </label>
            <label className="login-label">
              State ID (satellite state)
              <input
                className="login-input"
                value={gcStateId}
                onChange={(e) => setGcStateId(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Dish ID
              <input
                className="login-input"
                value={gcDishId}
                onChange={(e) => setGcDishId(e.target.value)}
                required
              />
            </label>
            <label className="login-label">
              Ground station ID
              <input
                className="login-input"
                value={gcGsId}
                onChange={(e) => setGcGsId(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="login-button" disabled={busy}>
              Send to GC
            </button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
