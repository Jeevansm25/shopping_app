'use client';

import React, { useState } from 'react';
import { QuantumRecommendations } from '../../components/QuantumRecommendations';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';

export default function QuantumRecommendationsPage() {
  const [priceSensitivity, setPriceSensitivity] = useState(0.5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Sample product data - replace with your actual product data
  const productData = [
    {
      id: 'p1',
      name: 'Quantum-Enhanced Laptop',
      price: 1299.99,
      rating: 4.8,
      popularity: 85,
      category: 'electronics'
    },
    {
      id: 'p2',
      name: 'Smart Home Hub',
      price: 199.99,
      rating: 4.5,
      popularity: 75,
      category: 'electronics'
    },
    {
      id: 'p3',
      name: 'Wireless Earbuds',
      price: 149.99,
      rating: 4.6,
      popularity: 90,
      category: 'electronics'
    },
    {
      id: 'p4',
      name: 'Smart Watch',
      price: 299.99,
      rating: 4.7,
      popularity: 80,
      category: 'electronics'
    }
  ];

  // Sample user interactions - replace with actual user interaction data
  const userInteractions = [
    { product_id: 'p1', liked: true },
    { product_id: 'p2', liked: false },
    { product_id: 'p3', liked: true }
  ];

  const categories = ['electronics', 'books', 'clothing', 'home', 'sports'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Quantum-Powered Product Recommendations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Preferences</h2>
            
            <div className="space-y-2">
              <Label>Price Sensitivity</Label>
              <Slider
                value={[priceSensitivity * 100]}
                onValueChange={([value]) => setPriceSensitivity(value / 100)}
                max={100}
                step={1}
              />
              <div className="text-sm text-muted-foreground">
                {priceSensitivity < 0.3 ? 'Price Conscious' :
                 priceSensitivity < 0.7 ? 'Balanced' : 'Premium Quality Focused'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    onClick={() => toggleCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <QuantumRecommendations
            userData={{
              id: 'user123',
              price_sensitivity: priceSensitivity,
              preferred_categories: selectedCategories
            }}
            productData={productData}
            userInteractions={userInteractions}
            nRecommendations={3}
          />
        </div>
      </div>
    </div>
  );
} 