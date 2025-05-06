import { useState, useEffect } from "react";
import axios from "axios";

export const useReviews = (propertyId, isPopular = false) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const endpoint = isPopular
          ? `http://localhost:5000/api/reviews/${propertyId}/popular`
          : `http://localhost:5000/api/reviews/${propertyId}`;

        const response = await axios.get(endpoint, {
          withCredentials: true,
        });

        setData(response.data);
      } catch (err) {
        setIsError(true);
        setError(err.response?.data?.message || "Failed to fetch reviews");
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchReviews();
    }
  }, [propertyId, isPopular]);

  return { data, isLoading, isError, error };
};
