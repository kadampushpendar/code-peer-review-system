import { createContext, useCallback, useContext, useState } from 'react';
import { api, getAuth, setAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getAuth()?.user || null);

  async function login(email, password) {
    const u = await api.login(email, password);
    setUser(u);
    return u;
  }

  const refreshUser = useCallback(async () => {
    const stored = getAuth();
    if (!stored) return null;
    const updatedUser = await api.currentUser();
    setAuth({ ...stored, user: updatedUser });
    setUser(updatedUser);
    return updatedUser;
  }, []);

  function logout() {
    setAuth(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
