import Navbar from "@/components/Navbar";
// import { useAuth } from "@/context/AuthContext";
import React from "react";

const Home = () => {
  // const { user } = useAuth();
  return (
    <>
      <div className="min-h-screen flex justify-center items-center">
        <h1 className="text-3xl font-bold">
          Welcome to Basobas - Easy Rent, Secure Living!
        </h1>
      </div>
    </>
  );
};

export default Home;
