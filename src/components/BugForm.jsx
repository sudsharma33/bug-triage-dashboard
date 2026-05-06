import { useState } from 'react';

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const STATUSES = ['Open', 'In Progress', 'Fixed', 'Closed', 'Reopened'];

const EMPTY_BUG = {
  title: '',
  description: '',
  stepsToReproduce: '',
  expectedResult: '',
  actualResult: '',
  buildNumber: '',
  platform: '',
  severity: 'Medium',
  priority: 'P2',
  status: 'Open',
  module: '',
  assignee: 'Unassigned',
  reporter: '',
  screenshotUrl: '',
  logs: '',
  notes: ''
};

function BugForm({ initialBug, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialBug || EMPTY_BUG);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(initialBug);

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.module.trim()) newErrors.module = 'Module is required';
    if (!form.reporter.trim()) newErrors.reporter = 'Reporter is required';
    return newErrors;
  }

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(form);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Bug' : 'Log New Bug'}</h2>
          <button className="close-btn" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <FormField label="Title" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Short summary of the bug"
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What's the bug?"
              rows={2}
            />
          </FormField>

          <FormField label="Steps to Reproduce">
            <textarea
              value={form.stepsToReproduce}
              onChange={(e) => handleChange('stepsToReproduce', e.target.value)}
              placeholder="1. Do this&#10;2. Then this"
              rows={4}
            />
          </FormField>

          <div className="form-row">
            <FormField label="Expected Result">
              <textarea
                value={form.expectedResult}
                onChange={(e) => handleChange('expectedResult', e.target.value)}
                rows={2}
              />
            </FormField>
            <FormField label="Actual Result">
              <textarea
                value={form.actualResult}
                onChange={(e) => handleChange('actualResult', e.target.value)}
                rows={2}
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Severity">
              <select value={form.severity} onChange={(e) => handleChange('severity', e.target.value)}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Priority">
              <select value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Module" required error={errors.module}>
              <input
                type="text"
                value={form.module}
                onChange={(e) => handleChange('module', e.target.value)}
                placeholder="e.g. Authentication"
              />
            </FormField>
            <FormField label="Assignee">
              <input
                type="text"
                value={form.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
              />
            </FormField>
            <FormField label="Reporter" required error={errors.reporter}>
              <input
                type="text"
                value={form.reporter}
                onChange={(e) => handleChange('reporter', e.target.value)}
              />
            </FormField>
          </div>

          <div className="form-row">
            <FormField label="Build Number">
              <input
                type="text"
                value={form.buildNumber}
                onChange={(e) => handleChange('buildNumber', e.target.value)}
                placeholder="e.g. v2.4.1-rc3"
              />
            </FormField>
            <FormField label="Platform">
              <input
                type="text"
                value={form.platform}
                onChange={(e) => handleChange('platform', e.target.value)}
                placeholder="e.g. macOS / Chrome"
              />
            </FormField>
          </div>

          <FormField label="Screenshot URL">
            <input
              type="text"
              value={form.screenshotUrl}
              onChange={(e) => handleChange('screenshotUrl', e.target.value)}
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Logs">
            <textarea
              value={form.logs}
              onChange={(e) => handleChange('logs', e.target.value)}
              rows={3}
              placeholder="Optional"
            />
          </FormField>

          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              placeholder="Optional"
            />
          </FormField>

          <div className="form-actions">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>
              {isEditing ? 'Save Changes' : 'Log Bug'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div className="form-field">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default BugForm;