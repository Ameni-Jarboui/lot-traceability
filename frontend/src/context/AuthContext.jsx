import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('zen_user');
    const token = localStorage.getItem('zen_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setReady(true);
  }, []);

  function persist(token, user) {
    localStorage.setItem('zen_token', token);
    localStorage.setItem('zen_user', JSON.stringify(user));
    setUser(user);
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    persist(data.token, data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('zen_token');
    localStorage.removeItem('zen_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
