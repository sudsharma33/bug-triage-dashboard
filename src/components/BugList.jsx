import { useState } from 'react';
import { sampleBugs } from '../data/sampleBugs.js';

function BugList() {
  // State for the filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Derived data: filter the bugs based on current filter state.
  // This runs on every render, which is fine for a small list.
  const filteredBugs = sampleBugs.filter((bug) => {
    const statusMatch = statusFilter === 'All' || bug.status === statusFilter;
    const severityMatch = severityFilter === 'All' || bug.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  return (
    <div className="bug-list">
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

      <h2>Bugs ({filteredBugs.length} of {sampleBugs.length})</h2>

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
              <tr key={bug.id}>
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
    </div>
  );
}

export default BugList;   