/* eslint-disable no-unused-vars */
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Eye, EyeClosedIcon } from "lucide-react";
import React, { useState } from "react";
import { set, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserSignup = () => {
  const { setIsAuthenticated, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigateTo = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // const handleRegister = async (data) => {
  //   data.phone = `+977${data.phone}`;
  //   await axios
  //     .post("http://localhost:5000/api/v1/user/register", data, {
  //       withCredentials: true,
  //       headers: { "Content-Type": "application/json" },
  //     })
  //     .then((res) => {
  //       toast.success(res.data.message);
  //       navigateTo(`/otp-verification/${data.email}/${data.phone}`);
  //     })
  //     .catch((error) => {
  //       toast.error(error.response.data.message);
  //     });
  // };

  const handleRegister = async (data) => {
    data.phone = `+977${data.phone}`;
    console.log("Before axios call");
    await axios
      .post("http://localhost:5000/api/v1/user/register", data, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        toast.success(res.data.message);
        setUser(res.data.user);
        // setIsAuthenticated(true);
        // Navigate to verification prompt instead of OTP verification
        navigateTo(`/verification-prompt/${data.email}/${data.phone}`);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  return (
    <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background dark:bg-background">
      <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground dark:text-muted-foreground">
            Get started with just a few details
          </p>
        </div>

        <form
          className="mt-6 space-y-4 sm:space-y-6"
          onSubmit={handleSubmit(handleRegister)}
        >
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm sm:text-base font-medium text-foreground dark:text-foreground mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-input bg-card dark:bg-card text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                placeholder="John Doe"
                {...register("name")}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm sm:text-base font-medium text-foreground dark:text-foreground mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-input bg-card dark:bg-card text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
                {...register("email")}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm sm:text-base font-medium text-foreground dark:text-foreground mb-1"
              >
                Phone Number
              </label>
              <div className="flex rounded-lg">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-input bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground text-sm sm:text-base">
                  +977
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="flex-1 min-w-0 block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-none rounded-r-lg border border-l-0 border-gray-300 dark:border-input bg-card dark:bg-card text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
                  placeholder="98XXXXXXXX"
                  {...register("phone")}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm sm:text-base font-medium text-foreground dark:text-foreground mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-input bg-card dark:bg-card text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent pr-10"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-1 sm:pt-2">
              <p className="text-sm sm:text-base font-medium text-foreground dark:text-foreground mb-2">
                Verification Method
              </p>
              <div className="flex gap-4 sm:gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="email"
                    {...register("verificationMethod")}
                    required
                    className="h-4 w-4 text-primary dark:text-primary focus:ring-primary dark:focus:ring-primary border-gray-300 dark:border-input"
                  />
                  <span className="text-sm sm:text-base text-foreground dark:text-foreground">
                    Email
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value="phone"
                    {...register("verificationMethod")}
                    required
                    className="h-4 w-4 text-primary dark:text-primary focus:ring-primary dark:focus:ring-primary border-gray-300 dark:border-input"
                  />
                  <span className="text-sm sm:text-base text-foreground dark:text-foreground">
                    Phone
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-primary-foreground dark:text-primary-foreground bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
