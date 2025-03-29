/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Sofa,
  CookingPot,
  Wifi,
  AirVent,
  Tv,
  Car,
  Dumbbell,
  Dog,
  Camera,
  ArrowRight,
  ArrowLeft,
  Landmark,
  DollarSign,
  Wallet,
  Ruler,
  Calendar,
  AlarmClock,
  Square,
  Key,
  CheckCircle,
  Upload,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Form Schema
const formSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000),
  propertyType: z.enum([
    "House",
    "Apartment",
    "Villa",
    "Farmhouse",
    "Cottage",
    "Penthouse",
    "Duplex",
    "Studio",
  ]),
  bhkConfiguration: z.object({
    bedrooms: z.number().min(1),
    bathrooms: z.number().min(1),
    halls: z.number().min(1),
    kitchens: z.number().min(1),
  }),
  totalRooms: z.number().min(1, "Must have at least 1 room"),
  builtUpArea: z.number().min(1),
  carpetArea: z.number().min(1).optional(),
  furnishingStatus: z.enum(["Furnished", "Semi-Furnished", "Unfurnished"]),
  pricePerMonth: z.number().min(0),
  pricePerDay: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  address: z.object({
    street: z.string().min(5, "Street must be at least 5 characters"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    postalCode: z
      .string()
      .min(3, "Postal code is required")
      .regex(/^[0-9]+$/, "Postal code must contain only numbers"),
    country: z.string().min(2).default("Nepal"),
    landmark: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  houseRules: z.object({
    petsAllowed: z.boolean().default(false),
    smokingAllowed: z.boolean().default(false),
    eventsAllowed: z.boolean().default(false),
    extraRules: z.string().max(500).optional(),
  }),
  isAvailable: z.boolean().default(true),
  availableFrom: z.date(),
  minimumStayMonths: z.number().default(1),
  maxGuests: z.number().min(1),
});

const amenitiesList = [
  { id: "Wifi", label: "WiFi", icon: <Wifi className="h-4 w-4" /> },
  {
    id: "Air Conditioning",
    label: "AC",
    icon: <AirVent className="h-4 w-4" />,
  },
  { id: "TV", label: "TV", icon: <Tv className="h-4 w-4" /> },
  { id: "Parking", label: "Parking", icon: <Car className="h-4 w-4" /> },
  { id: "Gym", label: "Gym", icon: <Dumbbell className="h-4 w-4" /> },
  { id: "Pet-Friendly", label: "Pets", icon: <Dog className="h-4 w-4" /> },
  { id: "Security", label: "Security", icon: <Camera className="h-4 w-4" /> },
  {
    id: "Modular Kitchen",
    label: "Modern Kitchen",
    icon: <CookingPot className="h-4 w-4" />,
  },
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      propertyType: "Apartment",
      bhkConfiguration: {
        bedrooms: 1,
        bathrooms: 1,
        halls: 1,
        kitchens: 1,
      },
      totalRooms: 4,
      builtUpArea: 0,
      carpetArea: undefined,
      furnishingStatus: "Unfurnished",
      pricePerMonth: 0,
      pricePerDay: undefined,
      securityDeposit: undefined,
      amenities: [],
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nepal",
        landmark: "",
        coordinates: {
          lat: 0,
          lng: 0,
        },
      },
      houseRules: {
        petsAllowed: false,
        smokingAllowed: false,
        eventsAllowed: false,
        extraRules: "",
      },
      isAvailable: true,
      availableFrom: new Date(),
      minimumStayMonths: 1,
      maxGuests: 1,
    },
  });

  const {
    data: property,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:5000/api/properties/${id}`,
        {
          withCredentials: true,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        setExistingImages(data.images || []);

        const formData = {
          ...data,
          availableFrom: new Date(data.availableFrom),
          amenities: data.amenities || [],
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            postalCode: data.address?.postalCode || "",
            country: data.address?.country || "Nepal",
            landmark: data.address?.landmark || "",
            coordinates: data.address?.coordinates || { lat: 0, lng: 0 },
          },
          houseRules: {
            petsAllowed: data.houseRules?.petsAllowed || false,
            smokingAllowed: data.houseRules?.smokingAllowed || false,
            eventsAllowed: data.houseRules?.eventsAllowed || false,
            extraRules: data.houseRules?.extraRules || "",
          },
          bhkConfiguration: data.bhkConfiguration || {
            bedrooms: 1,
            bathrooms: 1,
            halls: 1,
            kitchens: 1,
          },
          totalRooms:
            data.totalRooms ||
            (data.bhkConfiguration?.bedrooms || 1) +
              (data.bhkConfiguration?.bathrooms || 1) +
              (data.bhkConfiguration?.halls || 1) +
              (data.bhkConfiguration?.kitchens || 1),
        };

        form.reset(formData);
      }
    },
  });

  // Calculate total rooms whenever BHK changes
  const bhkConfig = form.watch("bhkConfiguration");
  useEffect(() => {
    if (bhkConfig) {
      const total =
        (bhkConfig.bedrooms || 0) +
        (bhkConfig.bathrooms || 0) +
        (bhkConfig.halls || 0) +
        (bhkConfig.kitchens || 0);
      form.setValue("totalRooms", total);
    }
  }, [bhkConfig, form]);

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length + existingImages.length > 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removeExistingImage = async (imageId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/properties/${id}/images/${imageId}`,
        { withCredentials: true }
      );
      setExistingImages(existingImages.filter((img) => img._id !== imageId));
      toast.success("Image removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove image");
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/properties/${id}/primary-image`,
        { imageId },
        { withCredentials: true }
      );
      setExistingImages(
        existingImages.map((img) => ({
          ...img,
          isPrimary: img._id === imageId,
        }))
      );
      toast.success("Primary image updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to set primary image"
      );
    }
  };

  const updateProperty = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();

      // Append new images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Prepare property data with proper coordinates
      const propertyData = {
        ...data,
        availableFrom: data.availableFrom.toISOString(),
        address: JSON.stringify({
          ...data.address,
          coordinates: data.address.coordinates || { lat: 0, lng: 0 },
        }),
        bhkConfiguration: JSON.stringify({
          bedrooms: Number(data.bhkConfiguration.bedrooms),
          bathrooms: Number(data.bhkConfiguration.bathrooms),
          halls: Number(data.bhkConfiguration.halls),
          kitchens: Number(data.bhkConfiguration.kitchens),
        }),
        totalRooms: Number(data.totalRooms),
        builtUpArea: Number(data.builtUpArea),
        carpetArea: data.carpetArea ? Number(data.carpetArea) : undefined,
        pricePerMonth: Number(data.pricePerMonth),
        pricePerDay: data.pricePerDay ? Number(data.pricePerDay) : undefined,
        securityDeposit: data.securityDeposit
          ? Number(data.securityDeposit)
          : undefined,
        amenities: JSON.stringify(data.amenities || []),
        houseRules: JSON.stringify({
          ...data.houseRules,
          extraRules: data.houseRules.extraRules || "",
        }),
        isAvailable: Boolean(data.isAvailable),
        minimumStayMonths: Number(data.minimumStayMonths),
        maxGuests: Number(data.maxGuests),
      };

      // Append all property data fields
      Object.entries(propertyData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["property", id]);
      queryClient.invalidateQueries(["myProperties"]);
      toast.success("Property updated successfully!");
      navigate(`/dashboard/my-properties/${id}`);
    },
    onError: (error) => {
      console.error("Error details:", error.response?.data);
      toast.error(
        error.response?.data?.message ||
          "Failed to update property. Please check your data and try again."
      );
    },
    onSettled: () => {
      setIsSubmitting(false);
      setUploadProgress(0);
    },
  });

  const onSubmit = async (data) => {
    if (images.length + existingImages.length < 3) {
      toast.error("Please have at least 3 images total");
      return;
    }
    setIsSubmitting(true);
    updateProperty.mutate(data);
  };

  const nextStep = () => {
    let isValid = true;

    if (step === 1) {
      isValid =
        form.getValues("title") &&
        form.getValues("description") &&
        form.getValues("propertyType");
    } else if (step === 2) {
      isValid =
        form.getValues("builtUpArea") && form.getValues("pricePerMonth");
    } else if (step === 3) {
      const address = form.getValues("address");
      isValid =
        address.street &&
        address.city &&
        address.state &&
        address.postalCode &&
        address.country;
    }

    if (!isValid) {
      toast.warning("Please fill all required fields");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step > 1 ? step - 1 : 1);

  const checkStepCompletion = (stepNumber) => {
    const values = form.getValues();
    switch (stepNumber) {
      case 1:
        return values.title && values.description && values.propertyType;
      case 2:
        return values.builtUpArea && values.pricePerMonth;
      case 3: {
        const addr = values.address;
        return (
          addr.street &&
          addr.city &&
          addr.state &&
          addr.postalCode &&
          addr.country
        );
      }
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-destructive mb-4">
          Failed to load property data.
        </div>
        <Button
          onClick={() => queryClient.refetchQueries(["property", id])}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-full">
      <Card className="border-1 shadow-none px-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold pb-4">
            <Home className="h-6 w-6 text-primary" />
            <span>Edit Property</span>
          </CardTitle>

          {/* Progress Stepper */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between relative">
              {[1, 2, 3, 4].map((stepNumber) => {
                const isComplete = checkStepCompletion(stepNumber);

                return (
                  <div
                    key={stepNumber}
                    className="flex flex-col items-center z-10"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center 
                      ${
                        step >= stepNumber
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        stepNumber
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        step >= stepNumber
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stepNumber === 1 && "Basic Info"}
                      {stepNumber === 2 && "Details"}
                      {stepNumber === 3 && "Location"}
                      {stepNumber === 4 && "Media"}
                    </span>
                  </div>
                );
              })}
              <div className="absolute top-4 left-8 right-8 h-1 bg-muted -z-1">
                <div
                  className="h-1 bg-primary transition-all duration-300"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your property
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Title*</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Beautiful 2BHK Apartment in Downtown"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {formSchema.shape.propertyType._def.values.map(
                                (type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description*</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your property in detail..."
                              rows={5}
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Guests*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Property Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Specify your property specifications
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bhkConfiguration.bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Bed className="h-4 w-4" /> Bedrooms*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bhkConfiguration.bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Bath className="h-4 w-4" /> Bathrooms*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bhkConfiguration.halls"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Sofa className="h-4 w-4" /> Living Halls*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bhkConfiguration.kitchens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CookingPot className="h-4 w-4" /> Kitchens*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="builtUpArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Square className="h-4 w-4" /> Built-up Area
                              (sq.ft)*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carpetArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Ruler className="h-4 w-4" /> Carpet Area (sq.ft)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="totalRooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Key className="h-4 w-4" /> Total Rooms
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="pricePerMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" /> Monthly Rent*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="securityDeposit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" /> Deposit
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="furnishingStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Furnishing*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select furnishing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Furnished">
                                  Furnished
                                </SelectItem>
                                <SelectItem value="Semi-Furnished">
                                  Semi-Furnished
                                </SelectItem>
                                <SelectItem value="Unfurnished">
                                  Unfurnished
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minimumStayMonths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> Min Stay
                              (months)*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <AlarmClock className="h-4 w-4" /> Available From*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value.toISOString().split("T")[0]}
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Property is currently available for rent
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Property Location</h3>
                    <p className="text-sm text-muted-foreground">
                      Where is your property located?
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address*</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City*</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province*</FormLabel>
                            <FormControl>
                              <Input placeholder="NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code*</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country*</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.landmark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Landmark className="h-4 w-4" /> Nearby Landmark
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Near Central Park"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">House Rules</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="houseRules.petsAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <Dog className="h-4 w-4" /> Pets Allowed
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="houseRules.smokingAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2">
                                  <AlarmClock className="h-4 w-4" /> Smoking
                                  Allowed
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="houseRules.eventsAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Events Allowed</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="houseRules.extraRules"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Rules</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any other rules or restrictions..."
                                rows={3}
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Amenities & Images */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Amenities & Media</h3>
                    <p className="text-sm text-muted-foreground">
                      Showcase your property's features
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Select Amenities</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {amenitiesList.map((amenity) => (
                        <FormField
                          key={amenity.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={amenity.id}
                                    checked={field.value?.includes(amenity.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([
                                          ...(field.value || []),
                                          amenity.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter(
                                            (value) => value !== amenity.id
                                          ) || []
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={amenity.id}
                                    className="text-sm font-medium leading-none flex items-center gap-2"
                                  >
                                    {amenity.icon} {amenity.label}
                                  </label>
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Property Images</h4>
                    <p className="text-xs text-muted-foreground">
                      Upload at least 3 images total (max 10). First image will
                      be used as cover.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {/* Existing images */}
                      {existingImages.map((image, index) => (
                        <div
                          key={image._id}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={image.url}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => removeExistingImage(image._id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {image.isPrimary ? (
                            <Badge className="absolute top-2 left-2">
                              Primary
                            </Badge>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs"
                              onClick={() => setPrimaryImage(image._id)}
                            >
                              Set Primary
                            </Button>
                          )}
                        </div>
                      ))}

                      {/* New image upload */}
                      <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Upload Images
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>

                      {/* Newly uploaded images */}
                      {images.map((file, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        Uploading images... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button type="button" onClick={nextStep} className="gap-1">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting || uploadProgress > 0}
                  >
                    {isSubmitting || uploadProgress > 0 ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {uploadProgress > 0 ? "Uploading..." : "Updating..."}
                      </>
                    ) : (
                      "Update Property"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProperty;
