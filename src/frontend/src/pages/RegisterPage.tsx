import { useState } from 'react';
import { useCustomerProfile, useRegisterCustomer } from '../hooks/useCustomer';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { data: profile, isLoading: profileLoading } = useCustomerProfile();
  const registerMutation = useRegisterCustomer();

  const [name, setName] = useState(profile?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [pickupAddress, setPickupAddress] = useState(profile?.pickupAddress || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync({ name, phoneNumber, pickupAddress });
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  if (profileLoading) {
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

  if (registerMutation.isSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 flex items-center justify-center py-12">
          <Container>
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Registration Complete!</CardTitle>
                  <CardDescription>
                    Your profile has been saved successfully
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => navigate('/shop')} className="w-full">
                    Start Shopping
                  </Button>
                  <Button onClick={() => navigate('/cart')} variant="outline" className="w-full">
                    View Cart
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Container>
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
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{profile ? 'Update Profile' : 'Complete Registration'}</CardTitle>
                <CardDescription>
                  {profile
                    ? 'Update your contact and pickup information'
                    : 'Please provide your details to start ordering'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Pickup Address *</Label>
                    <Textarea
                      id="address"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter your pickup address"
                      rows={4}
                      required
                    />
                  </div>

                  {registerMutation.isError && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                      {registerMutation.error?.message || 'Failed to save profile. Please try again.'}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="flex-1"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/shop')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
