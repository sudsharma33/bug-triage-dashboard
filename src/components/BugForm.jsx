import { Children, cloneElement, isValidElement, useId, useState } from 'react';

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
  screenshots: [],
  logs: '',
  notes: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function BugForm({ initialBug, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_BUG,
    ...(initialBug || {}),
    screenshots: initialBug?.screenshots ? [...initialBug.screenshots] : [],
  }));
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(initialBug);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  }

  async function handleScreenshotUpload(e) {
    const files = Array.from(e.target.files || []);
    const encoded = await Promise.all(files.map(fileToBase64));
    setForm(prev => ({ ...prev, screenshots: [...prev.screenshots, ...encoded] }));
    e.target.value = '';
  }

  function removeScreenshot(idx) {
    setForm(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== idx),
    }));
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.description.trim()) next.description = 'Description is required';
    if (!form.module.trim()) next.module = 'Module is required';
    if (!form.reporter.trim()) next.reporter = 'Reporter is required';
    if (!form.stepsToReproduce.trim()) next.stepsToReproduce = 'Steps to reproduce are required';
    if (!form.expectedResult.trim()) next.expectedResult = 'Expected result is required';
    if (!form.actualResult.trim()) next.actualResult = 'Actual result is required';
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit(form);
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Bug' : 'Log New Bug'}</h2>
          <button className="close" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <Field label="Title" required error={errors.title} className="full">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder="Short summary of the bug"
                />
              </Field>

              <Field label="Description" required error={errors.description} className="full">
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="What's the bug?"
                  rows={2}
                />
              </Field>

              <Field label="Severity">
                <select value={form.severity} onChange={(e) => setField('severity', e.target.value)}>
                  {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="Module" required error={errors.module}>
                <input
                  type="text"
                  value={form.module}
                  onChange={(e) => setField('module', e.target.value)}
                  placeholder="e.g. Authentication"
                />
              </Field>
              <Field label="Assignee">
                <input
                  type="text"
                  value={form.assignee}
                  onChange={(e) => setField('assignee', e.target.value)}
                />
              </Field>
              <Field label="Reporter" required error={errors.reporter}>
                <input
                  type="text"
                  value={form.reporter}
                  onChange={(e) => setField('reporter', e.target.value)}
                />
              </Field>

              <Field label="Build Number" className="half">
                <input
                  type="text"
                  value={form.buildNumber}
                  onChange={(e) => setField('buildNumber', e.target.value)}
                  placeholder="e.g. v2.4.1-rc3"
                />
              </Field>
              <Field label="Platform">
                <input
                  type="text"
                  value={form.platform}
                  onChange={(e) => setField('platform', e.target.value)}
                  placeholder="e.g. macOS / Chrome"
                />
              </Field>

              <Field label="Steps to Reproduce" required error={errors.stepsToReproduce} className="full">
                <textarea
                  value={form.stepsToReproduce}
                  onChange={(e) => setField('stepsToReproduce', e.target.value)}
                  rows={4}
                />
              </Field>

              <Field label="Expected Result" required error={errors.expectedResult} className="half">
                <textarea
                  value={form.expectedResult}
                  onChange={(e) => setField('expectedResult', e.target.value)}
                  rows={2}
                />
              </Field>
              <Field label="Actual Result" required error={errors.actualResult}>
                <textarea
                  value={form.actualResult}
                  onChange={(e) => setField('actualResult', e.target.value)}
                  rows={2}
                />
              </Field>

              <Field label="Screenshot URL" className="full">
                <input
                  type="text"
                  value={form.screenshotUrl}
                  onChange={(e) => setField('screenshotUrl', e.target.value)}
                  
                />
              </Field>

              <Field label="Screenshots" className="full">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                />
                {form.screenshots.length > 0 && (
                  <div className="screenshot-preview">
                    {form.screenshots.map((src, i) => (
                      <div key={i} className="thumb">
                        <img src={src} alt={`screenshot-${i + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          aria-label="Remove"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Logs" className="full">
                <textarea
                  value={form.logs}
                  onChange={(e) => setField('logs', e.target.value)}
                  rows={3}
                  
                />
              </Field>

              <Field label="Notes" className="full">
                <textarea
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={2}
                  
                />
              </Field>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Log Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, className = '', children }) {
  const generatedId = useId();
  const childArray = Children.toArray(children);
  const firstInput = childArray.find(
    (c) => isValidElement(c) && ['input', 'textarea', 'select'].includes(c.type)
  );
  const inputId = firstInput?.props.id || generatedId;
  const enhanced = childArray.map((c) =>
    c === firstInput ? cloneElement(c, { id: inputId }) : c
  );
  return (
    <div className={className}>
      <label htmlFor={inputId}>
        {label} {required && <span className="required">*</span>}
      </label>
      {enhanced}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export default BugForm;
