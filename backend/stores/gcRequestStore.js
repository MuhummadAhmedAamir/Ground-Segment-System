/** In-memory MCE → GC pass requests (replace with DB table when needed). */
let nextId = 1;
const requests = [];

function list() {
  return [...requests].sort((a, b) => b.id - a.id);
}

function create({ label, state_id, dish_id, gs_id, created_by }) {
  const row = {
    id: nextId++,
    label: label || 'Pass request',
    state_id: Number(state_id),
    dish_id: Number(dish_id),
    gs_id: Number(gs_id),
    status: 'pending',
    created_at: new Date().toISOString(),
    created_by: created_by ?? null,
  };
  requests.push(row);
  return row;
}

function updateStatus(id, status) {
  const n = Number(id);
  const row = requests.find((r) => r.id === n);
  if (!row) return null;
  if (!['pending', 'failed', 'successful'].includes(status)) return null;
  row.status = status;
  return row;
}

module.exports = { list, create, updateStatus };
