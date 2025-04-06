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
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background dark:bg-background">
      <div className="w-full max-w-md mx-auto space-y-6 p-6 sm:p-8 rounded-xl bg-card dark:bg-card shadow-lg border border-border dark:border-border">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">
            Verify Your Account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground">
            We recommend verifying your account to access all features.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => handleVerifyNow("email")}
            className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg text-sm sm:text-base font-medium text-primary-foreground dark:text-primary-foreground bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary transition-colors"
          >
            Verify via Email
          </button>

          <button
            onClick={() => handleVerifyNow("phone")}
            className="w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg text-sm sm:text-base font-medium text-primary-foreground dark:text-primary-foreground bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary transition-colors"
          >
            Verify via Phone
          </button>

          <button
            onClick={handleSkipForNow}
            className="w-full flex justify-center py-2 sm:py-3 px-4 border border-gray-300 dark:border-input rounded-lg text-sm sm:text-base font-medium text-foreground dark:text-foreground bg-card dark:bg-card hover:bg-accent dark:hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary transition-colors"
          >
            Skip for Now
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground dark:text-muted-foreground">
          <p>You can always verify later from your account settings.</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPrompt;
