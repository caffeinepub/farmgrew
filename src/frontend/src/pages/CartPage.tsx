import { useCart, useRemoveFromCart, useUpdateCartItem } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { usePlaceOrder } from '../hooks/useOrders';
import { useIsStripeConfigured, useCreateCheckoutSession } from '../hooks/useStripe';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Trash2, ShoppingBag, Minus, Plus, AlertCircle } from 'lucide-react';
import { getProductImageUrl, getProductImageFallback } from '../lib/productImage';
import type { ShoppingItem } from '../backend';
import { useState } from 'react';

export default function CartPage() {
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: allProducts } = useProducts();
  const { data: isStripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const placeOrder = usePlaceOrder();
  const createCheckoutSession = useCreateCheckoutSession();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const handleCheckout = async () => {
    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      // Check if Stripe is configured
      if (!isStripeConfigured) {
        setPaymentError('Payment system is not configured. Please contact the administrator.');
        setIsProcessingPayment(false);
        return;
      }

      // Place the order first to get orderId
      const orderId = await placeOrder.mutateAsync(null);

      // Build shopping items for Stripe
      const shoppingItems: ShoppingItem[] = cartItems.map(([productId, quantity]) => {
        const product = getProductDetails(productId);
        if (!product) throw new Error('Product not found');

        return {
          productName: product.name,
          productDescription: product.description,
          priceInCents: product.priceCents,
          quantity,
          currency: 'inr',
        };
      });

      // Create Stripe checkout session
      const session = await createCheckoutSession.mutateAsync({
        items: shoppingItems,
        orderId: orderId.toString(),
      });

      // Validate session URL
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      // Redirect to Stripe checkout (do NOT use router navigation)
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setPaymentError(error.message || 'Failed to start checkout. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (cartLoading || stripeConfigLoading) {
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
                    {paymentError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Alert>
                    )}

                    {!isStripeConfigured && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment Unavailable</AlertTitle>
                        <AlertDescription>
                          Payment system is not configured. Please contact support.
                        </AlertDescription>
                      </Alert>
                    )}

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
                      onClick={handleCheckout}
                      disabled={isProcessingPayment || !isStripeConfigured}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting Payment...
                        </>
                      ) : (
                        'Proceed to Payment'
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
