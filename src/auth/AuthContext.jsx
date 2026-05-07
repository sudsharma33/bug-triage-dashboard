import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'bt_users';
const SESSION_KEY = 'bt_session';

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = [{ username: 'admin', password: 'admin' }];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    readUsers();
  }, []);

  function login(username, password) {
    const users = readUsers();
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) return { ok: false, error: 'Invalid username or password.' };
    const session = { username, ts: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function signup(username, password) {
    const users = readUsers();
    if (users.find(u => u.username === username)) {
      return { ok: false, error: 'That username is taken.' };
    }
    users.push({ username, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = { username, ts: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
