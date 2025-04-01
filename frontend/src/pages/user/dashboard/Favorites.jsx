import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MapPin,
  Star,
  Home,
  Trash2,
  ChevronRight,
  Share2,
  MoveRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Favorites() {
  const favoriteProperties = [
    {
      id: 1,
      title: "Skyline Loft",
      address: "123 Modern Ave, New York",
      price: 3200,
      beds: 2,
      baths: 2,
      rating: 4.9,
      image: "/apartment1.jpg",
      featured: true,
      amenities: ["Parking", "Gym", "Pool"],
    },
    {
      id: 2,
      title: "Minimalist Studio",
      address: "456 Simple St, Brooklyn",
      price: 2100,
      beds: 1,
      baths: 1,
      rating: 4.7,
      image: "/studio1.jpg",
      amenities: ["Co-working", "Laundry"],
    },
    {
      id: 3,
      title: "Urban Retreat",
      address: "789 Quiet Blvd, Queens",
      price: 2800,
      beds: 2,
      baths: 1,
      rating: 4.8,
      image: "/apartment2.jpg",
      amenities: ["Garden", "Bike Storage"],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-light tracking-tight">Saved Homes</h1>
        <p className="text-muted-foreground mt-2">
          {favoriteProperties.length} properties ·{" "}
          <span className="text-primary">Recently added</span>
        </p>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteProperties.map((property) => (
          <Card
            key={property.id}
            className={`border-1 shadow-none transition-all duration-300 overflow-hidden py-0`}
          >
            <CardContent className="p-0">
              {/* Image Placeholder */}
              <div className="h-48 relative bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-8 w-8 text-muted-foreground" />
                </div>

                {/* Featured Badge */}
                {property.featured && (
                  <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm text-black border border-yellow-400 dark:text-white p-2">
                    <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                    Featured
                  </Badge>
                )}

                {/* Heart Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <Heart className="h-4 w-4 fill-primary text-primary" />
                </Button>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg font-light">
                    {property.title}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="mr-2 h-3 w-3" />
                    <span className="text-sm">{property.address}</span>
                  </CardDescription>
                </CardHeader>

                {/* Price and Rating */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-lg font-light">
                      ${property.price}
                      <span className="text-sm text-muted-foreground">/mo</span>
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
                    <Badge key={i} variant="secondary" className="font-normal">
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
                <div className="flex justify-between items-center pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                  <Button variant="link" size="sm">
                    View <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {favoriteProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse"></div>
          </div>
          <h3 className="text-xl font-light mb-2">No saved homes yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Click the heart icon on listings to save them here for easy access.
          </p>
          <Button variant="outline" className="rounded-full">
            Browse available properties
          </Button>
        </div>
      )}
    </div>
  );
}
