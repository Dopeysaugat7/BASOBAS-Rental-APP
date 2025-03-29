import {
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  Activity,
  Star,
  UserRound,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  CalendarOff,
} from "lucide-react";

export const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    path: "/properties",
    icon: Home,
    label: "Properties",
    subItems: [
      { path: "/dashboard/add-property", icon: Plus, label: "Add Property" },
      {
        path: "/dashboard/my-properties",
        icon: CheckCircle,
        label: "My Properties",
      },
      // {
      //   path: "/properties/pending",
      //   icon: Clock,
      //   label: "Pending Properties",
      // },
      // {
      //   path: "/properties/rejected",
      //   icon: XCircle,
      //   label: "Rejected Properties",
      // },
      // {
      //   path: "/properties/expired",
      //   icon: CalendarOff,
      //   label: "Expired Properties",
      // },
    ],
  },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/billings", icon: CreditCard, label: "Billings" },
  { path: "/activity", icon: Activity, label: "Activity Logs" },
  { path: "/favorites", icon: Star, label: "Favorites" },
  { path: "/dashboard/profile", icon: UserRound, label: "Profile" },
];
