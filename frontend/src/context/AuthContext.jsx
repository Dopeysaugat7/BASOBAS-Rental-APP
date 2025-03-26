/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/user/me",
          {
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (data?.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          setNeedsVerification(!data.user.accountVerified);
        }
      } catch (error) {
        // Handle 400 specifically
        if (error.response?.status === 400) {
          console.error(
            "Bad request - possible session issue:",
            error.response.data
          );
        }
        setIsAuthenticated(false);
        setNeedsVerification(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading,
        needsVerification,
        setNeedsVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
