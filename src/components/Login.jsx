import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

function Login() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fn = tab === 'login' ? login : signup;
    const result = await fn(email.trim(), password);
    setLoading(false);
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
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Working…' : (tab === 'login' ? 'Sign in' : 'Create account')}
          </button>
          <p className="error">{error}</p>
        </form>
      </div>
    </div>
  );
}

export default Login;
