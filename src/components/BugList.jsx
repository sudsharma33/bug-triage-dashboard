import { useState } from 'react';
import { bugRepository } from '../data/bugRepository.js';
import { useAuth } from '../auth/AuthContext.jsx';
import BugDetail from './BugDetail.jsx';
import BugForm from './BugForm.jsx';

function BugList({ bugs, onChange, loading }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedBug, setSelectedBug] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [busy, setBusy] = useState(false);

  const filteredBugs = bugs.filter((bug) => {
    if (statusFilter !== 'All' && bug.status !== statusFilter) return false;
    if (severityFilter !== 'All' && bug.severity !== severityFilter) return false;
    if (priorityFilter !== 'All' && bug.priority !== priorityFilter) return false;
    if (search) {
      const hay = [bug.id, bug.title, bug.module, bug.assignee, bug.buildNumber, bug.platform]
        .join(' ').toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  async function handleAddBug(bugData) {
    setBusy(true);
    try {
      await bugRepository.add({ ...bugData, createdBy: user?.uid });
      await onChange();
      setShowForm(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleEditBug(bugData) {
    setBusy(true);
    try {
      await bugRepository.update(editingBug.id, bugData);
      await onChange();
      setEditingBug(null);
      setSelectedBug(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteBug(id) {
    if (!window.confirm('Delete this bug? This cannot be undone.')) return;
    setBusy(true);
    try {
      await bugRepository.delete(id);
      await onChange();
      setSelectedBug(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleCloseBug() {
    if (!selectedBug) return;
    setBusy(true);
    try {
      await bugRepository.update(selectedBug.id, { status: 'Closed' });
      await onChange();
      setSelectedBug(null);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(bug) {
    setEditingBug(bug);
    setSelectedBug(null);
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Bugs</h1>
          <p>Log, filter, edit and close defects ({filteredBugs.length} of {bugs.length}).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={busy}>
          + New Bug
        </button>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search"
          placeholder="🔍 Search title, module, assignee, build…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="All">All Severities</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Fixed</option>
          <option>Closed</option>
          <option>Reopened</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option>P1</option>
          <option>P2</option>
          <option>P3</option>
          <option>P4</option>
        </select>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty"><div>Loading bugs…</div></div>
        ) : filteredBugs.length === 0 ? (
          <div className="empty">
            <div className="empty-emoji">🐞</div>
            <div>{bugs.length === 0 ? 'No bugs yet — log your first one!' : 'No bugs match your filters.'}</div>
          </div>
        ) : (
          <table className="bugs">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Module</th>
                <th>Assignee</th>
              </tr>
            </thead>
            <tbody>
              {filteredBugs.map((bug) => (
                <tr key={bug.id} onClick={() => setSelectedBug(bug)}>
                  <td><strong>{bug.id}</strong></td>
                  <td>{bug.title}</td>
                  <td><span className={`badge sev-${bug.severity}`}>{bug.severity}</span></td>
                  <td><span className="badge priority">{bug.priority}</span></td>
                  <td><span className={`badge st-${bug.status.replace(' ', '-')}`}>{bug.status}</span></td>
                  <td>{bug.module}</td>
                  <td>{bug.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedBug && (
        <BugDetail
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onEdit={() => startEdit(selectedBug)}
          onDelete={() => handleDeleteBug(selectedBug.id)}
          onCloseBug={handleCloseBug}
        />
      )}

      {showForm && (
        <BugForm
          onSubmit={handleAddBug}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingBug && (
        <BugForm
          initialBug={editingBug}
          onSubmit={handleEditBug}
          onCancel={() => setEditingBug(null)}
        />
      )}
    </section>
  );
}

export default BugList;
