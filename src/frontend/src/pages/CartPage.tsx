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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Trash2, ShoppingBag, Minus, Plus, AlertCircle, CreditCard, Banknote } from 'lucide-react';
import { getProductImageUrl, getProductImageFallback } from '../lib/productImage';
import { PaymentMethod, type ShoppingItem } from '../backend';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cod'>('cod');

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
      if (selectedPaymentMethod === 'stripe') {
        if (!isStripeConfigured) {
          setPaymentError('Stripe payment is not configured. Please select Cash on Delivery or contact the administrator.');
          setIsProcessingPayment(false);
          return;
        }

        const orderId = await placeOrder.mutateAsync({
          paymentMethod: PaymentMethod.stripe,
          pickupTime: null,
        });

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

        const session = await createCheckoutSession.mutateAsync({
          items: shoppingItems,
          orderId: orderId.toString(),
        });

        if (!session?.url) {
          throw new Error('Stripe session missing url');
        }

        window.location.href = session.url;
      } else {
        const orderId = await placeOrder.mutateAsync({
          paymentMethod: PaymentMethod.cashOnDelivery,
          pickupTime: null,
        });

        setIsProcessingPayment(false);
        navigate(`/orders/${orderId}`);
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setPaymentError(error.message || 'Failed to place order. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (cartLoading || stripeConfigLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <h1 className="mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <Card className="rounded-lg shadow-soft">
              <CardContent className="py-16 text-center space-y-6">
                <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto" />
                <h2>Your cart is empty</h2>
                <p className="text-muted-foreground text-lg">
                  Add some products to get started
                </p>
                <Button onClick={() => navigate('/shop')} size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(([productId, quantity]) => {
                  const product = getProductDetails(productId);
                  if (!product) return null;

                  return (
                    <Card key={productId.toString()} className="rounded-lg shadow-soft hover:shadow-soft-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <img
                            src={getProductImageUrl(product.name)}
                            alt={product.name}
                            className="w-28 h-28 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = getProductImageFallback();
                            }}
                          />
                          <div className="flex-1 space-y-3">
                            <h3 className="font-semibold text-xl text-foreground">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{(Number(product.priceCents) / 100).toFixed(2)} per unit
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(productId, Number(quantity) - 1)}
                                  disabled={updateCartItem.isPending}
                                  className="h-10 w-10 p-0 rounded-l-lg"
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
                                  className="h-10 w-20 text-center border-0 focus-visible:ring-0"
                                  min="1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(productId, Number(quantity) + 1)}
                                  disabled={updateCartItem.isPending}
                                  className="h-10 w-10 p-0 rounded-r-lg"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(productId)}
                                disabled={removeFromCart.isPending}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-2xl text-primary">
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
                <Card className="sticky top-24 rounded-lg shadow-soft-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {paymentError && (
                      <Alert variant="destructive" className="rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{paymentError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Payment Method</Label>
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={(value) => setSelectedPaymentMethod(value as 'stripe' | 'cod')}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                            <Banknote className="h-6 w-6 text-primary" />
                            <div>
                              <div className="font-semibold">Cash on Delivery</div>
                              <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                          <RadioGroupItem value="stripe" id="stripe" disabled={!isStripeConfigured} />
                          <Label htmlFor="stripe" className="flex items-center gap-3 cursor-pointer flex-1">
                            <CreditCard className="h-6 w-6 text-primary" />
                            <div>
                              <div className="font-semibold">Credit/Debit Card</div>
                              <div className="text-sm text-muted-foreground">
                                {isStripeConfigured ? 'Pay securely with Stripe' : 'Currently unavailable'}
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{(calculateTotal() / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-2xl pt-3 border-t">
                        <span>Total</span>
                        <span className="text-primary">₹{(calculateTotal() / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessingPayment}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-lg"
                      size="lg"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : selectedPaymentMethod === 'cod' ? (
                        'Place Order'
                      ) : (
                        'Proceed to Payment'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/shop')}
                      className="w-full font-medium py-6 text-base rounded-lg"
                      size="lg"
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
