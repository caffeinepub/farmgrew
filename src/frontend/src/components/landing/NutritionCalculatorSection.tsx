import { useState, useEffect } from 'react';
import { Calculator, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Container from '../layout/Container';
import { nutritionItems, calculateTotals } from '@/lib/nutritionData';
import type { BasketItem } from '@/lib/nutritionData';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { navigate } from '@/router/navigation';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

interface NutritionCalculatorSectionProps {
  selectedPlan: string | null;
}

export default function NutritionCalculatorSection({ selectedPlan }: NutritionCalculatorSectionProps) {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  
  // Backend integration for the calculator panel
  const { data: products = [], isLoading: productsLoading } = useProducts(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const addToCartMutation = useAddToCart();
  const [cartError, setCartError] = useState<string>('');
  const { identity } = useInternetIdentity();

  useEffect(() => {
    if (selectedPlan) {
      // Pre-fill calculator based on selected diet plan - all vegetarian items
      if (selectedPlan === 'high-protein') {
        setBasket([
          { itemId: 'paneer', quantity: 150 },
          { itemId: 'broccoli', quantity: 150 },
          { itemId: 'chickpeas', quantity: 100 },
          { itemId: 'quinoa', quantity: 100 },
        ]);
      } else if (selectedPlan === 'low-sugar') {
        setBasket([
          { itemId: 'spinach', quantity: 100 },
          { itemId: 'cucumber', quantity: 150 },
          { itemId: 'tomato', quantity: 100 },
          { itemId: 'broccoli', quantity: 100 },
        ]);
      } else if (selectedPlan === 'balanced') {
        setBasket([
          { itemId: 'banana', quantity: 120 },
          { itemId: 'carrot', quantity: 100 },
          { itemId: 'apple', quantity: 150 },
          { itemId: 'lentils', quantity: 80 },
        ]);
      }
    }
  }, [selectedPlan]);

  const addItem = () => {
    if (selectedItem) {
      const existing = basket.find((item) => item.itemId === selectedItem);
      if (existing) {
        setBasket(basket.map((item) =>
          item.itemId === selectedItem ? { ...item, quantity: item.quantity + 100 } : item
        ));
      } else {
        setBasket([...basket, { itemId: selectedItem, quantity: 100 }]);
      }
      setSelectedItem('');
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setBasket(basket.map((item) =>
      item.itemId === itemId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    ).filter((item) => item.quantity > 0));
  };

  const removeItem = (itemId: string) => {
    setBasket(basket.filter((item) => item.itemId !== itemId));
  };

  const handleAddToCart = async () => {
    if (!selectedProductId || quantity < 1) return;
    
    setCartError('');
    
    if (!identity) {
      setCartError('Please log in to add items to cart');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productId: BigInt(selectedProductId),
        quantity: BigInt(quantity),
      });
      
      // Navigate to cart on success
      navigate('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setCartError(error.message || 'Failed to add item to cart. Please try again.');
    }
  };

  const totals = calculateTotals(basket);

  return (
    <section id="nutrition" className="section-spacing bg-muted/30">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-8 h-8 text-brand-green" />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  Nutrition Calculator
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground">
                Calculate the nutritional value of your pure vegetarian basket. Add items and quantities to see instant estimates of calories, protein, carbs, and fats.
              </p>
              <p className="text-sm text-muted-foreground italic">
                * Nutritional values are estimates based on standard serving sizes and may vary.
              </p>
            </div>

            {/* Image */}
            <div className="animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
                <img
                  src="/assets/generated/icon-nutrition-calculator-v3.dim_1024x1024.png"
                  alt="Nutrition Calculator"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/10 via-transparent to-brand-yellow/10 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Calculator */}
          <div className="space-y-6">
            {/* Add Item to Cart - Backend Integration */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Add Products to Cart</CardTitle>
                <CardDescription>Select from our vegetarian products and add to your cart</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {productsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading products...</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="product-select">Product</Label>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger id="product-select">
                          <SelectValue placeholder="Select a product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id.toString()} value={product.id.toString()}>
                              {product.name} - ₹{(Number(product.priceCents) / 100).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quantity-input">Quantity</Label>
                      <Input
                        id="quantity-input"
                        type="number"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Maximum 10 units per order</p>
                    </div>

                    {cartError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{cartError}</p>
                      </div>
                    )}

                    <Button 
                      onClick={handleAddToCart} 
                      disabled={!selectedProductId || quantity < 1 || addToCartMutation.isPending}
                      className="w-full"
                    >
                      {addToCartMutation.isPending ? (
                        <>Adding...</>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Nutrition Calculator - Local State */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Nutrition Estimator</CardTitle>
                <CardDescription>Add items to estimate nutritional values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {nutritionItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addItem} disabled={!selectedItem} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Basket Items */}
            {basket.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Your Nutrition Basket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {basket.map((item) => {
                    const itemData = nutritionItems.find((i) => i.id === item.itemId);
                    if (!itemData) return null;
                    return (
                      <div key={item.itemId} className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{itemData.name}</p>
                          <p className="text-sm text-muted-foreground">{item.quantity}g</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.itemId, -50)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.itemId, 50)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => removeItem(item.itemId)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Nutrition Totals */}
            <Card className="shadow-soft-lg border-2 border-brand-green/20">
              <CardHeader>
                <CardTitle>Nutritional Summary</CardTitle>
                <CardDescription>Total values for your nutrition basket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-2xl font-bold text-brand-green">{totals.calories.toFixed(0)} kcal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-2xl font-bold text-brand-green">{totals.protein.toFixed(1)}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="text-2xl font-bold text-brand-green">{totals.carbs.toFixed(1)}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="text-2xl font-bold text-brand-green">{totals.fat.toFixed(1)}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
