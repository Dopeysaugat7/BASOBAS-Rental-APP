import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({ requireVerification = false }) => {
  const { isAuthenticated, user, loading, needsVerification } = useAuth();

  if (loading) return <div>Loading.....</div>;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (requireVerification && needsVerification) {
    return (
      <div className="max-w-[90vw] mx-auto p-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Account Verification Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You need to verify your account to access this page. Please
                  check your
                  {user?.verificationMethod === "email" ? " email" : " phone "}
                  for the verification link or
                  <button
                    onClick={() =>
                      (window.location.href = "/dashboard/profile")
                    }
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    verify now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoutes;
