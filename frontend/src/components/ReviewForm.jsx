/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const ReviewForm = ({ propertyId, review, onReviewSubmitted, onClose }) => {
  const { user } = useAuth();
  const isEditMode = !!review;
  const [rating, setRating] = useState(review?.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      comment: review?.comment || "",
    },
  });

  const onSubmit = async (data) => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        // Update existing review
        response = await axios.put(
          `http://localhost:5000/api/reviews/${review._id}`,
          {
            rating,
            comment: data.comment,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      } else {
        // Create new review
        response = await axios.post(
          "http://localhost:5000/api/reviews",
          {
            property: propertyId,
            rating,
            comment: data.comment,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }
      console.log("Review API response:", response.data);
      toast.success(
        response.data.message ||
          `Review ${isEditMode ? "updated" : "submitted"} successfully`
      );

      // Prepare the review data to pass back, matching the API response structure
      const updatedReview = {
        _id:
          response.data.review._id ||
          (isEditMode ? review._id : Date.now().toString()), // Fallback _id for new reviews
        rating,
        comment: data.comment,
        user: {
          _id: user._id,
          name: user.name,
          profilePicture: user.profilePicture || null,
        },
        createdAt: isEditMode
          ? review.createdAt
          : response.data.review.createdAt || new Date().toISOString(),
      };

      console.log("Sending updatedReview to parent:", updatedReview);
      // Call the onReviewSubmitted callback with the updated review
      onReviewSubmitted(updatedReview, isEditMode);

      // Close the dialog after successful submission
      if (onClose) {
        onClose();
      }

      if (!isEditMode) {
        form.reset();
        setRating(0);
      }
    } catch (error) {
      console.error("Review submission error:", error.response?.data || error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "submit"} review`
      );
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2">
          <FormLabel>Rating:</FormLabel>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 cursor-pointer ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={
            !user ||
            isSubmitting ||
            (isEditMode && user?._id !== review?.user._id)
          }
        >
          {isSubmitting
            ? "Processing..."
            : user
            ? isEditMode
              ? "Update Review"
              : "Submit Review"
            : "Login to Submit Review"}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
