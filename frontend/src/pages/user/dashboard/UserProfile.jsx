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
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: profileReset,
    watch: profileWatch,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm();

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: passwordReset,
    watch: passwordWatch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm();

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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      toast.error("Please select an image file (JPEG, PNG, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
  };

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

  const changePassword = async (data) => {
    try {
      setIsLoading(true);

      const payload = {
        currentPassword: data.currentPassword.trim(),
        newPassword: data.newPassword.trim(),
      };

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

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error changing password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await axios.delete("http://localhost:5000/api/v1/user/me/delete-user", {
        withCredentials: true,
      });

      toast.success("Account deleted successfully");
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-200 dark:bg-gray-800 gap-1 p-1 rounded-lg">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white py-2 rounded-md font-medium transition-all duration-300 dark:data-[state=active]:bg-[#027EAA] dark:data-[state=active]:text-white dark:text-gray-300"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white py-2 rounded-md font-medium transition-all duration-300 dark:data-[state=active]:bg-[#027EAA] dark:data-[state=active]:text-white dark:text-gray-300"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="bookings" 
              className="data-[state=active]:bg-primary data-[state=active]:text-white py-2 rounded-md font-medium transition-all duration-300 dark:data-[state=active]:bg-[#027EAA] dark:data-[state=active]:text-white dark:text-gray-300"
            >
              My Bookings
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <form onSubmit={handleProfileSubmit(updateProfile)}>
                <div className="flex flex-col md:flex-row gap-6 mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-[#027EAA]">
                        <AvatarImage
                          src={
                            profilePicturePreview ||
                            user?.profilePicture ||
                            "/default-image.svg"
                          }
                          alt={user?.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#027EAA] text-white text-2xl">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Label
                        htmlFor="profilePicture"
                        className="absolute -bottom-2 right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#027EAA] dark:text-[#027EAA]"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Label>
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureChange}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          className="mt-1 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                          {...profileRegister("name", {
                            required: "Full name is required",
                          })}
                          placeholder="Your name"
                        />
                        {profileErrors.name && (
                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                            {profileErrors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Username
                        </Label>
                        <div className="flex items-center mt-1">
                          <span className="text-gray-600 dark:text-gray-400 mr-1">@</span>
                          <Input
                            id="username"
                            className="flex-1 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                            {...profileRegister("username")}
                            placeholder="username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
                  <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    <CardTitle className="text-lg text-gray-800 dark:text-white">
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                      <Input
                        id="bio"
                        {...profileRegister("bio")}
                        placeholder="Tell us about yourself"
                        className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {profileWatch("dateOfBirth") ? (
                              format(profileWatch("dateOfBirth"), "PPP")
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400">Select your date of birth</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700">
                          <Calendar
                            mode="single"
                            selected={profileWatch("dateOfBirth")}
                            onSelect={(date) =>
                              setProfileValue("dateOfBirth", date)
                            }
                            initialFocus
                            className="dark:bg-gray-800"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          {...profileRegister("email")}
                          placeholder="your@email.com"
                          disabled
                          className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 border-gray-300 opacity-100 cursor-not-allowed"
                        />
                        {!user?.accountVerified && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={handleVerifyEmail}
                            disabled={isLoading}
                            className="absolute right-0 top-0 text-sm text-[#027EAA] hover:text-[#02658a] dark:text-[#027EAA] dark:hover:text-[#3da7c8]"
                          >
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        {...profileRegister("phone", {
                          required: "Phone is required",
                        })}
                        placeholder="+1234567890"
                        className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                      />
                      {profileErrors.phone && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <div className="flex justify-end p-6 border-t dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={isProfileSubmitting || isLoading}
                      className="bg-[#027EAA] hover:bg-[#02658a] px-6 py-2 rounded-lg dark:bg-[#027EAA] dark:hover:bg-[#02658a]"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Card>
              </form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <CardTitle className="text-lg text-gray-800 dark:text-white">Account Verification</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-300">Email Verified</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    </div>
                    {user?.accountVerified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleVerifyEmail}
                        disabled={isLoading}
                        className="border-[#027EAA] text-[#027EAA] hover:bg-[#027EAA]/10 dark:border-[#027EAA] dark:text-[#027EAA] dark:hover:bg-[#027EAA]/20"
                      >
                        Verify
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-300">Phone Verified</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user?.phone}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled 
                      className="text-gray-400 dark:text-gray-500 dark:border-gray-600"
                    >
                      Verify
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <form onSubmit={handlePasswordSubmit(changePassword)}>
                <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                    <CardTitle className="text-lg text-gray-800 dark:text-white">Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordRegister("currentPassword", {
                          required: "Current password is required",
                        })}
                        className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">New Password</Label>
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
                        className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
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
                        className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 focus:border-[#027EAA] focus:ring-[#027EAA]"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end p-6 border-t dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={isPasswordSubmitting || isLoading}
                      className="bg-[#027EAA] hover:bg-[#02658a] px-6 py-2 rounded-lg dark:bg-[#027EAA] dark:hover:bg-[#02658a]"
                    >
                      {isLoading ? "Updating..." : "Change Password"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>

              <Card className="border-2 border-red-200 dark:border-red-800 rounded-lg">
                <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b-2 border-red-200 dark:border-red-800">
                  <CardTitle className="text-lg text-red-800 dark:text-red-500">
                    Delete Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end p-6 border-t-2 border-red-200 dark:border-red-800">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg"
                  >
                    Delete Account
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <CardTitle className="text-lg text-gray-800 dark:text-white">My Bookings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Ocean View Villa</h3>
                        <p className="text-gray-500 dark:text-gray-400">Miami, Florida</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Upcoming
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">Check-in: Mar 15, 2025</p>
                    <div className="flex justify-end mt-3">
                      <Button variant="link" className="text-[#027EAA] p-0 h-auto dark:text-[#027EAA]">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">Mountain Retreat</h3>
                        <p className="text-gray-500 dark:text-gray-400">Aspen, Colorado</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Completed
                      </span>
                    </div>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">Check-in: Feb 1, 2025</p>
                    <div className="flex justify-end mt-3">
                      <Button variant="link" className="text-[#027EAA] p-0 h-auto dark:text-[#027EAA]">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <CardTitle className="text-lg text-gray-800 dark:text-white">My Reviews</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:border-gray-600">
                    <h3 className="font-bold text-gray-800 dark:text-white">John Host</h3>
                    <p className="text-gray-500 dark:text-gray-400">Ocean View Villa</p>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
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
    </div>
  );
};

export default UserProfile;