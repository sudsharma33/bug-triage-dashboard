import { useAuth } from '../auth/AuthContext.jsx';

function Sidebar({ view, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="logo">BT</div>
        <h2>Bug Tracker</h2>
      </div>
      <nav className="nav">
        <button
          className={view === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={view === 'bugs' ? 'active' : ''}
          onClick={() => onNavigate('bugs')}
        >
          🐞 Bugs
        </button>
      </nav>
      <div className="user-box">
        <div className="name">{user?.username}</div>
        <button onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
}

export default Sidebar;
