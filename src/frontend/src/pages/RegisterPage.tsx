import { useState } from 'react';
import { useCustomerProfile, useRegisterCustomer } from '../hooks/useCustomer';
import { navigate } from '../router/navigation';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, User } from 'lucide-react';

export default function RegisterPage() {
  const { data: profile, isLoading: profileLoading } = useCustomerProfile();
  const registerCustomer = useRegisterCustomer();

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phoneNumber: profile?.phoneNumber || '',
    pickupAddress: profile?.pickupAddress || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await registerCustomer.mutateAsync({
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        pickupAddress: formData.pickupAddress.trim(),
      });
      setShowSuccess(true);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save profile' });
    }
  };

  if (profileLoading) {
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
          <div className="max-w-2xl mx-auto">
            {showSuccess ? (
              <Card className="rounded-lg shadow-soft-lg">
                <CardContent className="py-16 text-center space-y-6">
                  <CheckCircle2 className="h-20 w-20 text-success mx-auto" />
                  <h2>Profile Saved Successfully!</h2>
                  <p className="text-muted-foreground text-lg">
                    Your profile has been updated. You can now start shopping.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => navigate('/shop')} size="lg" className="bg-primary hover:bg-primary/90">
                      Start Shopping
                    </Button>
                    <Button onClick={() => setShowSuccess(false)} variant="outline" size="lg">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-lg shadow-soft-lg">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">
                        {profile ? 'Update Profile' : 'Complete Your Profile'}
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        {profile
                          ? 'Update your personal information and delivery details'
                          : 'Please provide your details to continue shopping'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.submit && (
                      <Alert variant="destructive" className="rounded-lg">
                        <AlertDescription>{errors.submit}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12 text-base rounded-lg"
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-base font-semibold">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="Enter your 10-digit phone number"
                        className="h-12 text-base rounded-lg"
                      />
                      {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress" className="text-base font-semibold">
                        Pickup Address
                      </Label>
                      <Input
                        id="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                        placeholder="Enter your complete pickup address"
                        className="h-12 text-base rounded-lg"
                      />
                      {errors.pickupAddress && <p className="text-sm text-destructive">{errors.pickupAddress}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={registerCustomer.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg rounded-lg"
                      size="lg"
                    >
                      {registerCustomer.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
