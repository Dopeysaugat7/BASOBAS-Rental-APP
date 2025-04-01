/* eslint-disable no-unused-vars */
import { Form, useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Sofa,
  CookingPot,
  Ruler,
  Calendar,
  DollarSign,
  Wallet,
  Key,
  Wifi,
  AirVent,
  Tv,
  Car,
  Dumbbell,
  Dog,
  Camera,
  Users,
  ChevronLeft,
  Edit,
  Star,
  Heart,
  Share2,
  MoveRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EmptyState from "@/components/EmptyState";
import { format } from "date-fns";
import { useProperty } from "@/hooks/useProperties";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "@/context/AuthContext";
import VisitStatusManager from "../../components/VisitStatusManager";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);

  let { data: property, isLoading, isError } = useProperty(id);
  property = property?.property;

  const isOwner = user && property && user._id === property.host._id;

  // Fix for default marker icons in Next.js/React
  const DefaultIcon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    // shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  const nightMode = {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  };

  // Add this form hook
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      message: "",
    },
  });

  // Add this function to handle visit booking
  const onSubmitVisit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/visits/book",
        {
          propertyId: id,
          ...data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      setOpenVisitDialog(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send visit request",
        variant: "destructive",
      });
      console.error("Error sending visit request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-[500px] w-full rounded-xl" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Property not found"
        description="The property you're looking for doesn't exist or may have been removed."
      />
    );
  }

  if (!property) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Header with back button */}
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <a
              href="/dashboard/my-properties"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden md:block">Back to Properties</span>
            </a>
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and basic info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>4.8</span>
                      <span className="text-muted-foreground">
                        (24 reviews)
                      </span>
                    </div>
                    <span>·</span>
                    <span className="text-muted-foreground">
                      {property.address.city}, {property.address.state}
                    </span>
                  </div>
                </div>

                {isOwner && (
                  <Button asChild variant="outline">
                    <a
                      href={`/dashboard/edit/${property._id}`}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </a>
                  </Button>
                )}
              </div>

              {/* Property badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {property.propertyType.toLowerCase()}
                </Badge>
                <Badge variant="secondary">
                  {property.bhkConfiguration.bedrooms} BHK
                </Badge>
                {property.isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="success">Active</Badge>
                )}
                {property.isAvailable && (
                  <Badge variant="outline">Available Now</Badge>
                )}
              </div>
            </div>

            {/* Image Carousel */}
            <div className="rounded-xl overflow-hidden">
              {property.images?.length > 0 ? (
                <Carousel className="relative group">
                  <CarouselContent>
                    {property.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video rounded-xl overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Carousel>
              ) : (
                <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                  <Home className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail grid */}
            {property.images?.length > 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-auto rounded-lg overflow-hidden"
                  >
                    <img
                      src={image.url}
                      alt={`Property thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Property details sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-8">
                {/* Description */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    About this property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">
                    What this place offers
                  </h2>
                  {property.amenities?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {property.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-3">
                          {amenity === "Wifi" && <Wifi className="h-5 w-5" />}
                          {amenity === "Air Conditioning" && (
                            <AirVent className="h-5 w-5" />
                          )}
                          {amenity === "TV" && <Tv className="h-5 w-5" />}
                          {amenity === "Parking" && <Car className="h-5 w-5" />}
                          {amenity === "Gym" && (
                            <Dumbbell className="h-5 w-5" />
                          )}
                          {amenity === "Pet-Friendly" && (
                            <Dog className="h-5 w-5" />
                          )}
                          {amenity === "Security" && (
                            <Camera className="h-5 w-5" />
                          )}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No amenities listed for this property.
                    </p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-8">
                {/* Property specs */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Property details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bedrooms
                        </p>
                        <p className="font-medium">
                          {property.bhkConfiguration.bedrooms}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bathrooms
                        </p>
                        <p className="font-medium">
                          {property.bhkConfiguration.bathrooms}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Ruler className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="font-medium">
                          {property.builtUpArea} sq.ft
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Max Guests
                        </p>
                        <p className="font-medium">{property.maxGuests}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* House Rules */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">House rules</h2>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Dog className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pets</p>
                        <p className="font-medium">
                          {property.houseRules.petsAllowed
                            ? "Allowed"
                            : "Not Allowed"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <AirVent className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Smoking</p>
                        <p className="font-medium">
                          {property.houseRules.smokingAllowed
                            ? "Allowed"
                            : "Not Allowed"}
                        </p>
                      </div>
                    </div>
                    {property.houseRules.extraRules && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Additional Rules
                        </p>
                        <p className="font-medium">
                          {property.houseRules.extraRules}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Where you'll be</h2>
              <div className="aspect-video rounded-xl overflow-hidden z-0 relative">
                {typeof window !== "undefined" && (
                  <MapContainer
                    center={property.address.coordinates}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-full w-full rounded-xl"
                  >
                    <TileLayer
                      url={nightMode.url}
                      attribution={nightMode.attribution}
                      // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={property.address.coordinates}>
                      <Popup>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {property.address.street}
                          </p>
                          <p className="text-sm">
                            {property.address.city}, {property.address.state}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                )}
              </div>
              <div className="mt-2 sm:flex sm:justify-between sm:items-center">
                <div className="space-y-1">
                  <p className="font-medium">{property.address.street}</p>
                  <p className="text-muted-foreground">
                    {property.address.city}, {property.address.state}{" "}
                    {property.address.postalCode}
                  </p>
                  {property.address.landmark && (
                    <p className="text-muted-foreground">
                      Near {property.address.landmark}
                    </p>
                  )}
                </div>

                <Button variant="outline" className="mt-3 sm:mt-0" asChild>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${property.address.coordinates.lat}&mlon=${property.address.coordinates.lng}#map=17/${property.address.coordinates.lat}}/${property.address.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in OpenStreetMap
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar - Renting card */}
          <div className="space-y-6">
            <Card className="top-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">
                      ${property.pricePerMonth}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        / month
                      </span>
                    </p>
                    {property.pricePerDay > 0 && (
                      <p className="text-sm text-muted-foreground">
                        ${property.pricePerDay} / day
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>4.8</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">
                      {format(new Date(property.availableFrom), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Minimum stay
                    </p>
                    <p className="font-medium">
                      {property.minimumStayMonths} month
                      {property.minimumStayMonths > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="block space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rent</span>
                    <span>${property.pricePerMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deposit</span>
                    <span>${property.securityDeposit || "0"}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${property.pricePerMonth + (property.securityDeposit || 0)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Dialog open={openCheckout} onOpenChange={setOpenCheckout}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Rent this property
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[90vw] max-w-md sm:w-full md:max-w-xl lg:max-w-2xl ">
                    <DialogHeader>
                      <DialogTitle>Complete your Renting Process</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[56vh] md:h-[500px] pr-4">
                      <div className="space-y-6 p-1 sm:p-2 md:p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-center lg:text-left">
                            Your Property
                          </h3>
                          <div className="grid grid-cols-2 gap-4 p-3 sm:p-4 bg-muted/5 rounded-lg">
                            <div className="space-y-1 text-center">
                              <p className="text-sm text-muted-foreground">
                                Check-in
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(property.availableFrom),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                            <div className="space-y-1 text-center">
                              <p className="text-sm text-muted-foreground">
                                Check-out
                              </p>
                              <p className="font-medium">
                                {format(
                                  new Date(
                                    new Date(property.availableFrom).setMonth(
                                      new Date(
                                        property.availableFrom
                                      ).getMonth() + property.minimumStayMonths
                                    )
                                  ),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">
                            Price details
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-sm sm:text-base">
                                ${property.pricePerMonth} x{" "}
                                {property.minimumStayMonths} months
                              </span>
                              <span className="text-sm sm:text-base">
                                $
                                {property.pricePerMonth *
                                  property.minimumStayMonths}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-sm sm:text-base">
                                Security deposit
                              </span>
                              <span className="text-sm sm:text-base">
                                ${property.securityDeposit || "0"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-sm sm:text-base">
                                Service fee
                              </span>
                              <span className="text-sm sm:text-base">$120</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground text-sm sm:text-base">
                                Cleaning fee
                              </span>
                              <span className="text-sm sm:text-base">$75</span>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between font-semibold text-base sm:text-lg">
                            <span>Total</span>
                            <span>
                              $
                              {property.pricePerMonth *
                                property.minimumStayMonths +
                                (property.securityDeposit || 0) +
                                120 +
                                75}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          className="w-full text-sm sm:text-base"
                        >
                          Confirm and pay
                        </Button>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={openVisitDialog}
                  onOpenChange={setOpenVisitDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full">
                      Book a Visit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Schedule a Property Visit</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmitVisit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Your email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your phone number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any special requests or questions"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenVisitDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Submit Request</Button>
                        </div>
                      </form>
                    </FormProvider>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>

            {/* Host info */}
            <Card>
              <CardHeader>
                <CardTitle>About the host</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Property Manager</p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact host
                </Button>
              </CardFooter>
            </Card>
            {isOwner && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Visit Requests</h2>
                <VisitStatusManager propertyId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
