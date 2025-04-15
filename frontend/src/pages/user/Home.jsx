/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Star,
  MapPin,
  HomeIcon,
  Mountain,
  Trees,
  Hotel,
  Waves,
  ChevronRight,
  DollarSign,
  Globe,
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

  const [properties, setProperties] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: {
            sort: "-createdAt",
            limit: 6,
            isAvailable: true,
            isExpired: false,
          },
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
  }, []);

  const propertyTypes = [
    { icon: <HomeIcon className="h-5 w-5" />, label: "Houses", count: 124 },
    { icon: <Hotel className="h-5 w-5" />, label: "Apartments", count: 89 },
    { icon: <Mountain className="h-5 w-5" />, label: "Cabins", count: 42 },
    { icon: <Trees className="h-5 w-5" />, label: "Countryside", count: 36 },
    { icon: <Waves className="h-5 w-5" />, label: "Beachfront", count: 28 },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Long-term Renter",
      content:
        "Renting a house in Pokhara for a few months was seamless, and the monthly rate was very reasonable!",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Business Tenant",
      content:
        "Found a perfect apartment in Kathmandu for my extended work stay. Great monthly pricing!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "Relocation Renter",
      content:
        "Rented a cabin in Chitwan for three months. The process was smooth, and the host was fantastic.",
      avatar: "https://randomuser.me/api/portraits/women/66.jpg",
    },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  const handleFavoriteToggle = async (propertyId) => {
    setIsFavorite((prev) => !prev);
  };

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
        propertyTypes={propertyTypes}
        setSearchParams={setSearchParams}
        searchParams={searchParams}
      />

      {/* Featured Rentals */}
      <FeaturedRentalsSection
        properties={properties}
        isFavorite={isFavorite}
        handleFavoriteToggle={handleFavoriteToggle}
      />

      {/* Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

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
    className="relative h-[70vh] md:h-[80vh] w-[92vw] mx-auto top-5"
  >
    {/* Background image and gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 rounded-lg" />
    <motion.img
      initial={{ scale: 1.01 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.5 }}
      className="w-full h-full object-cover rounded-lg"
      src="https://images-ext-1.discordapp.net/external/QuyV5f18DHNduNAh88p0FbH_br1vTu5boKeDKVsHo64/%3Fq%3D80%26w%3D2070%26auto%3Dformat%26fit%3Dcrop%26ixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D/https/images.unsplash.com/photo-1670922867539-98a8bb1f65b5?format=webp&width=1862&height=1241"
      alt="Luxury rental property"
      loading="eager"
    />

    {/* Content */}
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl space-y-4 sm:space-y-6"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Find Your <span className="text-primary">Perfect</span> Property
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 dark:text-white/80">
          We provide a complete service for the sale, purchase or rental of real
          estate.
        </p>
      </motion.div>

      {/* Search Form with Background */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-4xl mt-6 md:mt-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl"
      >
        <Tabs defaultValue="rent" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-10 md:h-12">
            <TabsTrigger
              value="rent"
              className="font-medium text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-md h-full transition-all"
            >
              RENT
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="font-medium text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white rounded-md h-full transition-all"
            >
              LIST YOUR PROPERTY
            </TabsTrigger>
          </TabsList>

          {/* Rent Tab Content */}
          <TabsContent value="rent" className="mt-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <select
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={searchParams.location}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          location: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Your City</option>
                      <option value="Kathmandu">Kathmandu</option>
                      <option value="Pokhara">Pokhara</option>
                      <option value="Chitwan">Chitwan</option>
                      <option value="Lalitpur">Lalitpur</option>
                    </select>
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Property Type
                  </label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <select
                      className="w-full pl-10 pr-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={searchParams.propertyType}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          propertyType: e.target.value,
                        })
                      }
                    >
                      <option value="">Choose Property Type</option>
                      <option value="House">House</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Cabin">Cabin</option>
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price Range
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={searchParams.priceRange}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          priceRange: e.target.value,
                        })
                      }
                    >
                      <option value="">Choose Price Range</option>
                      <option value="0-500">$0 - $500</option>
                      <option value="500-1000">$500 - $1000</option>
                      <option value="1000-2000">$1000 - $2000</option>
                      <option value="2000+">$2000+</option>
                    </select>
                  </div>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-1 sm:pt-2"
              >
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white dark:text-black dark:bg-white dark:hover:bg-gray-500 dark:hover:text-white rounded-md px-6 py-2 md:px-8 md:py-3 text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Search Properties
                </Button>
              </motion.div>
            </form>
          </TabsContent>

          {/* List Your Property Tab Content */}
          <TabsContent value="list" className="mt-4">
            <div className="text-center p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-2 md:mb-3">
                Ready to list your property?
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6">
                Join our network of property owners and reach thousands of
                potential renters.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white dark:text-black dark:bg-white dark:hover:bg-gray-500 dark:hover:text-white rounded-full px-6 py-2 md:px-8 md:py-3 text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Link to="/dashboard/add-property">Get Started</Link>
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
}) => (
  <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
    >
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          Explore Property Types
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Find the perfect property that matches your needs
        </p>
      </div>
      {/* <Button
        variant="ghost"
        className="text-primary hover:text-primary/80 font-medium transition-colors duration-300 text-sm md:text-base"
        asChild
      >
        <Link to="/properties" className="flex items-center group">
          View All
          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button> */}
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
                  to={`/properties?type=${type.label.toLowerCase()}`}
                  className="block p-4 md:p-6 text-center"
                  onClick={() =>
                    setSearchParams({
                      ...searchParams,
                      propertyType: type.label,
                    })
                  }
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
                      {type.count}+ Properties
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

const FeaturedRentalsSection = ({
  properties,
  isFavorite,
  handleFavoriteToggle,
}) => (
  <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4"
    >
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          Featured Properties
        </h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Curated selection of premium rentals
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

    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {properties.map((property) => (
          <CarouselItem
            key={property._id}
            className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 mb-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col border border-border py-0">
                <CardHeader className="p-0 relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <img
                      className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      src={
                        property.images[0]?.url ||
                        "https://via.placeholder.com/300"
                      }
                      alt={property.title}
                      loading="lazy"
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-3 right-3"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 h-8 w-8 md:h-10 md:w-10"
                      onClick={() => handleFavoriteToggle(property._id)}
                    >
                      <Heart
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          isFavorite
                            ? "fill-red-500 stroke-red-500"
                            : "stroke-muted-foreground hover:stroke-red-500"
                        }`}
                      />
                    </Button>
                  </motion.div>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-foreground text-xs"
                  >
                    {property.propertyType}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 md:p-5 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base md:text-lg line-clamp-1 text-foreground">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 stroke-yellow-400" />
                      <span className="font-medium text-sm md:text-base">
                        {property.averageRating || "New"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1 mb-2 md:mb-3">
                    <MapPin className="h-3 w-3 md:h-4 md:w-5 flex-shrink-0" />
                    {property.address.city}, {property.address.country}
                  </p>
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground transition-colors duration-300 hover:bg-primary/10"
                      >
                        {amenity}
                      </motion.span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 md:p-5 pt-0 border-t border-border">
                  <div className="w-full flex justify-between items-center">
                    <div>
                      <span className="font-bold text-base md:text-lg text-foreground">
                        ${property.pricePerMonth}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
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
                        className="bg-primary hover:bg-primary/90 text-xs md:text-sm"
                      >
                        <Link to={`/${property._id}`}>View Details</Link>
                      </Button>
                    </motion.div>
                  </div>
                </CardFooter>
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

const TestimonialsSection = ({ testimonials }) => (
  <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center mb-8 md:mb-12"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
        What Our Clients Say
      </h2>
      <p className="text-sm md:text-base text-muted-foreground mt-2">
        Trusted by thousands of happy customers
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <Card className="hover:shadow-md transition-all duration-300 h-full border border-border">
            <CardContent className="p-4 md:p-6">
              <div className="mb-3 md:mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 stroke-yellow-400"
                  />
                ))}
              </div>
              <p className="italic mb-4 md:mb-6 text-sm md:text-base text-muted-foreground">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback className="bg-muted">
                    {testimonial.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm md:text-base text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  </section>
);

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
