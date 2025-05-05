/* eslint-disable no-unused-vars */
import {
  Search,
  Heart,
  UserCircle,
  Menu,
  X,
  Home,
  House,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Sun,
  Moon,
  Settings,
  Plus,
  LogIn,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion"; // Import animation components
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/ThemeProvider";
import { navItems } from "@/data";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const propertyTypes = [
  "Any Type",
  "House",
  "Apartment",
  "Villa",
  "Cabin",
  "Farmhouse",
  "Studio",
  "Penthouse",
];

export const NavbarSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("Any Type");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || propertyType !== "Any Type") {
      navigate("/search", {
        state: {
          searchParams: {
            location: searchQuery,
            propertyType: propertyType === "Any Type" ? "any" : propertyType,
            priceRange: [0, 100000],
          },
        },
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-xl">
      <div className="relative flex-1 border-r-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="City or neighborhood..."
          className="pl-10 rounded-r-none border-1 border-accent focus-visible:ring-1 focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <Select
        value={propertyType}
        onValueChange={setPropertyType}
        modal={false}
      >
        <SelectTrigger className="w-[180px] md:w-[160px] lg:w-[200px] rounded-none border-l-0 border-r-0 focus:ring-0 focus:ring-offset-0 border-1 border-accent">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Property type" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {propertyTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="submit"
        className="rounded-l-none px-4 bg-primary hover:bg-primary/90"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300  ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b"
          : "bg-background"
      }`}
    >
      <div className="shadow-sm w-screen lg:px-20 px-6 overflow-x-hidden">
        <div className="flex items-center gap-6 justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/basobas-logo.png"
              alt="Basobas Logo"
              className="h-6 md:h-7 w-auto object-fit"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 ">
            {/* Search Bar */}
            <NavbarSearch />

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 lg:gap-6">
              <Button variant="ghost" className="rounded-full" asChild>
                <Link to="/dashboard/favorites">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" className="rounded-full" asChild>
                <Link to="/messages">
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </Button>
              <Button className="rounded-full" variant={"outline"} asChild>
                <Link to="/dashboard/add-property">
                  <span className="hidden lg:inline font-semibold self-center">
                    List your property
                  </span>
                  <House className="h-5 w-5 lg:hidden block" />
                </Link>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full border hover:bg-secondary"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.profilePicture}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/50">
                        {user?.name?.charAt(0)?.toUpperCase() || (
                          <UserCircle className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-2 p-2 rounded-xl shadow-lg"
                  align="end"
                  forceMount
                >
                  <div className="px-2 py-1.5 text-sm font-medium truncate">
                    {user?.name || "Account"}
                  </div>
                  <div className="px-2 text-xs text-muted-foreground truncate">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator className="my-1" />

                  <Link to="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg px-2 py-2">
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg px-2 py-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 rounded-lg px-2 py-2"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />
                  {user ? (
                    <DropdownMenuItem
                      className="w-full gap-2 rounded-lg text-destructive hover:text-destructive"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer text-accent-foreground hover:text-primary gap-2 rounded-lg px-2 py-2"
                      onClick={() => {
                        navigate("/auth");
                      }}
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </DropdownMenuItem>
                  )}
                  {/* <DropdownMenuItem
                    className="cursor-pointer text-destructive gap-2 rounded-lg px-2 py-2"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu with Modern Design */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.2 }}
                className="pb-4 pt-2"
              >
                <NavbarSearch />

                <nav className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Button
                        variant={
                          location.pathname === item.path
                            ? "secondary"
                            : item.variant || "ghost"
                        }
                        size="lg"
                        className={cn(
                          "w-full justify-start rounded-lg",
                          item.variant === "ghost" &&
                            "bg-primary text-white hover:bg-primary/90 dark:bg-accent"
                        )}
                        asChild
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3"
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </Button>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.05 + 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="lg"
                      className="w-full justify-start rounded-lg bg-primary text-white hover:bg-primary/90 dark:bg-accent dark:hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                      asChild
                    >
                      <Link
                        to="/dashboard/add-property"
                        className="flex items-center gap-3"
                      >
                        <Plus className="h-5 w-5" />
                        List your property
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Modern Profile Section with Distinct Background */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.05 }}
                    className="pt-2"
                  >
                    <div className="bg-gradient-to-br from-secondary/20 to-muted/20 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-background">
                          <AvatarImage
                            src={user?.profilePicture}
                            alt={user?.name || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/50">
                            {user?.name?.charAt(0)?.toUpperCase() || (
                              <UserCircle className="h-5 w-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {user?.name || "Account"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons with Modern Style */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 rounded-lg"
                        onClick={toggleTheme}
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="h-4 w-4" />
                            Light
                          </>
                        ) : (
                          <>
                            <Moon className="h-4 w-4" />
                            Dark
                          </>
                        )}
                      </Button>

                      {user ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 rounded-lg text-destructive hover:text-destructive"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 rounded-lg text-accent-foreground hover:text-primary"
                          onClick={() => {
                            navigate("/auth");
                          }}
                        >
                          <LogIn className="h-4 w-4" />
                          Login
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
