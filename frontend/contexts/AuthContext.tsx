import React, { createContext, useContext, useEffect, useState } from "react";

// type User = {
//   userId: number;
//   username: string;
//   email: string;
//   role: number;
// };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role?: number;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/User/getUser", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
