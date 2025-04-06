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
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion"; // Import animation components
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/ThemeProvider";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
      <div className="shadow-sm w-screen lg:px-20 px-6">
        <div className="flex items-center justify-between h-16">
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
            <div className="relative w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                className="pl-10 rounded-full dark:border-0 border-1 border-gray-300 bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-2 lg:gap-6">
              <Button variant="ghost" className="rounded-full" asChild>
                <Link to="/favorites">
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
                    className="relative h-8 w-8 rounded-full border border-muted hover:bg-secondary"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture} alt="User" />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <UserCircle className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 mt-4"
                  align="end"
                  forceMount
                >
                  <Link to="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTheme();
                    }}
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
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive gap-2"
                    onClick={() => logout()}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu with Animation */}
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
                className="pb-4"
              >
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search destinations..."
                    className="pl-10 rounded-full border-none bg-secondary/50 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden absolute right-0 top-4/8 -translate-y-1/2 bg-gray-900 w-20 rounded-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button> */}
                </div>
                <nav className="mt-4 space-y-2">
                  {[
                    { path: "/", label: "Home", icon: Home },
                    { path: "/favorites", label: "Favorites", icon: Heart },
                    {
                      path: "/messages",
                      label: "Messages",
                      icon: MessageSquare,
                    },
                    { path: "/host", label: "List your property", icon: House },
                  ].map((item, index) => (
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
                            : "ghost"
                        }
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {<item.icon className="mr-2 h-4 w-4" />}
                          {item.label}
                        </Link>
                      </Button>
                    </motion.div>
                  ))}
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
