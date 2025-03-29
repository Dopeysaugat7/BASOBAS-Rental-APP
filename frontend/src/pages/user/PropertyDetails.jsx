import { useParams } from "react-router-dom";
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
  Square,
  Landmark,
  ChevronLeft,
  Edit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import EmptyState from "@/components/EmptyState";
import { format } from "date-fns";
import { useProperty } from "@/hooks/useProperties";

const PropertyDetails = () => {
  const { id } = useParams();

  let { data: property, isLoading, isError } = useProperty(id);
  property = property?.property;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-96 w-full" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
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
      <Button variant="outline" asChild className="mb-6">
        <a href="/dashboard/my-properties">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </a>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{property.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {property.propertyType.toLowerCase()}
                    </Badge>
                    <Badge variant="outline">
                      {property.bhkConfiguration.bedrooms} BHK
                    </Badge>
                    {property.isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : property.approvalStatus === "pending" ? (
                      <Badge variant="secondary">Pending Approval</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                </div>
                <Button asChild>
                  <a href={`/dashboard/edit/${property._id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </a>
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Image Carousel */}
              {property.images?.length > 0 ? (
                <Carousel className="mb-6">
                  <CarouselContent>
                    {property.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Property image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-6">
                  <Home className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold whitespace">
                  Description
                </h3>
                <p className="text-muted-foreground">{property.description}</p>

                <Separator />

                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bedrooms</p>
                      <p className="font-medium">
                        {property.bhkConfiguration.bedrooms}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bathrooms</p>
                      <p className="font-medium">
                        {property.bhkConfiguration.bathrooms}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sofa className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Halls</p>
                      <p className="font-medium">
                        {property.bhkConfiguration.halls}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CookingPot className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kitchens</p>
                      <p className="font-medium">
                        {property.bhkConfiguration.kitchens}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">
                        {property.builtUpArea} sq.ft
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Max Guests
                      </p>
                      <p className="font-medium">{property.maxGuests}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Monthly Rent
                      </p>
                      <p className="font-medium">${property.pricePerMonth}</p>
                    </div>
                  </div>
                  {property.pricePerDay > 0 && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Daily Rate
                        </p>
                        <p className="font-medium">${property.pricePerDay}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit</p>
                      <p className="font-medium">
                        ${property.securityDeposit || "0"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Available From
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(property.availableFrom),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Minimum Stay
                      </p>
                      <p className="font-medium">
                        {property.minimumStayMonths} month
                        {property.minimumStayMonths > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {property.amenities?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      {amenity === "Wifi" && <Wifi className="h-5 w-5" />}
                      {amenity === "Air Conditioning" && (
                        <AirVent className="h-5 w-5" />
                      )}
                      {amenity === "TV" && <Tv className="h-5 w-5" />}
                      {amenity === "Parking" && <Car className="h-5 w-5" />}
                      {amenity === "Gym" && <Dumbbell className="h-5 w-5" />}
                      {amenity === "Pet-Friendly" && (
                        <Dog className="h-5 w-5" />
                      )}
                      {amenity === "Security" && <Camera className="h-5 w-5" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No amenities listed for this property.
                </p>
              )}
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="font-medium">
                      {property.houseRules.eventsAllowed
                        ? "Allowed"
                        : "Not Allowed"}
                    </p>
                  </div>
                </div>
              </div>
              {property.houseRules.extraRules && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Additional Rules
                  </p>
                  <p className="font-medium">
                    {property.houseRules.extraRules}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {property.address.street}, {property.address.city}
                  </p>
                  <p className="font-medium">
                    {property.address.state}, {property.address.postalCode}
                  </p>
                  <p className="font-medium">{property.address.country}</p>
                </div>
                {property.address.landmark && (
                  <div>
                    <p className="text-sm text-muted-foreground">Landmark</p>
                    <p className="font-medium">{property.address.landmark}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View on Map
              </Button>
            </CardFooter>
          </Card>

          {/* Property Status */}
          <Card>
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Availability</p>
                  <p className="font-medium">
                    {property.isAvailable ? "Available" : "Not Available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Furnishing</p>
                  <p className="font-medium capitalize">
                    {property.furnishingStatus.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Floors</p>
                  <p className="font-medium">{property.totalFloors || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">
                    {property.floor === 0
                      ? "Ground Floor"
                      : property.floor
                      ? `Floor ${property.floor}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
