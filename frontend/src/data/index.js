import {
  LayoutDashboard,
  Home,
  CreditCard,
  Star,
  UserRound,
  Plus,
  CheckCircle,
  Logs,
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
      //   path: "/dashboard/visit-logs",
      //   icon: Logs,
      //   label: "Visit Log",
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
  // { path: "/leads", icon: Users, label: "Leads" },

  { path: "/dashboard/billings", icon: CreditCard, label: "Billings" },
  { path: "/dashboard/visit-logs", icon: Logs, label: "Visit Log" },
  // { path: "/activity", icon: Activity, label: "Activity Logs" },
  { path: "/dashboard/favorites", icon: Star, label: "Favorites" },
  { path: "/dashboard/profile", icon: UserRound, label: "Profile" },
  {
    path: "/dashboard/add-property",
    icon: Plus,
    label: "List your property",
    variant: "ghost",
  },
];
