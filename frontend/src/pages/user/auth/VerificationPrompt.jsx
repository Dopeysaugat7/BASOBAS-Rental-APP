// VerificationPrompt.jsx
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const VerificationPrompt = () => {
  const { email, phone } = useParams();
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleVerifyNow = async (method) => {
    try {
      await axios.post(
        "http://localhost:5000/api/v1/user/send-verification",
        {
          email,
          phone,
          verificationMethod: method,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      navigate(`/otp-verification/${email}/${phone}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification code"
      );
    }
  };

  const handleSkipForNow = () => {
    // Navigate to home or dashboard
    navigate("/");
    setIsAuthenticated(true);
    toast.info("You can verify your account later from your profile settings");
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900 min-h-screen">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verify Your Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We recommend verifying your account to access all features.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => handleVerifyNow("email")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verify via Email Now
          </button>

          <button
            onClick={() => handleVerifyNow("phone")}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verify via Phone Now
          </button>

          <button
            onClick={handleSkipForNow}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-md font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Skip for Now
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>You can always verify later from your account settings.</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPrompt;
