import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  CreditCard,
  Activity,
  Star,
  MoreHorizontal,
  UserRound,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  CalendarOff,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useState } from "react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    path: "/properties",
    icon: Home,
    label: "Properties",
    subItems: [
      { path: "/properties/add", icon: Plus, label: "Add Property" },
      {
        path: "/properties/active",
        icon: CheckCircle,
        label: "Active Properties",
      },
      { path: "/properties/pending", icon: Clock, label: "Pending Properties" },
      {
        path: "/properties/rejected",
        icon: XCircle,
        label: "Rejected Properties",
      },
      {
        path: "/properties/expired",
        icon: CalendarOff,
        label: "Expired Properties",
      },
    ],
  },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/billings", icon: CreditCard, label: "Billings" },
  { path: "/activity", icon: Activity, label: "Activity Logs" },
  { path: "/favorites", icon: Star, label: "Favorites" },
  { path: "/dashboard/profile", icon: UserRound, label: "Profile" },
];

export default function AdminNav() {
  const location = useLocation();
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:sticky lg:inset-y-0 lg:top-16 lg:left-0 lg:mt-10 lg:mb-10 lg:block lg:w-64 lg:h-[75vh] lg:border-1 rounded-xl dark:bg-[#0f172b] lg:overflow-y-auto">
        <div className="flex h-full flex-col gap-4 px-4 py-6">
          <h2 className="px-4 text-lg font-semibold hidden lg:block">
            Navigation
          </h2>
          <ScrollArea className="flex-1">
            <nav className="space-y-1 px-2 flex lg:flex-col">
              {navItems.map((item) => (
                <div key={item.path} className="space-y-1">
                  {item.subItems ? (
                    <Collapsible
                      open={isPropertiesOpen}
                      onOpenChange={setIsPropertiesOpen}
                      className="space-y-1"
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            location.pathname.startsWith(item.path) ||
                              isPropertiesOpen
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </div>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isPropertiesOpen ? "rotate-180" : ""
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-6 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              location.pathname === subItem.path
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        location.pathname.endsWith(item.path)
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden sticky top-18 left-0 mt-10 self-center w-[100%] bg-background border rounded-lg shadow-lg z-10">
        <div className="flex items-center justify-between px-2 py-1">
          {/* Visible links */}
          {navItems.slice(0, 4).map((item) =>
            item.subItems ? (
              <DropdownMenu
                key={item.path}
                open={mobileDropdownOpen}
                onOpenChange={setMobileDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex flex-row gap-3 justify-center items-center p-2 rounded-sm text-xs transition-colors",
                      location.pathname.startsWith(item.path)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-semibold hidden sm:block">
                      {item.label}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isPropertiesOpen ? "rotate-180" : ""
                      )}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="top"
                  className="w-48 ml-15"
                >
                  {item.subItems.map((subItem) => (
                    <DropdownMenuItem key={subItem.path} asChild>
                      <Link
                        to={subItem.path}
                        className={cn(
                          "flex items-center gap-3 w-full py-3",
                          location.pathname === subItem.path && "bg-muted"
                        )}
                        onClick={() => setMobileDropdownOpen(false)}
                      >
                        <subItem.icon className="h-4 w-4" />
                        {subItem.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-row gap-3 justify-center items-center p-2 rounded-sm text-xs transition-colors",
                  location.pathname.startsWith(item.path)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold hidden sm:block">
                  {item.label}
                </span>
              </Link>
            )
          )}

          {/* Three-dot dropdown for remaining links */}
          {navItems.length > 4 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-sm h-10 w-10"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" className="w-48">
                {navItems.slice(4).map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 w-full",
                        location.pathname.startsWith(item.path) && "bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </>
  );
}
