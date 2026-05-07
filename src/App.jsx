import { useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import BugList from './components/BugList.jsx';
import BugForm from './components/BugForm.jsx';
import { bugRepository } from './data/bugRepository.js';

function Shell() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState('dashboard');
  const [bugs, setBugs] = useState([]);
  const [loadingBugs, setLoadingBugs] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setBugs([]);
      return;
    }
    let cancelled = false;
    setLoadingBugs(true);
    bugRepository.getAll()
      .then(rows => { if (!cancelled) setBugs(rows); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingBugs(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading) {
    return <div className="auth-body"><div className="auth-card">Loading…</div></div>;
  }

  if (!user) return <Login />;

  async function reload() {
    try {
      const rows = await bugRepository.getAll();
      setBugs(rows);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleQuickAdd(bugData) {
    try {
      await bugRepository.add({ ...bugData, createdBy: user.uid });
      await reload();
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={setView} />
      <main className="main">
        {error && <div className="error" role="alert">{error}</div>}
        {view === 'dashboard' ? (
          <Dashboard bugs={bugs} onNewBug={() => setShowForm(true)} loading={loadingBugs} />
        ) : (
          <BugList bugs={bugs} onChange={reload} loading={loadingBugs} />
        )}
      </main>

      {showForm && (
        <BugForm
          onSubmit={handleQuickAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
