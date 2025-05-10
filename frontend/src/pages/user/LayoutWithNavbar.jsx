import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const LayoutWithNavbar = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This renders the child routes */}
      <Footer />
    </>
  );
};

export default LayoutWithNavbar;
