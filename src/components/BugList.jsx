import { useState, useEffect } from 'react';
import { bugRepository } from '../data/bugRepository.js';
import BugDetail from './BugDetail.jsx';
import BugForm from './BugForm.jsx';

function BugList() {
  const [bugs, setBugs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedBug, setSelectedBug] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState(null);

  // Load bugs from repository on mount
  useEffect(() => {
    setBugs(bugRepository.getAll());
  }, []);

  const filteredBugs = bugs.filter((bug) => {
    const statusMatch = statusFilter === 'All' || bug.status === statusFilter;
    const severityMatch = severityFilter === 'All' || bug.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  function handleAddBug(bugData) {
    bugRepository.add(bugData);
    setBugs(bugRepository.getAll());
    setShowForm(false);
  }

  function handleEditBug(bugData) {
    bugRepository.update(editingBug.id, bugData);
    setBugs(bugRepository.getAll());
    setEditingBug(null);
    setSelectedBug(null);
  }

  function handleDeleteBug(id) {
    if (window.confirm('Delete this bug? This cannot be undone.')) {
      bugRepository.delete(id);
      setBugs(bugRepository.getAll());
      setSelectedBug(null);
    }
  }

  function startEdit(bug) {
    setEditingBug(bug);
    setSelectedBug(null);
  }

  return (
    <div className="bug-list">
      <div className="toolbar">
        <div className="filters">
          <label>
            Status:
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Fixed</option>
              <option>Closed</option>
              <option>Reopened</option>
            </select>
          </label>

          <label>
            Severity:
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        </div>

        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + New Bug
        </button>
      </div>

      <h2>Bugs ({filteredBugs.length} of {bugs.length})</h2>

      <table>
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
          {filteredBugs.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-state">
                No bugs match the current filters.
              </td>
            </tr>
          ) : (
            filteredBugs.map((bug) => (
              <tr
                key={bug.id}
                className="bug-row"
                onClick={() => setSelectedBug(bug)}
              >
                <td>{bug.id}</td>
                <td>{bug.title}</td>
                <td>{bug.severity}</td>
                <td>{bug.priority}</td>
                <td>{bug.status}</td>
                <td>{bug.module}</td>
                <td>{bug.assignee}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedBug && (
        <BugDetail
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onEdit={() => startEdit(selectedBug)}
          onDelete={() => handleDeleteBug(selectedBug.id)}
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
    </div>
  );
}

export default BugList;