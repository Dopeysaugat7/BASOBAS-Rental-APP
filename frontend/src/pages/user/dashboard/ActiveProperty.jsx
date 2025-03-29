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
        if (filter === "pending") return property.approvalStatus === "pending";
        if (filter === "expired") return property.isExpired;
        if (filter === "rejected")
          return property.approvalStatus === "rejected";

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
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
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className="whitespace-nowrap px-4 py-2 text-sm"
        >
          <Clock className="h-4 w-4 mr-1" />
          Pending Approval
        </Button>
        <Button
          variant={filter === "expired" ? "default" : "outline"}
          onClick={() => setFilter("expired")}
          className="whitespace-nowrap px-4 py-2 text-sm"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Expired
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          onClick={() => setFilter("rejected")}
          className="whitespace-nowrap px-4 py-2 text-sm"
        >
          <CalendarOff className="h-4 w-4 mr-1" />
          Rejected
        </Button>
      </div>

      {/* Properties grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <Skeleton className="h-full w-full rounded-t-lg" />
              </AspectRatio>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 flex-wrap">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title={`No ${filter} properties found`}
            description={
              filter === "active"
                ? "You don't have any active properties. Add a new property to get started."
                : filter === "pending"
                ? "You don't have any properties pending approval."
                : "You don't have any expired properties."
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card
              key={property._id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200 group py-0"
            >
              <div className="relative">
                <AspectRatio ratio={16 / 9}>
                  <Link to={`/${property._id}`}>
                    {property.images?.[0]?.url ? (
                      <img
                        src={property.images?.[0]?.url}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Home className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </Link>
                </AspectRatio>
                <Badge
                  variant={
                    property.isExpired
                      ? "destructive"
                      : property.approvalStatus === "pending"
                      ? "secondary"
                      : "default"
                  }
                  className="absolute top-2 left-2"
                >
                  {property.isExpired
                    ? "Expired"
                    : property.approvalStatus === "pending"
                    ? "Pending"
                    : "Active"}
                </Badge>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/${property._id}`}
                          className="flex items-center gap-2 w-full"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/properties/edit/${property._id}`}
                          className="flex items-center gap-2 w-full"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClick(property._id)}
                        disabled={deleteProperty.isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex flex-col justify-between items-start gap-2">
                  <Link to={`/${property._id}`} className="hover:underline">
                    <CardTitle className="text-lg line-clamp-none">
                      {property.title}
                    </CardTitle>
                  </Link>
                  <div className="text-lg font-semibold whitespace-nowrap">
                    ${property.pricePerMonth.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span className="line-clamp-1">
                    {property.address.city}, {property.address.state}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center text-sm">
                    <Bed className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span>{property.bhkConfiguration.bedrooms}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Bath className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span>{property.bhkConfiguration.bathrooms}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Ruler className="h-4 w-4 mr-1.5 text-muted-foreground" />
                    <span>{property.area} sq.ft</span>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm">4.8</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      (24)
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
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
