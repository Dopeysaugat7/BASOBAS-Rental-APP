import { Outlet } from "react-router-dom";
import AdminNav from "@/components/AdminNav";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex lg:flex-row flex-col lg:mx-15 md:mx-10  max-w-screen px-5">
      <AdminNav />
      <div className="lg:pl-10 flex-1 overflow-x-hidden">
        <div className="lg:p-4 ">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
