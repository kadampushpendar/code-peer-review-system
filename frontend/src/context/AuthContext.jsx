import { createContext, useContext, useState } from 'react';
import { api, getAuth, setAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuth()?.user || null);

  async function login(email, password) {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }

  function logout() {
    setAuth(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
