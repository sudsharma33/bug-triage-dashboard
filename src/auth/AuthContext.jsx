import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase.js';

const AuthContext = createContext(null);

function shapeUser(fbUser) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    username: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : ''),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(shapeUser(fbUser));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function signup(email, password) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}