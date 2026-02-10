import { useState } from 'react';
import { useAddToCart } from '../../hooks/useCart';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { navigate } from '../../router/navigation';
import type { Product } from '../../backend';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { getProductImageUrl, getProductImageFallback } from '../../lib/productImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!identity) {
      navigate('/register');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      alert(error.message || 'Failed to add to cart');
    }
  };

  // Determine which image source to use based on fallback chain
  const getImageSrc = () => {
    // 1. Try backend-stored image if available
    if (product.image && !imageError) {
      return product.image.getDirectURL();
    }
    // 2. Fall back to local name-based resolver if backend image failed or missing
    if (!imageError) {
      return getProductImageUrl(product.name);
    }
    // 3. Final fallback to SVG placeholder
    return getProductImageFallback();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
          <img
            src={getImageSrc()}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-primary">
            ₹{(Number(product.priceCents) / 100).toFixed(2)}
          </p>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          size="sm"
          className="gap-2"
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
