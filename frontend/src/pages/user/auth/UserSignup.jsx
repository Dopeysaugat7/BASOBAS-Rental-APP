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
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Register
          </h2>
        </div>
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit(handleRegister)}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                placeholder="Name"
                {...register("name")}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                placeholder="Email"
                {...register("email")}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone
              </label>
              <div className="flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 sm:text-md">
                  +977
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="number"
                  autoComplete="phone"
                  required
                  className="appearance-none rounded-none rounded-r-lg block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                  placeholder="Phone"
                  {...register("phone")}
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-md"
                placeholder="Password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeClosedIcon /> : <Eye />}
              </button>
            </div>

            <div className="verification-method">
              <p className="text-md text-gray-900 dark:text-gray-300">
                Select Verification Method
              </p>
              <div className="mt-2 space-y-2 flex gap-10">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value={"email"}
                    {...register("verificationMethod")}
                    required
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-3 text-md text-gray-900 dark:text-gray-300">
                    Email
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="verificationMethod"
                    value={"phone"}
                    {...register("verificationMethod")}
                    required
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-3 text-md text-gray-900 dark:text-gray-300">
                    Phone
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-md font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
