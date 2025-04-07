import { useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  popularity: number;
}

interface UserInteraction {
  product_id: string;
  liked: boolean;
}

interface Recommendation {
  product_id: string;
  name: string;
  confidence_score: number;
  price: number;
  rating: number;
}

interface UseQuantumRecommendationsProps {
  userData: {
    id: string;
    price_sensitivity: number;
    preferred_categories: string[];
  };
  productData: Product[];
  userInteractions: UserInteraction[];
  nRecommendations?: number;
}

export const useQuantumRecommendations = ({
  userData,
  productData,
  userInteractions,
  nRecommendations = 5
}: UseQuantumRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_QUANTUM_SERVICE_URL}/api/quantum/recommend`,
          {
            user_data: userData,
            product_data: productData,
            user_interactions: userInteractions,
            n_recommendations: nRecommendations
          }
        );

        if (response.data.status === 'success') {
          setRecommendations(response.data.recommendations);
        } else {
          throw new Error('Failed to get recommendations');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userData && productData.length > 0 && userInteractions.length > 0) {
      fetchRecommendations();
    }
  }, [userData, productData, userInteractions, nRecommendations]);

  return {
    recommendations,
    loading,
    error
  };
}; 