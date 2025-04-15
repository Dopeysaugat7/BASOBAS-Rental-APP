/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  Star,
  MapPin,
  Calendar,
  Users,
  HomeIcon,
  Mountain,
  Trees,
  Hotel,
  Waves,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export default function Home() {
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
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

  if (loading)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10"
      >
        Loading...
      </motion.div>
    );
  if (error)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-10 text-red-500"
      >
        {error}
      </motion.div>
    );

  const handleFavoriteToggle = async (propertyId) => {
    if (isFavorite) {
      setIsFavorite(false);
    } else {
      setIsFavorite(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[94vh] max-h-[100vh] w-full"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"
        />
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80"
          alt="Luxury rental property with mountain view"
          loading="eager"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl tracking-tight"
          >
            Rent Your Ideal <span className="text-primary">Home</span>
          </motion.h1>
          <motion.p
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/90 mb-10 max-w-2xl"
          >
            Find rental properties for your long-term stay, tailored to your
            needs
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full max-w-4xl"
          >
            <Tabs defaultValue="rent" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 mb-6 bg-background/20 backdrop-blur-sm rounded-lg">
                <TabsTrigger
                  value="rent"
                  className="text-lg font-medium text-white data-[state=active]:bg-white data-[state=active]:text-foreground rounded-md transition-all duration-300"
                >
                  Find a Rental
                </TabsTrigger>
                <TabsTrigger
                  value="host"
                  className="text-lg font-medium text-white data-[state=active]:bg-white data-[state=active]:text-foreground rounded-md transition-all duration-300"
                >
                  List Your Property
                </TabsTrigger>
              </TabsList>
              <TabsContent value="rent">
                <form
                  onSubmit={handleSearch}
                  className="bg-background/95 shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="md:flex">
                    <div className="flex-1 p-4 border-r border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Property Type
                      </label>
                      <div className="flex items-center">
                        <HomeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <Input
                          placeholder="e.g., House, Apartment"
                          className="border-1 border-gray-300 dark:border-0 py-2 px-4 focus-visible:ring-0 text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full"
                          value={searchParams.propertyType}
                          onChange={(e) =>
                            setSearchParams({
                              ...searchParams,
                              propertyType: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Location
                      </label>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />{" "}
                        {/* Fixed typo */}
                        <Input
                          placeholder="Enter city or neighborhood"
                          className="border-1 border-gray-300 dark:border-0 py-2 px-4 focus-visible:ring-0 text-lg placeholder:text-gray-400 dark:placeholder:text-gray-500 w-full"
                          value={searchParams.location}
                          onChange={(e) =>
                            setSearchParams({
                              ...searchParams,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="p-3 flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full mt-7 md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="host">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-background/95 shadow-2xl rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700"
                >
                  <motion.h3
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl font-semibold mb-4 text-foreground dark:text-white"
                  >
                    Earn by renting out your property
                  </motion.h3>
                  <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mb-6 text-muted-foreground dark:text-gray-400"
                  >
                    List your property and earn monthly income from renters
                  </motion.p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white dark:text-black dark:bg-white dark:hover:bg-gray-500 dark:hover:text-white rounded-full px-8 py-3 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Link to="/dashboard/add-property">
                        List Your Property
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.section>

      {/* Property Types */}
      <section className="py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">
            Explore Rental Types
          </h2>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
            asChild
          >
            <Link to="/properties" className="flex items-center group">
              See All Options
              <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {propertyTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
                <Link
                  to={`/properties?type=${type.label.toLowerCase()}`}
                  className="block p-6 text-center"
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
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                      <div className="text-primary group-hover:text-white transition-colors duration-300">
                        {type.icon}
                      </div>
                    </div>
                    <span className="font-medium text-foreground dark:text-white group-hover:text-primary transition-colors duration-300">
                      {type.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-secondary/20 dark:bg-secondary/30 text-secondary-foreground dark:text-secondary-foreground/80 group-hover:bg-primary group-hover:text-white transition-all duration-300"
                    >
                      {type.count}+ Rentals
                    </Badge>
                  </motion.div>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Rentals */}
      <section className="py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-white">
              Featured Rentals
            </h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 font-medium transition-colors duration-300"
              asChild
            >
              <Link to="/properties" className="flex items-center group">
                Explore All Rentals
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {properties.map((property) => (
                <CarouselItem
                  key={property._id}
                  className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/50 h-full flex flex-col border border-gray-200 dark:border-gray-700 py-0">
                      <CardHeader className="p-0 relative">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5 }}
                          className="overflow-hidden"
                        >
                          <img
                            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
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
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full bg-background/80 dark:bg-background/60 transition-all duration-300 backdrop-blur-sm"
                            onClick={() => handleFavoriteToggle(property._id)}
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                isFavorite
                                  ? "fill-red-500 stroke-red-500"
                                  : "stroke-gray-600 dark:stroke-gray-400"
                              }`}
                            />
                          </Button>
                        </motion.div>
                        <Badge
                          variant="secondary"
                          className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 text-foreground dark:text-white border-0 shadow-sm"
                        >
                          {property.propertyType}
                        </Badge>
                      </CardHeader>
                      <CardContent className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg line-clamp-1 text-foreground dark:text-white">
                            {property.title}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                            <span className="font-medium text-foreground dark:text-white">
                              {property.averageRating || 0}
                            </span>
                            <span className="text-xs text-muted-foreground dark:text-gray-400">
                              ({property.views || 0} reviews)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-gray-400 flex items-center gap-1 mb-3">
                          <MapPin className="h-4 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                          {property.address.city}, {property.address.country}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {property.amenities.slice(0, 3).map((amenity, i) => (
                            <motion.span
                              key={i}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                              className="text-xs px-2 py-1 bg-muted dark:bg-muted/60 rounded-full text-muted-foreground dark:text-gray-300 transition-colors duration-300 hover:bg-primary/10 dark:hover:bg-primary/20"
                            >
                              {amenity}
                            </motion.span>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-5 pt-0 border-t border-muted dark:border-gray-700">
                        <div className="w-full flex justify-between items-center">
                          <div>
                            <span className="font-bold text-lg text-foreground dark:text-white">
                              ${property.pricePerMonth}
                            </span>
                            <span className="text-sm text-muted-foreground dark:text-gray-400">
                              {" "}
                              / month
                            </span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Button
                              asChild
                              variant="primary"
                              size="sm"
                              className="bg-primary text-white hover:bg-primary/90 dark:text-black dark:bg-white  dark:hover:bg-gray-500 dark:hover:text-white transition-all duration-300"
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
            <div className="flex justify-center mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CarouselPrevious className="relative inset-0 translate-y-0 mr-2 bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full p-2 transition-all duration-300" />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <CarouselNext className="relative inset-0 translate-y-0 ml-2 bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full p-2 transition-all duration-300" />
              </motion.div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold mb-12 text-center text-foreground dark:text-white"
        >
          What Our Renters Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardContent className="p-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-6 flex justify-center"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Star className="inline-block h-5 w-5 fill-yellow-400 stroke-yellow-400 mr-1" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="italic mb-6 text-muted-foreground dark:text-gray-400"
                  >
                    " {testimonial.content} "
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-muted dark:bg-muted/60 text-foreground dark:text-white">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <p className="font-medium text-foreground dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 md:px-8 lg:px-12 text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-black dark:text-white"
          >
            Ready to rent your next home?
          </motion.h2>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl mb-10 max-w-2xl mx-auto text-black dark:text-white"
          >
            Discover affordable monthly rentals and secure your ideal living
            space today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full px-8 py-6 text-lg bg-white text-primary dark:bg-gray-100 dark:text-black hover:bg-black hover:text-white dark:hover:bg-gray-500 dark:hover:text-white transition-all duration-300 border-1 hover:shadow-lg"
                asChild
              >
                <Link to="/properties">Find Rentals</Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-lg bg-black border-1 text-white hover:bg-white hover:text-primary dark:hover:bg-gray-100 dark:hover:text-black transition-all duration-300"
                asChild
              >
                <Link to="/dashboard/add-property">
                  List Your Property for Rent
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
