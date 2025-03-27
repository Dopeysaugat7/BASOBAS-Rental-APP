/* eslint-disable no-unused-vars */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();

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
  }, [user]);
  const updateVerificationStatus = (status) => {
    setNeedsVerification(!status);
    if (user) {
      setUser({ ...user, accountVerified: status });
    }
  };

  const logout = async () => {
    try {
      // Call backend logout if needed (optional)
      await axios.post(
        "http://localhost:5000/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear frontend state
      setUser(null);
      localStorage.removeItem("user");

      // Remove cookie on client side (if needed)
      document.cookie =
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Redirect
      navigate("/auth");
    }
  };

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
        updateVerificationStatus,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
