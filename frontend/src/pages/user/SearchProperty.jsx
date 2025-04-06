import { useState, useEffect } from "react";
import { Heart, Star, MapPin, Search, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// PropertyCard Component
function PropertyCards({ id, image, title, location, rating, price, currency, unit }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link to={`/${id}`}>
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-gray-800/50 h-full flex flex-col py-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg">
            <img
            src={image || "https://placehold.co/400x300"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            />
            <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm"
            >
            <Heart
                className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-foreground/70"}`}
            />
            </Button>
        </div>
        <CardContent className="p-4 flex-grow">
            <div className="flex justify-between items-start gap-2">
            <h3 className="font-medium text-foreground line-clamp-2 text-left">{title}</h3>
            <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-xs">{rating}</span>
            </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1 text-left flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
            </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <p className="font-semibold text-foreground">
            {currency} {price.toLocaleString()}
            <span className="font-normal text-muted-foreground"> {unit}</span>
            </p>
        </CardFooter>
        </Card>
    </Link>
  );
}

export default function SearchProperty() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { searchParams: initialParams } = location.state || { searchParams: { location: "", propertyType: "" } };

  // State for search bar inputs
  const [searchParams, setSearchParams] = useState({
    location: initialParams.location,
    propertyType: initialParams.propertyType,
  });

  // Fetch properties based on search parameters
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/properties`, {
          params: {
            search: searchParams.location,
            propertyType: searchParams.propertyType,
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
  }, [searchParams.location, searchParams.propertyType]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Refetch happens automatically via useEffect dependency
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-1/2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Enter city or neighborhood"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary rounded-md"
              />
            </div>
            <div className="w-full sm:w-1/2 flex items-center gap-2">
              <Building className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="e.g., House, Apartment"
                value={searchParams.propertyType}
                onChange={(e) => setSearchParams({ ...searchParams, propertyType: e.target.value })}
                className="w-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary rounded-md"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 transition-all duration-300"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Cards */}
          <div className="lg:col-span-2">
            {properties.length === 0 ? (
              <p className="text-center text-muted-foreground">No properties found matching your criteria.</p>
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
            <div className="rounded-lg overflow-hidden shadow border bg-muted w-full h-full">
              <iframe
                title="Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(searchParams.location || "Kathmandu")}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-none"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}