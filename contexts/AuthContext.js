import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user 초기 상태를 null로 설정

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    // 이전 user 데이터와 병합하여 상태 설정
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
