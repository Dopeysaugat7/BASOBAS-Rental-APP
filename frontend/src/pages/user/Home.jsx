import { useAuth } from "@/context/AuthContext";
import React from "react";

const Home = () => {
  const { user } = useAuth();
  return (
    <>
      <div className="hero-section">
        <h4>Hello, {user ? user.name : "Developer"}</h4>
        <h1>Welcome to Basobas</h1>
        <p>Basobas Is a house rental application.</p>
      </div>
    </>
  );
};

export default Home;
