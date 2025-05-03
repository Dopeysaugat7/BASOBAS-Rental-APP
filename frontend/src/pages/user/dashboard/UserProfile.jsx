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
import { Navigate, useLocation, useNavigate } from "react-router-dom";
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
    formState: { errors: passwordErrors, isPasswordSubmitting },
  } = useForm();

  // Initialize form with user data when component mounts or user changes
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
  }, [user, profileReset]);

  /**
   * Handles email verification process
   */
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

    // Validate file type
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

      // Append all fields to form data
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

      // Prepare payload with trimmed values
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

            {/* Password Change Form */}
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

          {/* Bookings Tab Content */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Bookings List Card */}
            <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample Booking Item 1 */}
                <div className="border rounded-lg p-4 hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">Ocean View Villa</h3>
                      <p className="text-gray-400">Miami, Florida</p>
                    </div>
                    <span className="text-green-400 text-sm font-medium">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-sm mt-2">Check-in: Mar 15, 2025</p>
                  <div className="flex justify-end mt-3">
                    <Button variant="link" className="text-blue-600 p-0 h-auto">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Sample Booking Item 2 */}
                <div className="border rounded-lg p-4 hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">Mountain Retreat</h3>
                      <p className="text-gray-400">Aspen, Colorado</p>
                    </div>
                    <span className="text-gray-400 text-sm font-medium">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm mt-2">Check-in: Feb 1, 2025</p>
                  <div className="flex justify-end mt-3">
                    <Button variant="link" className="text-blue-600 p-0 h-auto">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Card */}
            <Card className="border rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Sample Review Item */}
                <div className="border rounded-lg p-4 hover:bg-[rgba(0,0,0,0.1)] transition-colors">
                  <h3 className="font-bold">John Host</h3>
                  <p className="text-gray-400">Ocean View Villa</p>
                  <p className="mt-2 text-gray-50">
                    "Sarah was a wonderful guest! Very respectful of the
                    property and great communication throughout their stay."
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default UserProfile;