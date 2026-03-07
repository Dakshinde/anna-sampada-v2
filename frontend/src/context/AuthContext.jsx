import React, { createContext, useContext, useState } from 'react';

// This is the Context object
export const AuthContext = createContext(null);

// This is your Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    verified: false,
    pending: false,
    documents: []
  });
  
  const login = (userData, userRole, verification = { verified: false, pending: false }) => {
    setUser(userData);
    setRole(userRole);
    setVerificationStatus(verification);
  };
  
  const logout = () => {
    setUser(null);
    setRole(null);
    setVerificationStatus({ verified: false, pending: false, documents: [] });
  };
  
  return (
    <AuthContext.Provider value={{ user, role, verificationStatus, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- [THIS IS THE NEW FUNCTION YOU MUST ADD] ---
// This is the custom hook that LoginPage.jsx is trying to import.
export const useAuth = () => {
  return useContext(AuthContext);
};