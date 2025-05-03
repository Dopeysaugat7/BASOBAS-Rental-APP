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
import ProtectedRoutes from "./components/ProtectedRoutes";
import VerificationPrompt from "./pages/user/auth/VerificationPrompt";
import Userdashboard from "./pages/user/dashboard/UserdashboardLayout";
import UserProfile from "./pages/user/dashboard/UserProfile";
import LayoutWithNavbar from "./pages/user/LayoutWithNavbar";
import AddProperty from "./pages/user/dashboard/AddProperty";
import ActiveProperties from "./pages/user/dashboard/ActiveProperty";
import PropertyDetails from "./pages/user/PropertyDetails";
import EditProperty from "./pages/user/EditProperty";
import Billing from "./pages/user/dashboard/Billing";
import Dashboard from "./pages/user/dashboard/Dashboard";
import VisitsDashboard from "./pages/user/dashboard/VisitLog";
import SearchProperty from "./pages/user/SearchProperty";
import PropertyList from "./pages/user/PropertyList";
import BookingSuccess from "./components/BookingSuccess";
import BookingFaliure from "./components/BookingFaliure";
import Favorites from "./pages/user/dashboard/Favorites";

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
              <Route path="" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="add-property" element={<AddProperty />} />
              <Route path="my-properties" element={<ActiveProperties />} />
              <Route path="edit/:id" element={<EditProperty />} />
              <Route path="billings" element={<Billing />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="Visit-logs" element={<VisitsDashboard />} />
            </Route>
          </Route>
          <Route path="/:id" element={<PropertyDetails />} />
          <Route path="/search" element={<SearchProperty />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking/faliure" element={<BookingFaliure />} />
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
