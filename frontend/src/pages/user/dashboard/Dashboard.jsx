import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  Users,
  Star,
  Clock,
  DollarSign,
  User,
  Settings,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  // Mock data - replace with actual API calls
  const userData = {
    name: "Rohan Shrestha",
    email: "rohan02shrestha@gmail.com",
    joinDate: "2023-05-15",
  };

  const stats = {
    totalProperties: 24,
    rentedProperties: 18,
    availableProperties: 6,
    pendingApprovals: 3,
    monthlyRevenue: 42800,
    occupancyRate: 75,
    expiringSoon: 2,
  };

  // Chart data with dark mode compatible colors
  const revenueData = [
    { name: "Jan", revenue: 32000 },
    { name: "Feb", revenue: 38000 },
    { name: "Mar", revenue: 41000 },
    { name: "Apr", revenue: 42800 },
    { name: "May", revenue: 39500 },
    { name: "Jun", revenue: 43500 },
  ];

  const occupancyData = [
    { name: "Jan", rate: 65 },
    { name: "Feb", rate: 72 },
    { name: "Mar", rate: 78 },
    { name: "Apr", rate: 75 },
    { name: "May", rate: 80 },
    { name: "Jun", rate: 82 },
  ];

  // Dark mode compatible chart colors
  const chartColors = {
    light: {
      areaFill: "#8884d8",
      areaStroke: "#8884d8",
      barFill: "#82ca9d",
      gridStroke: "#e5e7eb",
      axisStroke: "#6b7280",
      tooltipBg: "#ffffff",
      tooltipText: "#374151",
    },
    dark: {
      areaFill: "#7c3aed",
      areaStroke: "#7c3aed",
      barFill: "#10b981",
      gridStroke: "#374151",
      axisStroke: "#9ca3af",
      tooltipBg: "#1f2937",
      tooltipText: "#f3f4f6",
    },
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-1 sm:mt-2">
            Welcome back, {userData.name} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" className="rounded-full">
            <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          <Button size="sm" className="rounded-full">
            <MessageSquare className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Messages</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* User Profile and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-2 xl:col-span-1 shadow-none">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
              <div className="relative mb-3 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                </div>
                <Badge className="absolute -bottom-1 -right-1 bg-green-500 hover:bg-green-500">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {userData.name}
              </CardTitle>
              <CardDescription className="mt-1 text-sm sm:text-base">
                {userData.email}
              </CardDescription>
              <div className="mt-3 text-xs sm:text-sm text-muted-foreground">
                Member since {new Date(userData.joinDate).toLocaleDateString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 sm:mt-6 w-full"
              >
                View Profile <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Revenue Trend Chart */}
          <Card className="lg:col-span-2 shadow-none">
            <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">
                    Revenue Trend
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Monthly revenue performance
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <span className="text-xs sm:text-sm">
                    12% from last month
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-48 sm:h-64 p-2 sm:p-6 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartColors.light.areaFill}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColors.light.areaFill}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.light.axisStroke}
                    className="text-xs"
                  />
                  <YAxis
                    stroke={chartColors.light.axisStroke}
                    className="text-xs"
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={chartColors.light.gridStroke}
                    opacity={0.1}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.light.tooltipBg,
                      borderColor: chartColors.light.gridStroke,
                      borderRadius: "0.5rem",
                      color: chartColors.light.tooltipText,
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartColors.light.areaStroke}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Property Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            title="Total"
            value={stats.totalProperties}
            icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="up"
            change="+3"
          />
          <StatCard
            title="Rented"
            value={stats.rentedProperties}
            icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="up"
            change="+2"
          />
          <StatCard
            title="Available"
            value={stats.availableProperties}
            icon={<Home className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="down"
            change="-1"
          />
          <StatCard
            title="Pending"
            value={stats.pendingApprovals}
            icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
            trend="neutral"
          />
        </div>

        {/* Occupancy Chart */}
        <Card className="shadow-none">
          <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  Occupancy Rate
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Monthly occupancy percentage
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <ArrowUp className="h-3 w-3" />
                <span className="text-xs sm:text-sm">5% from last month</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-48 sm:h-64 p-2 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={occupancyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.light.gridStroke}
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartColors.light.axisStroke}
                  className="text-xs"
                />
                <YAxis
                  domain={[0, 100]}
                  stroke={chartColors.light.axisStroke}
                  className="text-xs"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.light.tooltipBg,
                    borderColor: chartColors.light.gridStroke,
                    borderRadius: "0.5rem",
                    color: chartColors.light.tooltipText,
                  }}
                  formatter={(value) => [`${value}% occupancy`]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar
                  dataKey="rate"
                  fill={chartColors.light.barFill}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Properties Needing Attention */}
        <Card className="shadow-none">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-lg sm:text-xl">
              Attention Needed
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Properties requiring your action
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <AttentionCard
                title="Expiring"
                count={stats.expiringSoon}
                description="Listings ending soon"
                icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
                action="Renew"
              />
              <AttentionCard
                title="Approvals"
                count={stats.pendingApprovals}
                description="Awaiting review"
                icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                action="Review"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, trend, change }) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
        <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
          {icon}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-1 sm:pt-2">
        <div className="flex items-end">
          <p className="text-xl sm:text-2xl font-light">{value}</p>
          {trend && change && (
            <Badge
              variant={
                trend === "up"
                  ? "default"
                  : trend === "down"
                  ? "destructive"
                  : "secondary"
              }
              className="ml-2 mb-1 text-xs"
            >
              {trend === "up" ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : trend === "down" ? (
                <ArrowDown className="h-3 w-3 mr-1" />
              ) : null}
              {change}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable Attention Card Component
const AttentionCard = ({ title, count, description, icon, action }) => {
  return (
    <Card className="shadow-none">
      <CardContent className="p-3 sm:p-4 flex lg:flex-col xl:flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted dark:bg-muted/50">
            {icon}
          </div>
          <div>
            <p className="font-medium text-sm sm:text-base">{title}</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:mt-4 xl:mt-0 ">
          <Badge
            variant="destructive"
            className="h-6 w-6 sm:h-8 sm:w-8 justify-center text-xs sm:text-sm"
          >
            {count}
          </Badge>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            {action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
