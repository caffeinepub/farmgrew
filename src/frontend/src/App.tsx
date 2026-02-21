import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from './router/usePathname';
import LandingPage from './sections/LandingPage';
import ShopPage from './pages/ShopPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminPage from './pages/AdminPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import KOTPage from './pages/KOTPage';
import RequireAuth from './components/auth/RequireAuth';
import RequireRegistration from './components/auth/RequireRegistration';
import RequireAdmin from './components/auth/RequireAdmin';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <LandingPage />;
  }

  if (pathname === '/shop') {
    return <ShopPage />;
  }

  if (pathname === '/register') {
    return (
      <RequireAuth>
        <RegisterPage />
      </RequireAuth>
    );
  }

  if (pathname === '/cart') {
    return (
      <RequireAuth>
        <RequireRegistration>
          <CartPage />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  if (pathname === '/orders') {
    return (
      <RequireAuth>
        <RequireRegistration>
          <OrdersPage />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  if (pathname.startsWith('/orders/')) {
    const orderId = pathname.replace('/orders/', '');
    return (
      <RequireAuth>
        <RequireRegistration>
          <OrderDetailsPage orderId={orderId} />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  if (pathname === '/admin') {
    return (
      <RequireAdmin>
        <AdminPage />
      </RequireAdmin>
    );
  }

  if (pathname.startsWith('/admin/kot/')) {
    return (
      <RequireAdmin>
        <KOTPage />
      </RequireAdmin>
    );
  }

  if (pathname === '/payment-success') {
    return (
      <RequireAuth>
        <RequireRegistration>
          <PaymentSuccessPage />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  if (pathname === '/payment-failure') {
    return (
      <RequireAuth>
        <RequireRegistration>
          <PaymentFailurePage />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}
