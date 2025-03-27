import "./App.css";
import ErrorPage from "./pages/NotFound";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/user/Home";
import SuperadminLogin from "./pages/superadmin/SuperadminLogin";
import SuperadminSignup from "./pages/superadmin/SuperadminSignup";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import SuperadminProfile from "./pages/superadmin/SuperadminProfile";
import OtpVerification from "./pages/user/auth/OtpVerification";
import ForgotPassword from "./pages/user/auth/ForgotPassword";
import ResetPassword from "./pages/user/auth/ResetPassword";
import UserAuth from "./pages/user/auth/UserAuth";
import ThemeToggle from "./components/ThemeToggle";
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerificationPrompt from "./pages/user/auth/VerificationPrompt";
import Userdashboard from "./pages/user/dashboard/UserDashboard";
import UserProfile from "./pages/user/dashboard/UserProfile";
import Navbar from "./components/Navbar";
import LayoutWithNavbar from "./pages/user/LayoutWithNavbar";

function App() {
  return (
    <div className="min-h-screen">
      {/* <ThemeToggle /> */}
      <Routes>
        {/* Public Routes */}
        <Route element={<LayoutWithNavbar />}>
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoutes requireVerification={true} />}>
            <Route path="/dashboard" element={<Userdashboard />}>
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="/auth" element={<UserAuth />} />
        <Route
          path="otp-verification/:email/:phone"
          element={<OtpVerification />}
        />
        <Route
          path="/verification-prompt/:email/:phone"
          element={<VerificationPrompt />}
        />
        <Route path="password/forgot" element={<ForgotPassword />} />
        <Route path="password/reset/:token" element={<ResetPassword />} />

        {/* Superadmin Routes */}
        <Route path="/superadmin">
          <Route path="login" element={<SuperadminLogin />} />
          <Route path="signup" element={<SuperadminSignup />} />
          <Route path="dashboard" element={<SuperadminDashboard />} />
          <Route path="profile" element={<SuperadminProfile />} />
        </Route>

        {/* 404 Not Found Route */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <ToastContainer theme="colored" />
    </div>
  );
}

export default App;
