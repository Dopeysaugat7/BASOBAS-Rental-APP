import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const UserProfile = () => {
  // Authentication and routing hooks
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Form handling for profile section
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: profileReset,
    watch: profileWatch,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm();

  // Form handling for password section
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: passwordReset,
    watch: passwordWatch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm();

  // Format address object into a string
  const formatAddress = (address) => {
    if (!address || typeof address !== "object") return "Address not available";
    const { street, city, state, country, postalCode } = address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  // Fetch user bookings
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setBookings(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  // Initialize form and fetch bookings
  useEffect(() => {
    if (user) {
      profileReset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        username: user.username || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      });
      setProfilePicturePreview(user.profilePicture || "");
    }
    fetchBookings();
  }, [user, profileReset]);

  // Refetch bookings if coming from /booking/success
  useEffect(() => {
    if (location.state?.fromBookingSuccess) {
      fetchBookings();
    }
  }, [location.state]);

  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/send-verification",
        {
          email: user.email,
          phone: user.phone,
          verificationMethod: "email",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        navigate(`/otp-verification/${user.email}/${user.phone}`, {
          state: {
            fromProfile: true,
            from: location,
          },
          replace: true,
        });
      } else {
        toast.error(response.data.message || "Verification failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification email"
      );
    }
  };

  /**
   * Handles profile picture change event
   * @param {Event} e - File input change event
   */
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file (JPEG, PNG, GIF)");
      return;
    }
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
    // Create preview URL for the image
    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /**
   * Updates user profile with form data
   * @param {Object} data - Form data from profile form
   */
  const updateProfile = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      formData.append("name", data.name || "");
      formData.append("phone", data.phone || "");
      if (data.bio) formData.append("bio", data.bio);
      if (data.username) formData.append("username", data.username);
      if (data.dateOfBirth) {
        formData.append(
          "dateOfBirth",
          data.dateOfBirth.toISOString().split("T")[0]
        );
      }
      if (profilePicture instanceof File) {
        formData.append("profile", profilePicture);
      }

      // Send PUT request to update profile
      const response = await axios.put(
        "http://localhost:5000/api/v1/user/me/update",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update user context and show success message
      setUser(response.data.user);
      setProfilePicturePreview(response.data.user.profilePicture);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error.response?.data);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Changes user password
   * @param {Object} data - Form data from password form
   */
  const changePassword = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim(),
      };

      // Send POST request to change password
      await axios.post(
        "http://localhost:5000/api/v1/user/me/change-password",
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password changed successfully");
      // Reset password form
      passwordReset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Password change error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      // Show appropriate error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error changing password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles account deletion
   */
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      // Send DELETE request to remove user account
      await axios.delete("http://localhost:5000/api/v1/user/me/delete-user", {
        withCredentials: true,
      });

      toast.success("Account deleted successfully");
      // Logout and redirect to home
      logout();
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || "Error deleting account";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Map booking status to display label and color
  const getBookingStatus = (status) => {
    switch (status) {
      case "confirmed":
        return { label: "Upcoming", color: "text-green-500 bg-green-100" };
      case "cancelled":
        return { label: "Failed", color: "text-red-500 bg-red-100" };
      case "pending":
        return { label: "Pending", color: "text-yellow-500 bg-yellow-100" };
      default:
        return { label: status, color: "text-gray-500 bg-gray-100" };
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-full">
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-[#047cb4] data-[state=active]:text-white transition-colors duration-200"
          >
            My Bookings
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Profile Tab Content */}
          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleProfileSubmit(updateProfile)}>
              <div className="flex sm:flex-row sm:items-start flex-col gap-6 mb-8 bg-white dark:bg-[#0f172b] p-6 rounded-lg border-1">
                {/* Profile Picture Section */}
                <div className="flex sm:flex-col items-center justify-center gap-10 sm:gap-2">
                  <Avatar className="h-24 w-24 sm:mb-4 mb-2">
                    <AvatarImage
                      src={
                        profilePicturePreview ||
                        user?.profilePicture ||
                        "/default-image.svg"
                      }
                      alt={user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="relative">
                    <Button variant="outline" size="sm" type="button">
                      <Label
                        htmlFor="profilePicture"
                        className="cursor-pointer"
                      >
                        Change Photo
                      </Label>
                    </Button>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleProfilePictureChange}
                    />
                  </div>
                </div>

                {/* Name and Username Section */}
                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        className="sm:text-sm sm:font-medium mt-1"
                        {...profileRegister("name", {
                          required: "Full name is required",
                        })}
                        placeholder="Your name"
                      />
                      {profileErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {profileErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username
                      </Label>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600 mr-1">@</span>
                        <Input
                          id="username"
                          className="flex-1"
                          {...profileRegister("username")}
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card */}
              <Card className="border rounded-lg mb-6 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bio Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      {...profileRegister("bio")}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  {/* Date of Birth Field with Calendar Popover */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {profileWatch("dateOfBirth") ? (
                            format(profileWatch("dateOfBirth"), "PPP")
                          ) : (
                            <span>Select your date of birth</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={profileWatch("dateOfBirth")}
                          onSelect={(date) =>
                            setProfileValue("dateOfBirth", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Email Field (disabled) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      {...profileRegister("email")}
                      placeholder="your@email.com"
                      disabled
                      className="opacity-70 cursor-not-allowed"
                    />
                    {/* Email verification button */}
                    {!user?.accountVerified && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                        className="p-0 h-auto text-sm"
                      >
                        Verify your email
                      </Button>
                    )}
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...profileRegister("phone", {
                        required: "Phone is required",
                      })}
                      placeholder="+1234567890"
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-red-500">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                {/* Save Changes Button */}
                <div className="flex justify-end mr-6">
                  <Button
                    type="submit"
                    disabled={isProfileSubmitting || isLoading}
                  >
                    {isLoading ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </Card>
            </form>
          </TabsContent>

          {/* Security Tab Content */}
          <TabsContent value="security" className="space-y-6">
            {/* Account Verification Card */}
            <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Account Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Email Verification Section */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                  {user?.accountVerified ? (
                    <span className="text-green-600 text-sm font-medium">
                      Verified
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVerifyEmail}
                      disabled={isLoading}
                    >
                      Verify
                    </Button>
                  )}
                </div>

                {/* Phone Verification Section */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <div>
                    <p className="font-medium">Phone Verified</p>
                    <p className="text-sm text-gray-600">{user?.phone}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Verify
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit(changePassword)}>
                <CardContent className="space-y-4">
                  {/* Current Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordRegister("currentPassword", {
                        required: "Current password is required",
                      })}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordRegister("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        maxLength: {
                          value: 32,
                          message: "Password cannot exceed 32 characters",
                        },
                      })}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordRegister("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === passwordWatch("newPassword") ||
                          "Passwords don't match",
                      })}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end mt-5">
                  <Button
                    type="submit"
                    disabled={isPasswordSubmitting || isLoading}
                  >
                    {isLoading ? "Updating..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Delete Account Card */}
            <Card className="border-2 rounded-lg border-destructive shadow-none">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                >
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingsLoading ? (
                  <p className="text-sm text-gray-600">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-gray-600">No bookings found.</p>
                ) : (
                  bookings.map((booking) => {
                    const status = getBookingStatus(booking.status);
                    const primaryImage =
                      booking.property.images?.[0].url ||
                      "/placeholder-property.jpg";
                    return (
                      <div
                        key={booking._id}
                        className="flex flex-col sm:flex-row items-start bg-white dark:bg-[#0f172b] border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                      >
                        <img
                          src={primaryImage}
                          alt={`${booking.property.title} thumbnail`}
                          className="w-full sm:w-32 h-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">
                                {booking.property.title}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatAddress(booking.property.address)}
                              </p>
                            </div>
                            <span
                              className={`${status.color} text-xs font-medium px-2 py-1 rounded-full`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              Check-in:{" "}
                              {format(new Date(booking.startDate), "PPP")}
                            </p>
                            <p className="text-sm">
                              Check-out:{" "}
                              {format(new Date(booking.endDate), "PPP")}
                            </p>
                            <p className="text-sm font-medium">
                              Total Amount: NPR {booking.totalAmount}
                            </p>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button
                              variant="link"
                              className="text-blue-600 p-0 h-auto hover:underline"
                              onClick={() =>
                                navigate(`/${booking.property._id}`)
                              }
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                Sample Review Item
                <div className="border rounded-lg p-4 hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <h3 className="font-bold">John Host</h3>
                  <p className="text-gray-400">Ocean View Villa</p>
                  <p className="mt-2 text-gray-50">
                    "Sarah was a wonderful guest! Very respectful of the
                    property and great communication throughout their stay."
                  </p>
                </div>
              </CardContent>
            </Card> */}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;
