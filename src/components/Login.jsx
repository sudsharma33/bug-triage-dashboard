import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

function Login() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fn = tab === 'login' ? login : signup;
    const result = fn(username.trim(), password);
    if (!result.ok) setError(result.error);
  }

  function switchTab(next) {
    setTab(next);
    setError('');
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="brand">
          <div className="logo">BT</div>
          <h1>Bug Tracker</h1>
          <p className="subtitle">Log it. Track it. Squash it.</p>
        </div>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={3}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
          <button type="submit" className="btn btn-primary btn-block">
            {tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
          {tab === 'login' && (
            <p className="hint">Demo: <code>admin / admin</code></p>
          )}
          <p className="error">{error}</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
