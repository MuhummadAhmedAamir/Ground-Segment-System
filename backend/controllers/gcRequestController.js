const store = require('../stores/gcRequestStore');

function listGcRequests(req, res) {
  try {
    res.json(store.list());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createGcRequest(req, res) {
  try {
    const { label, state_id, dish_id, gs_id } = req.body;
    if (state_id == null || dish_id == null || gs_id == null) {
      return res.status(400).json({ error: 'state_id, dish_id, and gs_id are required' });
    }
    const row = store.create({
      label,
      state_id,
      dish_id,
      gs_id,
      created_by: req.user?.user_id,
    });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function patchGcRequest(req, res) {
  try {
    const { status } = req.body;
    if (!['failed', 'successful'].includes(status)) {
      return res.status(400).json({ error: 'status must be failed or successful' });
    }
    const row = store.updateStatus(req.params.id, status);
    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listGcRequests, createGcRequest, patchGcRequest };
