import { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, getMeApi } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Shows loading while checking if the user is already logged in.
  const [loading, setLoading] = useState(true);

  // Check for a saved token when the app starts.
  // If a token exists, load the user's details.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMeApi()
      .then((res) => setUser(res.data))
      .catch(() => {
        // Remove the token if it is no longer valid.
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setLoading(false));
  }, []);

  // Log in the user and save the token.
  const login = async (email, password) => {
    const res = await loginApi({ email, password });

    localStorage.setItem("token", res.data.token);
    setUser(res.data);

    return res.data;
  };

  // Register a new user and save the token.
  const register = async (name, email, password) => {
    const res = await registerApi({ name, email, password });

    localStorage.setItem("token", res.data.token);
    setUser(res.data);

    return res.data;
  };

  // Log out the user and remove the saved token.
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access user and auth functions in any component.
export const useAuth = () => useContext(AuthContext);