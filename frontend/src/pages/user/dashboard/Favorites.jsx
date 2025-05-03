import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Home, ChevronRight, Loader2, Heart } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useQuery } from "@tanstack/react-query";

const Favorites = () => {
  // Fetch favorites using React Query
  const {
    data: favorites = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/favorites", {
        withCredentials: true,
      });

      // Transform API data to match component structure
      return response.data.favorites.map((property) => {
        // Handle address object format
        let formattedAddress = "";
        if (typeof property.address === "object") {
          const addr = property.address;
          formattedAddress = [
            addr.street,
            addr.city,
            addr.state,
            addr.postalCode,
          ]
            .filter(Boolean)
            .join(", ");
        } else {
          formattedAddress = property.address || "No address available";
        }

        return {
          id: property._id,
          title: property.title,
          address: formattedAddress,
          price: property.pricePerMonth,
          beds: property.bedrooms || 1,
          baths: property.bathrooms || 1,
          rating: property.rating || 4.5,
          image:
            property.images && property.images.length > 0
              ? property.images[0]
              : null,
          amenities: property.amenities || ["Parking", "Laundry"],
          featured: property.featured || false,
        };
      });
    },
    onError: (err) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch favorites";
      toast.error(errorMessage);
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading your favorites...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <p>Failed to load favorites: {error.message}</p>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-light tracking-tight">Saved Homes</h1>
        <p className="text-muted-foreground mt-2">
          {favorites.length} properties ·{" "}
          <span className="text-primary">Recently added</span>
        </p>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <Card
              key={property.id}
              className="border-1 shadow-none transition-all duration-300 overflow-hidden py-0"
            >
              <CardContent className="p-0">
                {/* Image Placeholder or Actual Image */}
                <div className="h-48 relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  {property.image ? (
                    <img
                      src={property.image.url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Featured Badge */}
                  {property.featured && (
                    <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-black border border-yellow-400 dark:text-white p-2">
                      <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Featured
                    </Badge>
                  )}

                  {/* Heart Button */}
                  <FavoriteButton propertyId={property.id} />
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <CardHeader className="p-0 mb-3">
                    <CardTitle className="text-lg font-light">
                      {property.title}
                    </CardTitle>
                    <CardDescription className="flex items-start mt-1">
                      <MapPin className="mr-2 h-3 w-3 mt-1 flex-shrink-0" />
                      <span className="text-sm line-clamp-2">
                        {property.address}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  {/* Price and Rating */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-lg font-light">
                        ${property.price}
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {property.beds} bed{property.beds !== 1 ? "s" : ""} ·{" "}
                        {property.baths} bath{property.baths !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {property.rating}
                    </Badge>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="font-normal"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="secondary" className="font-normal">
                        +{property.amenities.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center pt-2 border-t">
                    <Button variant="link" size="sm" asChild>
                      <a href={`/${property.id}`}>
                        View <ChevronRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-light mb-2">No saved homes yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Click the heart icon on listings to save them here for easy access.
          </p>
          <Button variant="outline" className="rounded-full" asChild>
            <a href="/properties">Browse available properties</a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
