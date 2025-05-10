"use client";

/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  MapPin,
  HomeIcon,
  Mountain,
  Trees,
  Hotel,
  Waves,
  ChevronRight,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { FavoriteButton } from "@/components/FavoriteButton";
import { locationImages } from "@/data/locationImages";

const API_BASE_URL = "http://localhost:5000/api";

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    priceRange: "",
  });
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    navigate("/search", { state: { searchParams } });
  };

  const [allProperties, setAllProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [counts, setCounts] = useState({
    locations: {},
    propertyTypes: {},
  });
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const propertyTypes = [
    { icon: <HomeIcon className="h-5 w-5" />, label: "House", count: 0 },
    { icon: <Building className="h-5 w-5" />, label: "Apartment", count: 0 },
    { icon: <Mountain className="h-5 w-5" />, label: "Villa", count: 0 },
    { icon: <Trees className="h-5 w-5" />, label: "Duplex", count: 0 },
    { icon: <Waves className="h-5 w-5" />, label: "Penthouse", count: 0 },
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: {
            sort: "-createdAt",
            isAvailable: true,
            isExpired: false,
          },
        });
        const fetchedProperties = response.data.data || [];
        console.log("Fetched Properties:", fetchedProperties);

        // Store all properties for counts
        setAllProperties(fetchedProperties);

        // Limit to 6 properties for featured rentals
        setFeaturedProperties(fetchedProperties.slice(0, 6));

        // Calculate counts for locations and property types
        const locationCounts = fetchedProperties.reduce((acc, property) => {
          const city = property.address?.city || "Unknown";
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {});

        const propertyTypeCounts = fetchedProperties.reduce((acc, property) => {
          const type = property.propertyType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        console.log("Location Counts:", locationCounts);
        console.log("Property Type Counts:", propertyTypeCounts);

        setCounts({
          locations: locationCounts,
          propertyTypes: propertyTypeCounts,
        });

        // Update propertyTypes with counts
        const updatedPropertyTypes = propertyTypes.map((type) => ({
          ...type,
          count: propertyTypeCounts[type.label] || 0,
        }));
        setPropertyTypes(updatedPropertyTypes);
      } catch (err) {
        setError("Failed to load properties: " + err.message);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const [propertyTypesState, setPropertyTypes] = useState(propertyTypes);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Hero Section */}
      <HeroSection
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearch={handleSearch}
      />

      {/* Property Types */}
      <PropertyTypesSection
        propertyTypes={propertyTypesState}
        setSearchParams={setSearchParams}
        searchParams={searchParams}
        navigate={navigate}
      />

      {/* Popular Locations */}
      <PopularLocationsSection
        navigate={navigate}
        setSearchParams={setSearchParams}
        searchParams={searchParams}
        counts={counts.locations}
      />

      {/* Featured Rentals */}
      <FeaturedRentalsSection properties={featuredProperties} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

// Componentized sections for better readability and maintainability

const LoadingSpinner = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex items-center justify-center h-screen"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
  </motion.div>
);

const ErrorDisplay = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center py-10 text-red-500"
  >
    {message}
  </motion.div>
);

