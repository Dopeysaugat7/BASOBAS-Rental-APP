import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth();
  const { email, phone } = useParams();
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigateTo = useNavigate();

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    const data = {
      email,
      otp: enteredOtp,
      phone,
    };
    await axios
      .post("http://localhost:5000/api/v1/user/otp-verification", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(true);
        setUser(res.data.user);
        navigateTo("/");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Verification failed");
        setIsAuthenticated(false);
        setUser(null);
      });
  };

  const handleResendCode = async () => {
    try {
      setResendDisabled(true);
      setCountdown(30); // Reset countdown

      const response = await axios.post(
        "http://localhost:5000/api/v1/user/resend-verification",
        {
          email,
          phone,
          method: email ? "email" : "phone",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(response.data.message || "New OTP sent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      setResendDisabled(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-transparent shadow-lg rounded-lg p-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            OTP Verification
          </h1>
          <p className="mt-2 text-center text-md text-gray-600 dark:text-gray-300">
            Enter the 5-digit OTP sent to {email || phone}
          </p>
        </div>
        <form onSubmit={handleOtpVerification} className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                key={index}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendDisabled}
              className={`text-sm font-medium ${
                resendDisabled
                  ? "text-gray-400"
                  : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              }`}
            >
              {resendDisabled
                ? `Resend OTP in ${countdown}s`
                : "Didn't receive code? Resend"}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={otp.join("").length !== 5}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-md font-medium rounded-lg text-white ${
                otp.join("").length !== 5
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Verify OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
