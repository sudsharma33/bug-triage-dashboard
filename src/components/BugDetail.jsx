function BugDetail({ bug, onClose, onEdit, onDelete, onCloseBug }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="bug-id">{bug.id}</span>
            <h2>{bug.title}</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <div className="detail-meta">
            <Meta k="Severity" v={<span className={`badge sev-${bug.severity}`}>{bug.severity}</span>} />
            <Meta k="Priority" v={<span className="badge priority">{bug.priority}</span>} />
            <Meta k="Status" v={<span className={`badge st-${bug.status.replace(' ', '-')}`}>{bug.status}</span>} />
            <Meta k="Module" v={bug.module} />
            <Meta k="Assignee" v={bug.assignee} />
            <Meta k="Reporter" v={bug.reporter} />
            <Meta k="Build" v={bug.buildNumber || '—'} />
            <Meta k="Platform" v={bug.platform || '—'} />
            <Meta k="Created" v={formatDate(bug.createdAt)} />
            <Meta k="Updated" v={formatDate(bug.updatedAt)} />
          </div>

          <Field label="Description" value={bug.description} />
          <Field label="Steps to Reproduce" value={bug.stepsToReproduce} />
          <Field label="Expected Result" value={bug.expectedResult} />
          <Field label="Actual Result" value={bug.actualResult} />
          <Field label="Logs" value={bug.logs} />
          <Field label="Notes" value={bug.notes} />

          {bug.screenshotUrl && (
            <Field label="Screenshot URL" value={bug.screenshotUrl} />
          )}

          {bug.screenshots && bug.screenshots.length > 0 && (
            <div className="detail-section">
              <h4>Screenshots</h4>
              <div className="detail-screens">
                {bug.screenshots.map((src, i) => (
                  <img key={i} src={src} alt={`screenshot-${i + 1}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onDelete}>Delete</button>
          <div className="spacer" />
          <button className="btn btn-secondary" onClick={onEdit}>Edit</button>
          {bug.status !== 'Closed' && (
            <button className="btn btn-success" onClick={onCloseBug}>Close Bug</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Meta({ k, v }) {
  return (
    <div className="item">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail-section">
      <h4>{label}</h4>
      <div className="value">{value}</div>
    </div>
  );
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default BugDetail;
