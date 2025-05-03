import { useState, useEffect } from "react";
import {
  Star,
  Mountain,
  Building,
  Tent,
  Waves,
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FavoriteButton } from "@/components/FavoriteButton";

const API_BASE_URL = "http://localhost:5000/api";

// PropertyCard Component (Compact Version)
function PropertyCards({
  id,
  image,
  title,
  location,
  rating,
  price,
  currency,
  unit,
  amenities,
  type,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full"
    >
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-800/50 h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 py-0">
        <CardHeader className="p-0 relative">
          <div className="overflow-hidden">
            <img
              src={image || "https://placehold.co/400x300"}
              alt={title}
              className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <FavoriteButton propertyId={id} />
          <Badge
            variant="secondary"
            className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-800/90 text-foreground dark:text-white border-0 shadow-sm"
          >
            {type}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 md:py-0 flex-1">
          {" "}
          {/* Reduced padding */}
          <div className="flex items-start justify-between mb-1">
            {" "}
            {/* Reduced margin */}
            <h3 className="font-semibold text-base line-clamp-1 text-foreground dark:text-white">
              {" "}
              {/* Smaller font */}
              {title}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
              <span className="font-medium text-foreground dark:text-white">
                {rating}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1 mb-2">
            {" "}
            {/* Smaller text and margin */}
            <MapPin className="h-3 w-3 flex-shrink-0 text-gray-500 dark:text-gray-400" />{" "}
            {/* Smaller icon */}
            {location}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {" "}
            {/* Reduced gap and margin */}
            {amenities?.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 bg-muted dark:bg-muted/60 rounded-full text-muted-foreground dark:text-gray-300 transition-colors duration-300 hover:bg-primary/10 dark:hover:bg-primary/20"
              >
                {amenity}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 border-t border-muted dark:border-gray-700">
          {" "}
          {/* Reduced padding */}
          <div className="w-full flex justify-between items-center">
            <div>
              <span className="font-bold text-base text-foreground dark:text-white">
                {" "}
                {/* Smaller font */}
                {currency} {price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground dark:text-gray-400">
                {" "}
                {/* Smaller text */} {unit}
              </span>
            </div>
            <Button
              asChild
              variant="primary"
              size="sm"
              className="bg-primary text-white hover:bg-primary/90 dark:text-black dark:bg-white dark:hover:bg-gray-500 dark:hover:text-white transition-all duration-300 text-xs px-3 h-8"
            >
              <Link to={`/${id}`}>View Details</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Categories data (mapped to backend propertyType enum)
const categories = [
  { id: "all", name: "All", icon: Building },
  { id: "House", name: "Houses", icon: Building },
  { id: "Apartment", name: "Apartments", icon: Tent },
  { id: "Penthouse", name: "Penthouse", icon: Mountain },
  { id: "Villa", name: "Villas", icon: Waves },
  { id: "Duplex", name: "Duplex", icon: Star },
];

function CategoryTabs({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    onCategoryChange(category === "all" ? null : category);
  };

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl lg:max-w-[90rem] mx-auto px-4 sm:px-6 py-4">
        <ScrollArea className="w-full">
          <Tabs
            value={activeCategory}
            onValueChange={handleCategoryChange}
            className="w-full"
          >
            <TabsList className="w-full justify-start h-auto bg-transparent gap-2 p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="
                    data-[state=active]:bg-primary data-[state=active]:text-white
                    data-[state=active]:shadow-md rounded-full px-4 py-2
                    transition-all duration-200 hover:bg-primary/10 hover:text-primary
                    flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300
                  "
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <ScrollBar
            orientation="horizontal"
            className="h-1 bg-gray-200 dark:bg-gray-700"
          />
        </ScrollArea>
      </div>
    </div>
  );
}

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: {
            propertyType: categoryFilter || null,
            isAvailable: true,
            isExpired: false,
            sort: "-createdAt",
            limit: 20,
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
  }, [categoryFilter]);

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading properties...
      </div>
    );
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-screen">
      <CategoryTabs onCategoryChange={setCategoryFilter} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:max-w-[90rem]">
        {properties.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">
            No properties found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {" "}
            {/* Reduced gap */}
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
                amenities={property.amenities}
                type={property.propertyType}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
