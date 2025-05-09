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
import { motion } from "framer-motion";

const Favorites = () => {
  // Existing query logic remains exactly the same
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
      return response.data.favorites.map((property) => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <p className="mt-6 text-lg text-muted-foreground">
          Loading your favorite homes...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl text-center border border-red-100 dark:border-red-900/20"
        >
          <p className="text-red-600 dark:text-red-300 mb-4">
            Failed to load favorites: {error.message}
          </p>
          <Button
            onClick={refetch}
            variant="outline"
            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Modern Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-light tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Your Saved Homes
        </h1>
        <p className="text-muted-foreground mt-3 text-sm md:text-base">
          {favorites.length}{" "}
          {favorites.length === 1 ? "property" : "properties"} ·{" "}
          <span className="text-primary font-medium">Recently added</span>
        </p>
      </motion.div>

      {/* Enhanced Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* <Card className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col p-0">
                <CardContent className="p-0 flex flex-col h-full"> */}
              {/* Image Section */}
              {/* <div className="relative h-56 w-full overflow-hidden">
                    {property.image ? (
                      <motion.img
                        src={property.image.url}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <Home className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                      </div>
                    )} */}

              {/* Featured Badge */}
              {/* {property.featured && (
                      <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white border border-yellow-300 dark:border-yellow-600 shadow-sm">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        Featured
                      </Badge>
                    )} */}

              {/* Favorite Button */}
              {/* <div className="absolute top-3 right-3">
                      <FavoriteButton
                        propertyId={property.id}
                        className="text-gray-900 dark:text-white bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                      />
                    </div>
                  </div> */}

              {/* Property Details */}
              {/* <div className="p-5 flex-grow flex flex-col">
                    <CardHeader className="p-0 mb-3">
                      <CardTitle className="text-xl font-medium line-clamp-2">
                        {property.title}
                      </CardTitle>
                      <CardDescription className="flex items-start mt-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="text-sm line-clamp-2">
                          {property.address}
                        </span>
                      </CardDescription>
                    </CardHeader> */}

              {/* Price and Rating */}
              {/* <div className="flex justifyrobotframeworkflex justify-between items-center mb-4">
                      <div>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          ₨. {property.price.toLocaleString()}
                          <span className="text-base font-normal text-gray-600 dark:text-gray-300">
                            /mo
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {property.beds} bed{property.beds !== 1 ? "s" : ""} ·{" "}
                          {property.baths} bath
                          {property.baths !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div> */}

              {/* Amenities */}
              {/* <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.slice(0, 3).map((amenity, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium px-2.5 py-0.5 rounded-full"
                        >
                          +{property.amenities.length - 3}
                        </Badge>
                      )}
                    </div> */}

              {/* View Button */}
              {/* <Button
                      variant="outline"
                      className="w-full mt-auto border-primary text-primary hover:bg-primary/5 hover:text-primary"
                      asChild
                    >
                      <a href={`/${property.id}`}>
                        View Details
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card> */}

              <Card className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col p-0">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Image Section - No changes */}
                  <div className="relative h-56 w-full overflow-hidden">
                    {property.image ? (
                      <motion.img
                        src={property.image.url}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                        <Home className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}

                    {/* Featured Badge - Font size adjusted */}
                    {property.featured && (
                      <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-900 dark:text-white border border-yellow-300 dark:border-yellow-600 shadow-sm text-[10px] md:text-xs">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        Featured
                      </Badge>
                    )}

                    {/* Favorite Button - No changes */}
                    <div className="absolute top-3 right-3">
                      <FavoriteButton
                        propertyId={property.id}
                        className="text-gray-900 dark:text-white bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                      />
                    </div>
                  </div>

                  {/* Property Details - Font sizes adjusted */}
                  <div className="p-5 flex-grow flex flex-col">
                    <CardHeader className="p-0 mb-3">
                      {/* Title font size matched */}
                      <CardTitle className="text-base md:text-lg font-medium line-clamp-2">
                        {property.title}
                      </CardTitle>
                      {/* Address font size matched */}
                      <CardDescription className="flex items-start mt-2 text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                        <MapPin className="mr-2 h-3 w-3 md:h-3 md:w-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="line-clamp-2">{property.address}</span>
                      </CardDescription>
                    </CardHeader>

                    {/* Price and Rating - Font sizes adjusted */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {/* Price font size matched */}
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          ₨. {property.price.toLocaleString()}
                          <span className="text-xs md:text-sm font-normal text-gray-600 dark:text-gray-300">
                            /mo
                          </span>
                        </p>
                        {/* Beds/baths font size matched */}
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {property.beds} bed{property.beds !== 1 ? "s" : ""} ·{" "}
                          {property.baths} bath{property.baths !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {/* Rating badge font size matched */}
                      {/* <Badge
                        variant="outline"
                        className="flex items-center gap-1 border-primary text-primary text-xs"
                      >
                        <Star className="h-3 w-3 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                        <span>{property.rating}</span>
                      </Badge> */}
                    </div>

                    {/* Amenities - Font size adjusted */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.slice(0, 3).map((amenity, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full text-[10px]"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full text-[10px]"
                        >
                          +{property.amenities.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* View Button - Font size adjusted */}
                    <Button
                      variant="outline"
                      className="w-full mt-auto border-primary text-white bg-primary hover:bg-primary/90 hover:text-white text-xs md:text-sm"
                      asChild
                    >
                      <a href={`/${property.id}`}>
                        View Details
                        <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Enhanced Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 sm:py-24"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="h-20 w-20 text-primary/30" />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse -z-10"></div>
          </div>
          <h3 className="text-2xl font-light mb-3 text-center">
            No saved homes yet
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-8 text-sm sm:text-base">
            Click the heart icon on listings to save them here for easy access.
          </p>
          <Button
            variant="default"
            className="rounded-full px-6 py-3 bg-primary hover:bg-primary/90"
            asChild
          >
            <a href="/properties">Browse Available Properties</a>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;
