import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export const FavoriteButton = ({ propertyId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check favorite status
  const { data: isFavorited } = useQuery({
    queryKey: ["favoriteStatus", propertyId],
    queryFn: async () => {
      if (!user) return false;
      const response = await axios.get(
        `http://localhost:5000/api/favorites/${propertyId}/status`,
        {
          withCredentials: true,
        }
      );
      return response.data.isFavorited;
    },
    enabled: !!user,
  });

  // Toggle favorite mutation
  const { mutate: toggleFavorite, isPending } = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await axios.delete(
          `http://localhost:5000/api/favorites/${propertyId}`,
          {
            withCredentials: true,
          }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/favorites/${propertyId}`,
          {},
          {
            withCredentials: true,
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["favoriteStatus", propertyId]);
      queryClient.invalidateQueries(["favorites"]); // Invalidate favorites list
      toast.success(
        isFavorited ? "Removed from favorites" : "Added to favorites"
      );
    },
    onError: () => {
      toast.error("Failed to update favorites");
    },
  });

  const handleClick = () => {
    if (!user) {
      toast.error("Please login to add to favorites");
      return;
    }
    toggleFavorite();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className="absolute top-3 right-3 bg-background/90 hover:bg-background backdrop-blur-sm p-2 transition-all duration-200 hover:scale-110"
    >
      <Heart
        className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
      />
    </Button>
  );
};
