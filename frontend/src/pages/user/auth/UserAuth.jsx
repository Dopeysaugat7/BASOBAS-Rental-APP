import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import UserLogin from "./UserLogin";
import UserSignup from "./UserSignup";
const UserAuth = () => {
  const { isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full flex shadow-lg rounded-lg overflow-hidden h-screen p-3 ">
        {/* Image Section */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center rounded-l-md"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1693948458360-c05c436177a8?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          {/* You can replace the placeholder image with your actual image */}
        </div>

        {/* Auth Form Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center dark:bg-gray-900 ml-3 rounded-r-md">
          <div className="flex justify-center mb-8 items-center">
            <button
              className={`px-4 py-2 mx-2 text-lg font-medium ${
                isLogin
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-white hover:text-gray-700"
              } transition duration-300 focus:outline-none`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`px-4 py-2 mx-2 text-lg font-medium ${
                !isLogin
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-white hover:text-gray-700"
              } transition duration-300 focus:outline-none`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
          {isLogin ? <UserLogin /> : <UserSignup />}
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
