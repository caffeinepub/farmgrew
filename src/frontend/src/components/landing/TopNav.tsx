import { useState } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Container from '../layout/Container';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCustomerProfile } from '../../hooks/useCustomer';
import { useCart } from '../../hooks/useCart';
import { navigate, isActiveRoute } from '../../router/navigation';
import { usePathname } from '../../router/usePathname';

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { identity } = useInternetIdentity();
  const { data: profile } = useCustomerProfile();
  const { data: cart } = useCart();

  const cartItemCount = cart?.items.reduce((sum, [, qty]) => sum + Number(qty), 0) || 0;

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const landingLinks = [
    { label: 'AI Recommendations', id: 'recommendations' },
    { label: 'Nutrition Calculator', id: 'nutrition' },
    { label: 'Diet Plans', id: 'diet-plans' },
    { label: 'Service Area', id: 'service-area' },
    { label: 'About', id: 'about' },
  ];

  const shopLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Cart', path: '/cart' },
    { label: 'Orders', path: '/orders' },
    { label: 'Admin', path: '/admin' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <Container>
        <nav className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-transform hover:scale-105"
            aria-label="Farmgrew home"
          >
            <img
              src="/assets/generated/farmgrew-logo-v3.dim_512x256.png"
              alt="Farmgrew"
              className="h-10 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {shopLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-4 py-2 ${
                  isActiveRoute(pathname, link.path)
                    ? 'text-foreground bg-muted'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
                {link.path === '/cart' && cartItemCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </button>
            ))}
            {pathname === '/' &&
              landingLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-4 py-2"
                >
                  {link.label}
                </button>
              ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            {identity && profile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate('/register')}
              >
                {profile.name}
              </Button>
            )}
            <LoginButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border/40 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {shopLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNavigate(link.path)}
                  className={`text-base font-medium transition-all duration-200 text-left px-4 py-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActiveRoute(pathname, link.path)
                      ? 'text-foreground bg-muted'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                  {link.path === '/cart' && cartItemCount > 0 && ` (${cartItemCount})`}
                </button>
              ))}
              {pathname === '/' &&
                landingLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-base font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all duration-200 text-left px-4 py-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {link.label}
                  </button>
                ))}
              <div className="pt-4 space-y-2">
                {identity && profile && (
                  <Button
                    variant="outline"
                    onClick={() => handleNavigate('/register')}
                    className="w-full justify-start"
                  >
                    {profile.name}
                  </Button>
                )}
                <div className="px-4">
                  <LoginButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
