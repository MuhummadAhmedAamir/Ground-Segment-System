import { useCallback, useEffect, useState } from 'react';
import { authJsonHeaders, parseJsonResponse } from './api.js';

const MOCK_MCE_REQUESTS = [
  {
    id: 'mce-1',
    label: 'Scheduled pass — Orion-Alpha',
    state_id: 1,
    dish_id: 1,
    gs_id: 1,
    status: 'pending',
  },
  {
    id: 'mce-2',
    label: 'Telemetry window — Star-01',
    state_id: 2,
    dish_id: 2,
    gs_id: 2,
    status: 'pending',
  },
];

export default function GroundController({ onLogout }) {
  const [satellites, setSatellites] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedSat, setSelectedSat] = useState(null);
  const [dishId, setDishId] = useState('');
  const [windowOpen, setWindowOpen] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [accessId, setAccessId] = useState(null);
  const [transmissionOn, setTransmissionOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [mceRequests, setMceRequests] = useState(MOCK_MCE_REQUESTS);

  const selectedDish = dishes.find((d) => String(d.dish_id) === String(dishId));
  const gsId = selectedDish?.gs_id;

  const loadSatellites = useCallback(async () => {
    const res = await fetch('/satellite/', { headers: authJsonHeaders() });
    const data = await parseJsonResponse(res);
    setSatellites(Array.isArray(data) ? data : []);
  }, []);

  const loadDishes = useCallback(async () => {
    const res = await fetch('/ground/dishes', { headers: authJsonHeaders() });
    const data = await parseJsonResponse(res);
    const list = Array.isArray(data) ? data : [];
    setDishes(list);
    setDishId((prev) => (prev !== '' && prev != null ? prev : list.length ? String(list[0].dish_id) : ''));
  }, []);

  useEffect(() => {
    loadSatellites();
    loadDishes();
  }, [loadSatellites, loadDishes]);

  const runCheck = useCallback(async () => {
    if (!selectedSat || !dishId || gsId == null) {
      setWindowOpen(false);
      setCheckError('');
      return;
    }
    setCheckError('');
    try {
      const res = await fetch('/window/check', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          dish_id: Number(dishId),
          state_id: selectedSat.state_id,
          gs_id: gsId,
        }),
      });
      const data = await res.json();
      if (data.open) {
        setWindowOpen(true);
        setCheckError('');
      } else {
        setWindowOpen(false);
        setCheckError(data.error || 'Window closed');
      }
    } catch {
      setWindowOpen(false);
      setCheckError('Check failed');
    }
  }, [selectedSat, dishId, gsId]);

  useEffect(() => {
    runCheck();
    const t = setInterval(runCheck, 4000);
    return () => clearInterval(t);
  }, [runCheck]);

  async function adjustAngle(deltaSign) {
    if (!selectedSat || !dishId) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/window/dish', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          dish_id: Number(dishId),
          state_id: selectedSat.state_id,
          sign: deltaSign,
        }),
      });
      await parseJsonResponse(res);
      await loadDishes();
      await runCheck();
    } catch (e) {
      setMsg(e.message || 'Angle adjust failed');
    } finally {
      setBusy(false);
    }
  }

  async function startTransaction() {
    if (!selectedSat || !dishId || gsId == null || !windowOpen) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/window/', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          dish_id: Number(dishId),
          state_id: selectedSat.state_id,
          gs_id: gsId,
        }),
      });
      const openData = await parseJsonResponse(res);
      const aid = openData.access_id;
      if (aid == null) {
        throw new Error('No access_id from server');
      }
      setAccessId(aid);

      const beginRes = await fetch('/window/begin', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ access_id: aid }),
      });
      await parseJsonResponse(beginRes);
      setTransmissionOn(true);
    } catch (e) {
      setMsg(e.message || 'Start failed');
      setAccessId(null);
      setTransmissionOn(false);
    } finally {
      setBusy(false);
    }
  }

  async function endTransaction() {
    if (accessId == null) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch('/window/end', {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ access_id: accessId }),
      });
      await parseJsonResponse(res);
      setTransmissionOn(false);
      setAccessId(null);
      await runCheck();
    } catch (e) {
      setMsg(e.message || 'End failed');
    } finally {
      setBusy(false);
    }
  }

  function applyRequest(req) {
    setSelectedSat(
      satellites.find((s) => s.state_id === req.state_id) || {
        state_id: req.state_id,
        sat_id: null,
        model_name: '(from request)',
      }
    );
    setDishId(String(req.dish_id));
    setMsg('');
  }

  function setRequestStatus(id, status) {
    setMceRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div className="gc-page">
      <header className="gc-header">
        <h1 className="gc-title">Ground control</h1>
        <button type="button" className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </header>

      <div className="gc-grid">
        <section className="gc-panel">
          <h2 className="gc-panel-title">Satellites</h2>
          <div className="gc-scroll">
            {satellites.length === 0 ? (
              <p className="gc-muted">No satellites loaded.</p>
            ) : (
              <ul className="gc-list">
                {satellites.map((s) => (
                  <li key={s.sat_id}>
                    <button
                      type="button"
                      className={`gc-list-item ${selectedSat?.sat_id === s.sat_id ? 'gc-list-item--active' : ''}`}
                      onClick={() => {
                        setSelectedSat(s);
                        setAccessId(null);
                        setTransmissionOn(false);
                      }}
                    >
                      <span className="gc-list-name">{s.model_name}</span>
                      <span className="gc-list-meta">#{s.sat_id}</span>
                      <span className="gc-list-meta">θ {s.theta_deg}</span>
                      <span className="gc-list-meta">alt {s.altitude_km} km</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="gc-panel gc-panel--main">
          <h2 className="gc-panel-title">Alignment &amp; pass</h2>
          <label className="login-label">
            Dish
            <select
              className="login-input"
              value={dishId}
              onChange={(e) => {
                setDishId(e.target.value);
                setAccessId(null);
                setTransmissionOn(false);
              }}
            >
              {dishes.map((d) => (
                <option key={d.dish_id} value={d.dish_id}>
                  Dish {d.dish_id} (GS {d.gs_id}) — el {d.elevation_angle}°
                </option>
              ))}
            </select>
          </label>

          {selectedSat ? (
            <p className="gc-selected">
              Selected: <strong>{selectedSat.model_name}</strong> — state_id {selectedSat.state_id}
            </p>
          ) : (
            <p className="gc-muted">Select a satellite from the list.</p>
          )}

          <div className="gc-angle-row">
            <button
              type="button"
              className="gc-icon-btn"
              disabled={busy || !selectedSat || !dishId}
              onClick={() => adjustAngle(-1)}
              title="Increase elevation"
            >
              +
            </button>
            <button
              type="button"
              className="gc-icon-btn"
              disabled={busy || !selectedSat || !dishId}
              onClick={() => adjustAngle(1)}
              title="Decrease elevation"
            >
              −
            </button>
          </div>

          <div className="gc-status-row">
            <span className={`gc-open-badge ${windowOpen ? 'gc-open-badge--on' : ''}`}>OPEN</span>
            <button
              type="button"
              className={`gc-start-btn ${windowOpen && !transmissionOn ? 'gc-start-btn--ready' : ''}`}
              disabled={busy || !windowOpen || transmissionOn || !selectedSat}
              onClick={startTransaction}
            >
              Start transaction
            </button>
          </div>

          <button
            type="button"
            className="login-button gc-end-btn"
            disabled={busy || !transmissionOn}
            onClick={endTransaction}
          >
            End transaction
          </button>

          {checkError && !windowOpen ? <p className="gc-hint">{checkError}</p> : null}
          {msg ? <p className="login-error">{msg}</p> : null}
        </section>

        <section className="gc-panel">
          <h2 className="gc-panel-title">MCE requests</h2>
          <div className="gc-scroll">
            <ul className="gc-req-list">
              {mceRequests.map((r) => (
                <li key={r.id} className="gc-req-card">
                  <p className="gc-req-label">{r.label}</p>
                  <p className="gc-req-meta">
                    state {r.state_id} · dish {r.dish_id} · GS {r.gs_id}
                  </p>
                  <div className="gc-req-actions">
                    <button type="button" className="gc-req-load" onClick={() => applyRequest(r)}>
                      Load
                    </button>
                    <button
                      type="button"
                      className="gc-req-fail"
                      disabled={r.status !== 'pending'}
                      onClick={() => setRequestStatus(r.id, 'failed')}
                    >
                      Failed
                    </button>
                    <button
                      type="button"
                      className="gc-req-ok"
                      disabled={r.status !== 'pending' || !windowOpen}
                      onClick={() => setRequestStatus(r.id, 'successful')}
                    >
                      Successful
                    </button>
                  </div>
                  {r.status !== 'pending' ? (
                    <p className="gc-req-status">{r.status}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
