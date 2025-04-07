import React from 'react';
import { useQuantumRecommendations } from '../hooks/useQuantumRecommendations';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

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

interface QuantumRecommendationsProps {
  userData: {
    id: string;
    price_sensitivity: number;
    preferred_categories: string[];
  };
  productData: Product[];
  userInteractions: UserInteraction[];
  nRecommendations?: number;
}

export const QuantumRecommendations: React.FC<QuantumRecommendationsProps> = ({
  userData,
  productData,
  userInteractions,
  nRecommendations = 5
}) => {
  const { recommendations, loading, error } = useQuantumRecommendations({
    userData,
    productData,
    userInteractions,
    nRecommendations
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Quantum-Powered Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Quantum-Powered Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.product_id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{recommendation.name}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(recommendation.confidence_score * 100)}% match
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  ${recommendation.price.toFixed(2)}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">★</span>
                  <span>{recommendation.rating.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 