const HeroSection = ({ searchParams, setSearchParams, handleSearch }) => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="relative h-[80vh] sm:h-[70vh] md:h-[80vh] w-[92vw] mx-auto top-5"
  >
    {/* Background image with gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/80 z-10 rounded-lg" />
    <motion.img
      initial={{ scale: 1.01 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5 }}
      className="w-full h-full object-cover rounded-lg"
      src="https://images.unsplash.com/photo-1734056087170-ebf632247006?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Luxury property"
      loading="eager"
    />

    {/* Content */}
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl space-y-4 sm:space-y-6"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          <span className="text-primary">नेपाली</span> Homes for Your Journey
        </h1>
        <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
          Discover authentic Nepali living spaces with modern comforts
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-4xl mt-8 md:mt-12 bg-white/90 backdrop-blur-sm dark:bg-gray-900 rounded-xl p-6 shadow-2xl"
      >
        <Tabs defaultValue="rent" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-12">
            <TabsTrigger
              value="rent"
              className="font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
            >
              Find a Property
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-md transition-all"
            >
              List Your Property
            </TabsTrigger>
          </TabsList>

          {/* Rent Tab Content */}
          <TabsContent value="rent" className="mt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select
                      value={searchParams.location}
                      onValueChange={(value) =>
                        setSearchParams({ ...searchParams, location: value })
                      }
                    >
                      <SelectTrigger className="w-full pl-10 border border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kathmandu">Kathmandu</SelectItem>
                        <SelectItem value="Pokhara">Pokhara</SelectItem>
                        <SelectItem value="Chitwan">Chitwan</SelectItem>
                        <SelectItem value="Lalitpur">Lalitpur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Property Type
                  </label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select
                      value={searchParams.propertyType}
                      onValueChange={(value) =>
                        setSearchParams({
                          ...searchParams,
                          propertyType: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-full pl-10 border border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Villa">Villa</SelectItem>
                        <SelectItem value="Cabin">Cabin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Range
                  </label>
                  <Select
                    value={searchParams.priceRange}
                    onValueChange={(value) =>
                      setSearchParams({ ...searchParams, priceRange: value })
                    }
                  >
                    <SelectTrigger className="w-full border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-10000">₨. 0 - ₨.10000</SelectItem>
                      <SelectItem value="10000-20000">
                        ₨.10000 - ₨.20000
                      </SelectItem>
                      <SelectItem value="20000-50000">
                        ₨.20000 - ₨. 50000
                      </SelectItem>
                      <SelectItem value="50000-100000">
                        ₨.500000 - ₨.100000
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white dark:text-white dark:bg-primary dark:hover:bg-primary/90 rounded-lg px-6 py-3 text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search Properties
                </Button>
              </motion.div>
            </form>
          </TabsContent>

          {/* List Your Property Tab Content */}
          <TabsContent value="list" className="mt-6">
            <div className="text-center p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Ready to list your property?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Join our network and reach thousands of potential buyers or
                renters.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white dark:text-white dark:bg-primary dark:hover:bg-primary/90 rounded-lg px-6 py-3 text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link to="/dashboard/add-property">Get Started Now</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  </motion.section>
);

const PropertyTypesSection = ({
  propertyTypes,
  setSearchParams,
  searchParams,
  navigate,
}) => (
  <section className="py-12 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Explore <span className="text-primary">Nepali</span> Living Spaces
        </h2>
        <p className="text-gray-600 mt-2">
          Traditional charm meets modern comfort
        </p>
      </div>
    </motion.div>

    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4 mb-4">
        {propertyTypes.map((type, index) => (
          <CarouselItem
            key={index}
            className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden border border-border hover:border-primary transition-all duration-300 h-full hover:shadow-md py-0">
                <Link
                  to={`/properties?type=${type.label}`}
                  className="block p-4 md:p-6 text-center"
                  onClick={() => {
                    setSearchParams({
                      ...searchParams,
                      propertyType: type.label,
                    });
                    navigate(`/properties?type=${type.label}`);
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2 md:gap-3"
                  >
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                      <div className="text-primary group-hover:text-white transition-colors duration-300">
                        {type.icon}
                      </div>
                    </div>
                    <span className="font-medium text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-300">
                      {type.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300 text-xs"
                    >
                      {type.count} Properties
                    </Badge>
                  </motion.div>
                </Link>
              </Card>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-6 md:mt-8 gap-2">
        <CarouselPrevious className="relative inset-0 translate-y-0 bg-background hover:bg-background/90 border-border h-8 w-8 md:h-10 md:w-10" />
        <CarouselNext className="relative inset-0 translate-y-0 bg-background hover:bg-background/90 border-border h-8 w-8 md:h-10 md:w-10" />
      </div>
    </Carousel>
  </section>
);

const PopularLocationsSection = ({
  navigate,
  setSearchParams,
  searchParams,
  counts,
}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processLocations = () => {
      try {
        // Transform counts into locations array
        const locationsArray = Object.entries(counts).map(
          ([name, count], index) => {
            // Assume average rating and views are not available in counts
            // If needed, these would require processing allProperties
            const avgRating = ""; // Placeholder, update if ratings are needed
            const views = 0; // Placeholder, update if views are needed

            return {
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
              image: locationImages[name] || "https://via.placeholder.com/300",
              propertyCount: count,
              rating: avgRating,
              views,
            };
          }
        );

        console.log("Locations Array:", locationsArray);

        // Sort by property count (most popular first)
        locationsArray.sort((a, b) => b.propertyCount - a.propertyCount);

        setLocations(locationsArray.slice(0, 4)); // Take top 4 locations
      } catch (err) {
        console.error("Error processing locations:", err);
      } finally {
        setLoading(false);
      }
    };

    processLocations();
  }, [counts]);

  const handleLocationClick = (locationName) => {
    setSearchParams({
      ...searchParams,
      location: locationName,
    });
    navigate("/search", {
      state: { searchParams: { ...searchParams, location: locationName } },
    });
  };

  if (loading)
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );

  if (locations.length === 0) {
    return (
      <section className="py-12 md:pt-8 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-4"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Popular <span className="text-primary">Locations</span>
            </h2>
            <p className="text-gray-600 mt-2">
              No locations found. Add properties to see popular locations.
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="py-12 md:pt-8 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Popular <span className="text-primary">Locations</span>
          </h2>
          <p className="text-gray-600 mt-2">
            Discover the most sought-after areas in Nepal
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            onClick={() => handleLocationClick(location.name)}
            className="cursor-pointer"
          >
            <Card className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 h-full p-0">
              <motion.div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/20 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div
                className="relative h-48 w-full overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={location.image}
                  alt={location.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 z-10 text-white"
                initial={{ y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-1 transition-all duration-300">
                  {location.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium transition-all duration-300">
                    {location.propertyCount}{" "}
                    {location.propertyCount === 1 ? "property" : "properties"}
                  </span>
                  <div className="flex items-center gap-1 transition-all duration-300">
                    <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                    <span>{location.rating || ""}</span>
                  </div>
                </div>
              </motion.div>
              <div className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const FeaturedRentalsSection = ({ properties }) => {
  const [visibleProperties, setVisibleProperties] = useState(3);

  const loadMore = () => {
    setVisibleProperties((prev) => Math.min(prev + 3, properties.length));
  };

  return (
    <section className="py-12 md:pt-8 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Popular <span className="text-primary">Nepali</span> Rentals
          </h2>
          <p className="text-gray-600 mt-2">
            Highly rated properties our customers love
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 text-sm md:text-base"
          asChild
        >
          <Link to="/properties" className="flex items-center group">
            Browse All
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.slice(0, visibleProperties).map((property) => (
          <motion.div
            key={property._id}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col border border-border dark:border-gray-700 py-0">
              <CardHeader className="p-0 relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden"
                >
                  <img
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    src={
                      property.images[0]?.url ||
                      "https://via.placeholder.com/300" ||
                      "/placeholder.svg"
                    }
                    alt={property.title}
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-2 right-2"
                >
                  <FavoriteButton propertyId={property._id} />
                </motion.div>
                <Badge
                  variant="secondary"
                  className="absolute bottom-3 left-3 bg-background/90 dark:bg-gray-800/90 backdrop-blur-sm text-foreground dark:text-white text-[10px] md:text-xs"
                >
                  {property.propertyType}
                </Badge>
              </CardHeader>
              <CardContent className="px-4 py-1 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base md:text-lg line-clamp-1 text-foreground dark:text-white">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 md:h-3 md:w-3 fill-yellow-400 stroke-yellow-400" />
                    <span className="font-medium text-base md:text-sm dark:text-white">
                      {property.averageRating || "New"}
                    </span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400 flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 md:h-3 md:w-3 flex-shrink-0" />
                  {property.address.city}, {property.address.country}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {property.amenities.slice(0, 3).map((amenity, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] px-1.5 py-0.5 bg-muted dark:bg-gray-700 rounded-full text-muted-foreground dark:text-gray-300 transition-colors duration-300 hover:bg-primary/10 dark:hover:bg-primary/20"
                    >
                      {amenity}
                    </motion.span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t border-border dark:border-gray-700">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <span className="font-bold text-base md:text-base text-foreground dark:text-white">
                      ₨. {property.pricePerMonth}
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">
                      /month
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-xs h-7 md:text-sm"
                    >
                      <Link to={`/${property._id}`}>View Details</Link>
                    </Button>
                  </motion.div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {visibleProperties < properties.length && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
          >
            Load More
          </Button>
        </div>
      )}
    </section>
  );
};

const CTASection = () => (
  <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto mb-10 md:mb-15 rounded-lg overflow-hidden">
    {/* Background with overlay */}
    <div className="absolute inset-0 z-10">
      <img
        src="https://images.unsplash.com/photo-1617730783031-0effdfa3427c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Nepali traditional house"
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
    </div>

    {/* Content */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="relative max-w-3xl mx-auto text-center z-20"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
        Ready to Find Your Dream Property?
      </h2>
      <p className="text-sm md:text-base lg:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
        Join thousands of satisfied customers who found their perfect home with
        us.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
        <Button
          asChild
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Link to="/properties">Browse Properties</Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-md transition-all duration-300"
        >
          <Link to="/dashboard/add-property">List Your Property</Link>
        </Button>
      </div>
    </motion.div>
  </section>
);
