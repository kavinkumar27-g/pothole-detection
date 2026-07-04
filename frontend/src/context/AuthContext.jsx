import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // 'public' | 'authority' | null
  const [user, setUser] = useState(null);

  const login = (role, email) => {
    setUserRole(role);
    setUser({ email, name: role === 'authority' ? 'Municipal Officer' : 'Citizen' });
  };

  const logout = () => {
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
