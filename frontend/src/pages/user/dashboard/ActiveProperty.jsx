import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Home,
  Plus,
  Star,
  MapPin,
  Ruler,
  Bed,
  Bath,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CalendarOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useDeleteProperty, useHostProperties } from "@/hooks/useProperties";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const MyProperties = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("active");
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const { data: properties, isLoading, isError } = useHostProperties(user._id);

  console.log(user);
  const deleteSuccess = () => {
    queryClient.invalidateQueries(["myProperties"]);
    toast.success("Property deleted successfully");
    setDeleteDialogOpen(false);
  };

  const deleteError = (error) => {
    toast.error(error.response?.data?.message || "Failed to delete property");
    setDeleteDialogOpen(false);
  };
  const deleteProperty = useDeleteProperty(deleteSuccess, deleteError);

  const handleDeleteClick = (id) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deleteProperty.mutate(propertyToDelete);
    }
  };

  console.log(properties);
  const filteredProperties = useMemo(() => {
    return (
      properties?.data.filter((property) => {
        if (filter === "active")
          return property.isActive && !property.isExpired;
        if (filter === "expired") return property.isExpired;

        return true;
      }) || []
    );
  }, [properties, filter]);

  if (isError) {
    return (
      <EmptyState
        title="Error loading properties"
        description="Failed to fetch your properties. Please try again later."
      />
    );
  }

  return (
    <div className="container mx-auto sm:px-4 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Home className="h-6 w-6 text-primary" />
            My Properties
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your rental properties and listings
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link
            to="/dashboard/add-property"
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
          className="whitespace-nowrap px-4 py-2 text-sm"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Active
        </Button>
        <Button
          variant={filter === "expired" ? "destructive" : "outline"}
          onClick={() => setFilter("expired")}
          className="whitespace-nowrap px-4 py-2 text-sm"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Expired
        </Button>
      </div>

      {/* Properties grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden border border-border/40 rounded-xl"
            >
              <AspectRatio ratio={16 / 9}>
                <Skeleton className="h-full w-full" />
              </AspectRatio>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="pt-2">
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-muted/30 rounded-2xl p-10 border border-border/30">
          <EmptyState
            title={`No ${filter} properties found`}
            description={
              filter === "active"
                ? "You don't have any active properties. Add a new property to get started."
                : "You don't have any expired properties."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property._id}
              className="overflow-hidden border border-border/40 rounded-xl hover:shadow-lg transition-all duration-300 group p-0"
            >
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <Link to={`/${property._id}`}>
                    {property.images?.length > 0 ? (
                      <img
                        src={
                          property.images.find((img) => img.isPrimary)?.url ||
                          property.images[0].url ||
                          "/placeholder.svg"
                        }
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                        <Home className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </Link>
                </AspectRatio>

                <Badge
                  variant={property.isExpired ? "destructive" : "default"}
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full shadow-sm ${
                    property.isExpired
                      ? "bg-destructive/90 backdrop-blur-sm text-white"
                      : "bg-primary/90 backdrop-blur-sm"
                  }`}
                >
                  {property.isExpired ? (
                    <div className="flex items-center gap-1">
                      <CalendarOff className="h-3 w-3" />
                      <span>Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  )}
                </Badge>

                <div className="absolute top-3 right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl"
                    >
                      <DropdownMenuItem asChild className="py-2.5">
                        <Link
                          to={`/${property._id}`}
                          className="flex items-center gap-2 w-full"
                        >
                          <Eye className="h-4 w-4" />
                          View Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="py-2.5">
                        <Link
                          to={`/dashboard/edit/${property._id}`}
                          className="flex items-center gap-2 w-full"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Property
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive py-2.5"
                        onClick={() => handleDeleteClick(property._id)}
                        disabled={deleteProperty.isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Property
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-border/30">
                  <div className="text-base font-medium">
                    ₨. {property.pricePerMonth.toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      /month
                    </span>
                  </div>
                </div>
              </div>

              <CardContent className="p-5">
                <Link
                  to={`/${property._id}`}
                  className="hover:underline block mb-2"
                >
                  <CardTitle className="text-lg line-clamp-1 font-medium">
                    {property.title}
                  </CardTitle>
                </Link>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {property.address.city}, {property.address.state}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className="bg-background border-border/50 rounded-full px-3 py-1 font-normal flex items-center gap-1.5"
                  >
                    <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{property.bhkConfiguration.bedrooms} Beds</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-background border-border/50 rounded-full px-3 py-1 font-normal flex items-center gap-1.5"
                  >
                    <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{property.bhkConfiguration.bathrooms} Baths</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-background border-border/50 rounded-full px-3 py-1 font-normal flex items-center gap-1.5"
                  >
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{property.area} sq.ft</span>
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground flex items-center bg-muted/50 px-2.5 py-1 rounded-full">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              property and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProperty.isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyProperties;
