/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Home,
  MapPin,
  Layers,
  CheckCircle,
  Upload,
  X,
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
} from "lucide-react";
import axios from "axios";

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
import { useCreateProperty } from "@/hooks/useProperties";

// Form Schema (simplified - removed coordinates from address)
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

const AddProperty = () => {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateProperty();

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
      totalRooms: 4, // Default calculated from BHK
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
        country: "",
        landmark: "",
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

  // Calculate total rooms whenever BHK changes
  const bhkConfig = form.watch("bhkConfiguration");
  useEffect(() => {
    if (bhkConfig) {
      form.setValue(
        "totalRooms",
        bhkConfig.bedrooms +
          bhkConfig.bathrooms +
          bhkConfig.halls +
          bhkConfig.kitchens
      );
    }
  }, [bhkConfig, form]);

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

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 10) {
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Prepare property data with Nepal-specific defaults
      const propertyData = {
        ...data,
        availableFrom: data.availableFrom.toISOString(),
        address: {
          ...data.address,
          country: data.address.country || "Nepal",
        },
        pricePerDay: data.pricePerDay || undefined,
        securityDeposit: data.securityDeposit || undefined,
        carpetArea: data.carpetArea || undefined,
        amenities: data.amenities || [],
      };

      // Append all property data fields
      for (const key in propertyData) {
        if (key === "images") continue;

        if (
          typeof propertyData[key] === "object" &&
          propertyData[key] !== null
        ) {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else if (propertyData[key] !== undefined) {
          formData.append(key, propertyData[key]);
        }
      }

      await createMutation.mutateAsync(formData);

      toast.success("Property created successfully!");
      form.reset();
      setImages([]);
      setUploadProgress(0);
      setStep(1);
    } catch (error) {
      console.error("Error details:", error.response?.data);

      if (error.response?.data?.message?.includes("location coordinates")) {
        toast.error(
          "We couldn't verify the property location. Please check the address and try again.",
          { autoClose: 5000 }
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to create property. Please check your data and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const nextStep = () => {
  //   // Validate current step before proceeding
  //   if (step === 1) {
  //     const { title, description, propertyType } = form.getValues();
  //     if (!title || !description || !propertyType) {
  //       toast.warning("Please fill all required fields");
  //       return;
  //     }
  //   } else if (step === 2) {
  //     const { builtUpArea, pricePerMonth } = form.getValues();
  //     if (!builtUpArea || !pricePerMonth) {
  //       toast.warning("Please fill all required fields");
  //       return;
  //     }
  //   } else if (step === 3) {
  //     const { address } = form.getValues();
  //     if (
  //       !address.street ||
  //       !address.city ||
  //       !address.state ||
  //       !address.postalCode ||
  //       !address.country
  //     ) {
  //       toast.warning("Please fill all required address fields");
  //       return;
  //     }
  //   }
  //   setStep(step + 1);
  // };

  const nextStep = () => {
    // Validate current step before proceeding
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

  const handleSubmit = () => {
    if (images.length < 3) {
      toast.error("Please upload at least 3 images");
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="container px-0 py-6 max-w-full">
      <Card className="border-1 shadow-sm dark:bg-gray-900/50 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Home className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                List Your Property
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details to showcase your property to potential tenants
            </p>
          </div>

          {/* Progress Stepper */}
          <div className="space-y-2 pt-6">
            <div className="flex items-center justify-between relative">
              {[1, 2, 3, 4].map((stepNumber) => {
                const isComplete = checkStepCompletion(stepNumber);

                return (
                  <div
                    key={stepNumber}
                    className="flex flex-col items-center z-10"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step >= stepNumber
                          ? "border-primary bg-primary text-white"
                          : isComplete
                          ? "border-green-500 bg-green-500/10 text-green-500"
                          : "border-muted bg-background text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-medium">{stepNumber}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        step >= stepNumber
                          ? "text-primary"
                          : isComplete
                          ? "text-green-500"
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
              <div className="absolute top-5 left-10 right-10 h-1 bg-muted -z-1">
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
            <form className="space-y-8">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      Basic Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your property
                    </p>
                  </div>

                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Property Title*
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Beautiful 2BHK Apartment in Downtown"
                              {...field}
                              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors rounded-lg"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Property Type*
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors rounded-lg">
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                              {formSchema.shape.propertyType._def.values.map(
                                (type) => (
                                  <SelectItem
                                    key={type}
                                    value={type}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    {type}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description*
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your property in detail (features, neighborhood, unique aspects)..."
                              rows={5}
                              className="min-h-[120px] bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maximum Guests*
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors rounded-lg"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {step === 2 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      Property Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Specify your property specifications
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* BHK Configuration Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["bedrooms", "bathrooms", "halls", "kitchens"].map(
                        (roomType) => (
                          <FormField
                            key={roomType}
                            control={form.control}
                            name={`bhkConfiguration.${roomType}`}
                            render={({ field }) => (
                              <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {roomType === "bedrooms" && (
                                    <Bed className="h-4 w-4 text-primary" />
                                  )}
                                  {roomType === "bathrooms" && (
                                    <Bath className="h-4 w-4 text-primary" />
                                  )}
                                  {roomType === "halls" && (
                                    <Sofa className="h-4 w-4 text-primary" />
                                  )}
                                  {roomType === "kitchens" && (
                                    <CookingPot className="h-4 w-4 text-primary" />
                                  )}
                                  {roomType.charAt(0).toUpperCase() +
                                    roomType.slice(1)}
                                  *
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        )
                      )}
                    </div>

                    {/* Area and Rooms Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="builtUpArea"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Square className="h-4 w-4 text-primary" />{" "}
                              Built-up Area (sq.ft)*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carpetArea"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Ruler className="h-4 w-4 text-primary" /> Carpet
                              Area (sq.ft)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="totalRooms"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Key className="h-4 w-4 text-primary" /> Total
                              Rooms
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="mt-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Pricing Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="pricePerMonth"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <DollarSign className="h-4 w-4 text-primary" />{" "}
                              Monthly Rent*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="securityDeposit"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Wallet className="h-4 w-4 text-primary" />{" "}
                              Deposit
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="furnishingStatus"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Furnishing*
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary">
                                  <SelectValue placeholder="Select furnishing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                {[
                                  "Furnished",
                                  "Semi-Furnished",
                                  "Unfurnished",
                                ].map((status) => (
                                  <SelectItem
                                    key={status}
                                    value={status}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Availability Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minimumStayMonths"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Calendar className="h-4 w-4 text-primary" /> Min
                              Stay (months)*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableFrom"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <AlarmClock className="h-4 w-4 text-primary" />{" "}
                              Available From*
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary [&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:invert-0"
                                {...field}
                                value={field.value.toISOString().split("T")[0]}
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Availability Checkbox */}
                    <FormField
                      control={form.control}
                      name="isAvailable"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      Property Location
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Where is your property located?
                    </p>
                  </div>

                  <div className="grid gap-6">
                    {/* Address Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Street Address*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Main Street"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              City*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="New York"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              State/Province*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="NY"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.postalCode"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Postal Code*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10001"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Country*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="United States"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address.landmark"
                        render={({ field }) => (
                          <FormItem className="bg-white dark:bg-gray-800 px-4 py-1 rounded-xl">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Landmark className="h-4 w-4 text-primary" />{" "}
                              Nearby Landmark
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Near Central Park"
                                className="mt-2 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* House Rules Section */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          House Rules
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Set rules for your property
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="houseRules.petsAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:cursor-pointer">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:cursor-pointer">
                                  <Dog className="h-4 w-4 text-primary" /> Pets
                                  Allowed
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="houseRules.smokingAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:cursor-pointer">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:cursor-pointer">
                                  <AlarmClock className="h-4 w-4 text-primary" />{" "}
                                  Smoking Allowed
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="houseRules.eventsAllowed"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:cursor-pointer">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:cursor-pointer">
                                  Events Allowed
                                </FormLabel>
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
                            <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Additional Rules
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any other rules or restrictions (quiet hours, guest policies, etc.)..."
                                rows={3}
                                className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Amenities & Images */}
              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold tracking-tight">
                      Amenities & Media
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Showcase your property's features
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Amenities Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          Select Amenities
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Choose the amenities your property offers
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                                      checked={field.value?.includes(
                                        amenity.id
                                      )}
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
                                      className="h-4 w-4 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary"
                                    />
                                    <label
                                      htmlFor={amenity.id}
                                      className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none flex items-center gap-2 cursor-pointer"
                                    >
                                      <span className="text-primary">
                                        {amenity.icon}
                                      </span>
                                      {amenity.label}
                                    </label>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Image Upload Section */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          Property Images
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Upload high-quality images of your property
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-white dark:bg-gray-800">
                          <div className="p-3 rounded-full bg-primary/10 mb-3">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-primary">
                            Upload Images
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            (Max 10 images)
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>

                        {images.map((file, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shadow-md"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {index === 0 && (
                              <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-600/90 shadow-sm">
                                Cover Photo
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Upload at least 3 images (max 10). First image will be
                        used as cover.
                      </p>
                    </div>

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>Uploading images...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress
                          value={uploadProgress}
                          className="h-2 bg-gray-200 dark:bg-gray-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-8 border-t">
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
                    onClick={handleSubmit}
                    disabled={isSubmitting || uploadProgress > 0}
                    className="gap-1"
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
                        {uploadProgress > 0 ? "Uploading..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Publish Property
                      </>
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

export default AddProperty;
