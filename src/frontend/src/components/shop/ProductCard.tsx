import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAddToCart } from '../../hooks/useCart';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { navigate } from '../../router/navigation';
import { getProductImageUrl, getProductImageFallback } from '../../lib/productImage';
import type { Product } from '../../backend';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const getImageUrl = () => {
    if (product.image && !imageError) {
      return product.image.getDirectURL();
    }
    return getProductImageUrl(product.name);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full rounded-lg border">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              if (!imageError) {
                setImageError(true);
                e.currentTarget.src = getProductImageFallback();
              }
            }}
          />
          <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground backdrop-blur-sm">
            {product.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6 space-y-3">
        <h3 className="text-xl font-semibold text-foreground line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <p className="text-2xl font-bold text-primary">
          ₹{(Number(product.priceCents) / 100).toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={addToCart.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg transition-all duration-200"
          size="lg"
        >
          {addToCart.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
