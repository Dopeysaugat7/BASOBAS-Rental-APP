/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Heart,
  Star,
  MapPin,
  Search,
  Building,
  Filter,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// PropertyCard Component
function PropertyCards({
  id,
  image,
  title,
  location,
  rating,
  price,
  currency,
  unit,
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link to={`/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="group relative overflow-hidden transition-all hover:shadow-md py-0 dark:hover:shadow-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl h-full flex flex-col">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
            <img
              src={image || "https://placehold.co/400x300"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
              loading="lazy"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-3 right-3 rounded-full bg-background/90 hover:bg-background backdrop-blur-sm p-2 transition-all duration-200 hover:scale-110"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-foreground/80"
                } transition-colors duration-200`}
              />
            </Button>
          </div>
          <CardContent className="p-5 flex-grow">
            <div className="flex justify-between items-start gap-3">
              <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                {title}
              </h3>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/10 text-primary"
              >
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-xs font-medium">{rating}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </p>
          </CardContent>
          <CardFooter className="p-5 pt-0">
            <p className="font-bold text-lg text-foreground">
              {currency} {price.toLocaleString()}
              <span className="font-normal text-sm text-muted-foreground">
                {" "}
                {unit}
              </span>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function SearchProperty() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { searchParams: initialParams } = location.state || {
    searchParams: { location: "", propertyType: "" },
  };
  console.log(initialParams.priceRange.split("-").map((num) => parseInt(num)));
  // State for search and filter parameters
  const [searchParams, setSearchParams] = useState({
    location: initialParams.location || "",
    propertyType: initialParams.propertyType || "any",
    priceRange: initialParams.priceRange
      .split("-")
      .map((num) => parseInt(num)) || [0, 100000],
    bedrooms: "any",
    bathrooms: "any",
    furnishingStatus: "any",
    amenities: [],
    maxGuests: "any",
    minimumStayMonths: "any",
    isAvailable: true,
    isExpired: false,
  });

  // State for filter modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calculate active filter count
  const activeFilterCount = Object.entries(searchParams).reduce(
    (count, [key, value]) => {
      if (key === "location" && value) return count + 1;
      if (key === "propertyType" && value !== "any") return count + 1;
      if (key === "priceRange" && (value[0] !== 0 || value[1] !== 100000))
        return count + 1;
      if (key === "bedrooms" && value !== "any") return count + 1;
      if (key === "bathrooms" && value !== "any") return count + 1;
      if (key === "furnishingStatus" && value !== "any") return count + 1;
      if (key === "amenities" && value.length > 0) return count + 1;
      if (key === "maxGuests" && value !== "any") return count + 1;
      if (key === "minimumStayMonths" && value !== "any") return count + 1;
      return count;
    },
    0
  );

  // Fetch properties based on search parameters
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const params = {
          search: searchParams.location || undefined,
          propertyType:
            searchParams.propertyType !== "any"
              ? searchParams.propertyType
              : undefined,
          "pricePerMonth[gte]": searchParams.priceRange[0],
          "pricePerMonth[lte]": searchParams.priceRange[1],
          "bhkConfiguration.bedrooms":
            searchParams.bedrooms !== "any" ? searchParams.bedrooms : undefined,
          "bhkConfiguration.bathrooms":
            searchParams.bathrooms !== "any"
              ? searchParams.bathrooms
              : undefined,
          furnishingStatus:
            searchParams.furnishingStatus !== "any"
              ? searchParams.furnishingStatus
              : undefined,
          amenities:
            searchParams.amenities.length > 0
              ? searchParams.amenities.join(",")
              : undefined,
          maxGuests:
            searchParams.maxGuests !== "any"
              ? searchParams.maxGuests
              : undefined,
          minimumStayMonths:
            searchParams.minimumStayMonths !== "any"
              ? searchParams.minimumStayMonths
              : undefined,
          isAvailable: searchParams.isAvailable,
          isExpired: searchParams.isExpired,
          sort: "-createdAt",
          limit: 20,
        };

        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params,
        });
        setProperties(response.data.data);
      } catch (err) {
        setError("Failed to load properties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger refetch via useEffect
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  // Handle amenity checkbox changes
  const handleAmenityChange = (amenity) => {
    setSearchParams((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchParams({
      location: "",
      propertyType: "any",
      priceRange: [0, 100000],
      bedrooms: "any",
      bathrooms: "any",
      furnishingStatus: "any",
      amenities: [],
      maxGuests: "any",
      minimumStayMonths: "any",
      isAvailable: true,
      isExpired: false,
    });
  };

  // Available options for dropdowns
  const propertyTypes = [
    "House",
    "Apartment",
    "Villa",
    "Farmhouse",
    "Cottage",
    "Penthouse",
    "Duplex",
    "Studio",
  ];
  const furnishingStatuses = ["Furnished", "Semi-Furnished", "Unfurnished"];
  const amenitiesList = [
    "Wifi",
    "Air Conditioning",
    "Heating",
    "TV",
    "Washing Machine",
    "Parking",
    "Elevator",
    "Power Backup",
    "Swimming Pool",
    "Gym",
    "Garden",
    "Balcony",
    "Pet-Friendly",
    "Security",
    "CCTV",
    "Modular Kitchen",
    "Fridge",
    "Microwave",
    "Geyser",
    "RO Water",
  ];

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 text-red-500"
      >
        {error}
      </motion.div>
    );

  return (
    <TooltipProvider>
      <div className="min-h-screen ">
        {/* Search Bar */}
        <div className="sticky top-15 z-20">
          <div className="flex justify-center w-full px-4 sm:px-6">
            <Card className="p-4 sm:px-6 sm:pt-8 shadow-none border-0 rounded-none bg-background w-full max-w-full">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <div className="w-full sm:w-1/3 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <Input
                    placeholder="City or neighborhood (e.g., Kathmandu)"
                    value={searchParams.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full h-11 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary rounded-lg transition-all duration-200"
                  />
                </div>
                <div className="w-full sm:w-1/3 flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary flex-shrink-0" />
                  <Select
                    value={searchParams.propertyType}
                    onValueChange={(value) =>
                      handleFilterChange("propertyType", value)
                    }
                  >
                    <SelectTrigger className="w-full min-h-11 text-base border-gray-300 dark:border-gray-600 rounded-lg">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-auto flex justify-center items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="submit"
                      className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </motion.div>
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          className="h-11 flex items-center gap-2 border-gray-300 dark:border-gray-600 rounded-lg text-base relative"
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                          {activeFilterCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                              {activeFilterCount}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Advanced Filters
                        </DialogTitle>
                      </DialogHeader>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6"
                      >
                        {/* Price Range */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Price Range (Rs./month)
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Select the monthly rental price range for your
                                property.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Slider
                            value={searchParams.priceRange}
                            onValueChange={(value) =>
                              handleFilterChange("priceRange", value)
                            }
                            min={0}
                            max={100000}
                            step={1000}
                            className="mt-3"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              Rs. {searchParams.priceRange[0].toLocaleString()}
                            </span>
                            <span>
                              Rs. {searchParams.priceRange[1].toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Bedrooms */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Bedrooms
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Choose the minimum number of bedrooms required.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={searchParams.bedrooms}
                            onValueChange={(value) =>
                              handleFilterChange("bedrooms", value)
                            }
                          >
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select bedrooms" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}+
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Bathrooms */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Bathrooms
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Choose the minimum number of bathrooms required.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={searchParams.bathrooms}
                            onValueChange={(value) =>
                              handleFilterChange("bathrooms", value)
                            }
                          >
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select bathrooms" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {[1, 2, 3, 4].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}+
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Furnishing Status */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Furnishing Status
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Select the furnishing level of the property.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={searchParams.furnishingStatus}
                            onValueChange={(value) =>
                              handleFilterChange("furnishingStatus", value)
                            }
                          >
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select furnishing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {furnishingStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Max Guests */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Max Guests
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Select the maximum number of guests allowed.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={searchParams.maxGuests}
                            onValueChange={(value) =>
                              handleFilterChange("maxGuests", value)
                            }
                          >
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select guests" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {[1, 2, 3, 4, 5, 6].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}+
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Minimum Stay */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Minimum Stay (Months)
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Select the minimum rental duration required.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select
                            value={searchParams.minimumStayMonths}
                            onValueChange={(value) =>
                              handleFilterChange("minimumStayMonths", value)
                            }
                          >
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              {[1, 3, 6, 12].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}+
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-3 sm:col-span-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              Amenities
                            </label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Choose the amenities you want in the property.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-3 bg-muted/50 rounded-lg">
                            {amenitiesList.map((amenity) => (
                              <div
                                key={amenity}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={searchParams.amenities.includes(
                                    amenity
                                  )}
                                  onCheckedChange={() =>
                                    handleAmenityChange(amenity)
                                  }
                                  className="h-5 w-5"
                                />
                                <span className="text-sm">{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                      <div className="flex justify-end gap-4">
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="h-11 text-base"
                        >
                          Reset Filters
                        </Button>
                        <Button
                          onClick={() => setIsFilterOpen(false)}
                          className="h-11 text-base bg-primary hover:bg-primary/90"
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Filter Summary */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Active Filters:
                </span>
                {searchParams.location && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.location}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleFilterChange("location", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.propertyType !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.propertyType}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleFilterChange("propertyType", "any")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {(searchParams.priceRange[0] !== 0 ||
                  searchParams.priceRange[1] !== 100000) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Rs. {searchParams.priceRange[0].toLocaleString()} -{" "}
                    {searchParams.priceRange[1].toLocaleString()}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() =>
                        handleFilterChange("priceRange", [0, 100000])
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.bedrooms !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.bedrooms}+ Bedrooms
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleFilterChange("bedrooms", "any")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.bathrooms !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.bathrooms}+ Bathrooms
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleFilterChange("bathrooms", "any")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.furnishingStatus !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.furnishingStatus}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() =>
                        handleFilterChange("furnishingStatus", "any")
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {amenity}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleAmenityChange(amenity)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {searchParams.maxGuests !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.maxGuests}+ Guests
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() => handleFilterChange("maxGuests", "any")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchParams.minimumStayMonths !== "any" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {searchParams.minimumStayMonths}+ Months
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4"
                      onClick={() =>
                        handleFilterChange("minimumStayMonths", "any")
                      }
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-primary hover:text-primary/80"
                >
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="lg:max-w-[85rem] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Cards */}
            <div className="lg:col-span-2">
              {properties.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-lg text-muted-foreground">
                    No properties found matching your criteria.
                  </p>
                  <Button
                    variant="link"
                    onClick={resetFilters}
                    className="mt-4 text-primary"
                  >
                    Clear filters to see more properties
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCards
                      key={property._id}
                      id={property._id}
                      image={property.images[0]?.url}
                      title={property.title}
                      location={`${property.address.city}, ${property.address.country}`}
                      rating={property.averageRating || 0}
                      price={property.pricePerMonth}
                      currency="Rs."
                      unit="/month"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Map Area */}
            <div className="hidden lg:block sticky top-20 h-[calc(100vh-120px)]">
              <Card className="rounded-xl overflow-hidden h-full py-0 shadow-sm border border-gray-200 dark:border-gray-700">
                <iframe
                  title="Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    searchParams.location || "Kathmandu"
                  )}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-none"
                  loading="lazy"
                ></iframe>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
