/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, User, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReviewForm from "./ReviewForm";
import { useReviews } from "@/hooks/useReview";
import { useAuth } from "@/context/AuthContext";
import { useProperty } from "@/hooks/useProperties";
import axios from "axios";
import { toast } from "react-toastify";

const ReviewsSection = ({ propertyId }) => {
  const { user } = useAuth();
  const { data: property, refetch: refetchProperty } = useProperty(propertyId);
  const isOwner =
    user && property?.property && user._id === property.property.host._id;
  const {
    data: popularReviews,
    isLoading: isPopularLoading,
    refetch: refetchPopular,
  } = useReviews(propertyId, true);
  const {
    data: allReviews,
    isLoading: isAllLoading,
    refetch: refetchAll,
  } = useReviews(propertyId);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localReviews, setLocalReviews] = useState([]);
  const [localTotal, setLocalTotal] = useState(0);

  // Initialize local state with fetched reviews
  useEffect(() => {
    if (showAllReviews && allReviews?.data) {
      setLocalReviews(allReviews.data);
      setLocalTotal(allReviews.total);
    } else if (popularReviews?.data) {
      setLocalReviews(popularReviews.data);
      setLocalTotal(allReviews?.total || 0);
    }
    console.log("useReviews debug:", {
      allReviews,
      refetchAll,
      popularReviews,
      refetchPopular,
    });
    console.log("localReviews updated:", localReviews);
  }, [popularReviews, allReviews, showAllReviews]);

  const handleDeleteReview = async (reviewId) => {
    setIsDeleting(true);

    // Optimistically remove the review
    const reviewToDelete = localReviews.find((r) => r._id === reviewId);
    setLocalReviews((prev) => prev.filter((r) => r._id !== reviewId));
    setLocalTotal((prev) => prev - 1);

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      toast.success(response.data.message || "Review deleted successfully");

      // Refetch to sync with server, using the appropriate refetch function
      const refetchFn = showAllReviews ? refetchAll : refetchPopular;
      if (refetchFn && typeof refetchFn === "function") {
        const [updatedReviews] = await Promise.all([
          refetchFn(),
          refetchProperty(),
        ]);
        const newReviews = showAllReviews
          ? updatedReviews.data?.data
          : updatedReviews.data?.data?.slice(0, 3);
        setLocalReviews(newReviews || []);
        setLocalTotal(updatedReviews.data?.total || 0);
      } else {
        console.warn(
          "Refetch function is not available, relying on optimistic update"
        );
      }
    } catch (error) {
      console.error("Delete review error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to delete review");

      // Revert optimistic update on error
      if (reviewToDelete) {
        setLocalReviews((prev) =>
          [...prev, reviewToDelete].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
        setLocalTotal((prev) => prev + 1);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
  };

  const handleReviewSubmitted = (newReview, isEditMode) => {
    if (isEditMode) {
      // Optimistically update the review
      setLocalReviews((prev) => {
        console.log("Editing review:", newReview);
        const updated = prev.map((r) =>
          r._id === newReview._id
            ? {
                ...r,
                rating: newReview.rating,
                comment: newReview.comment,
                createdAt: r.createdAt,
              }
            : r
        );
        console.log("Updated reviews after edit:", updated);
        return updated;
      });
    } else {
      // Optimistically add the new review
      setLocalReviews((prev) => {
        console.log("Adding new review:", newReview);
        const updated = [newReview, ...prev].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log("Updated reviews after add:", updated);
        return showAllReviews ? updated : updated.slice(0, 3);
      });
      setLocalTotal((prev) => prev + 1);
    }

    // Remove refetch logic to rely on optimistic updates
    // (Since refetchAll is not a function, this avoids overriding the state)
  };

  if (isPopularLoading || isAllLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews ({localTotal})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {localReviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {localReviews.map((review) => (
                  <div
                    key={review._id}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {review.user.profilePicture ? (
                            <img
                              src={review.user.profilePicture}
                              alt={review.user.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{review.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      {(user?._id === review.user._id || isOwner) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDeleting}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
              {localTotal > 3 && !showAllReviews && (
                <Button
                  variant="outline"
                  onClick={() => setShowAllReviews(true)}
                >
                  Show all {localTotal} reviews
                </Button>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              No reviews yet for this property.
            </p>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={isOwner}>Write a Review</Button>
            </DialogTrigger>
            <DialogContent aria-describedby="review-dialog-description">
              <div id="review-dialog-description" className="sr-only">
                A dialog for writing or editing a review for a property.
              </div>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
              </DialogHeader>
              <ReviewForm
                propertyId={propertyId}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </DialogContent>
          </Dialog>

          <Dialog
            open={!!editingReview}
            onOpenChange={() => setEditingReview(null)}
          >
            <DialogContent aria-describedby="review-dialog-description">
              <div id="review-dialog-description" className="sr-only">
                A dialog for writing or editing a review for a property.
              </div>
              <DialogHeader>
                <DialogTitle>Edit Review</DialogTitle>
              </DialogHeader>
              <ReviewForm
                propertyId={propertyId}
                review={editingReview}
                onReviewSubmitted={handleReviewSubmitted}
                onClose={() => setEditingReview(null)}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection;
