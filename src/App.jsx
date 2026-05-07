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
  const { user } = useAuth();
  const [view, setView] = useState('dashboard');
  const [bugs, setBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) setBugs(bugRepository.getAll());
  }, [user]);

  if (!user) return <Login />;

  function reload() {
    setBugs(bugRepository.getAll());
  }

  function handleQuickAdd(bugData) {
    bugRepository.add(bugData);
    reload();
    setShowForm(false);
  }

  return (
    <div className="app">
      <Sidebar view={view} onNavigate={setView} />
      <main className="main">
        {view === 'dashboard' ? (
          <Dashboard bugs={bugs} onNewBug={() => setShowForm(true)} />
        ) : (
          <BugList bugs={bugs} onChange={reload} />
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
