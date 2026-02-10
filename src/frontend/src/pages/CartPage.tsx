import { useCart, useRemoveFromCart, useUpdateCartItem } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { usePlaceOrder } from '../hooks/useOrders';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { getProductImageUrl, getProductImageFallback } from '../lib/productImage';

export default function CartPage() {
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: allProducts } = useProducts();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const placeOrder = usePlaceOrder();

  const cartItems = cart?.items || [];

  const getProductDetails = (productId: bigint) => {
    return allProducts?.find((p) => p.id === productId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, [productId, quantity]) => {
      const product = getProductDetails(productId);
      if (!product) return total;
      return total + Number(product.priceCents) * Number(quantity);
    }, 0);
  };

  const handleQuantityChange = async (productId: bigint, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderId = await placeOrder.mutateAsync(null);
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      console.error('Failed to place order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some products to get started
                </p>
                <Button onClick={() => navigate('/shop')}>Browse Products</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(([productId, quantity]) => {
                  const product = getProductDetails(productId);
                  if (!product) return null;

                  return (
                    <Card key={productId.toString()}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={getProductImageUrl(product.name)}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = getProductImageFallback();
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              ₹{(Number(product.priceCents) / 100).toFixed(2)} per unit
                            </p>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(productId, Number(quantity) - 1)}
                                  disabled={updateCartItem.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                  type="number"
                                  value={Number(quantity)}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      handleQuantityChange(productId, val);
                                    }
                                  }}
                                  className="h-8 w-16 text-center border-0 focus-visible:ring-0"
                                  min="1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(productId, Number(quantity) + 1)}
                                  disabled={updateCartItem.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(productId)}
                                disabled={removeFromCart.isPending}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ₹{((Number(product.priceCents) * Number(quantity)) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{(calculateTotal() / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>₹{(calculateTotal() / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={placeOrder.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {placeOrder.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/shop')}
                      variant="outline"
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
