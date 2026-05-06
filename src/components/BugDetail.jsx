function BugDetail({ bug, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="bug-id">{bug.id}</span>
            <h2>{bug.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <div className="badges">
            <span className={`badge severity-${bug.severity.toLowerCase()}`}>{bug.severity}</span>
            <span className="badge priority">{bug.priority}</span>
            <span className={`badge status-${bug.status.toLowerCase().replace(' ', '-')}`}>{bug.status}</span>
            <span className="badge module">{bug.module}</span>
          </div>

          <Field label="Description" value={bug.description} />
          <Field label="Steps to Reproduce" value={bug.stepsToReproduce} multiline />
          <Field label="Expected Result" value={bug.expectedResult} />
          <Field label="Actual Result" value={bug.actualResult} />

          <div className="field-row">
            <Field label="Build Number" value={bug.buildNumber} inline />
            <Field label="Platform" value={bug.platform} inline />
          </div>

          <div className="field-row">
            <Field label="Reporter" value={bug.reporter} inline />
            <Field label="Assignee" value={bug.assignee} inline />
          </div>

          {bug.screenshotUrl && <Field label="Screenshot URL" value={bug.screenshotUrl} />}
          {bug.logs && <Field label="Logs" value={bug.logs} multiline />}
          {bug.notes && <Field label="Notes" value={bug.notes} multiline />}

          <div className="field-row">
            <Field label="Created" value={formatDate(bug.createdAt)} inline />
            <Field label="Last Updated" value={formatDate(bug.updatedAt)} inline />
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper component for label + value pairs
function Field({ label, value, multiline, inline }) {
  return (
    <div className={`field ${inline ? 'field-inline' : ''}`}>
      <div className="field-label">{label}</div>
      <div className={`field-value ${multiline ? 'field-multiline' : ''}`}>{value}</div>
    </div>
  );
}

// Helper: format ISO timestamp into a readable string
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export default BugDetail;