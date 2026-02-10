import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { usePathname } from './router/usePathname';
import LandingPage from './sections/LandingPage';
import ShopPage from './pages/ShopPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminPage from './pages/AdminPage';
import RequireAuth from './components/auth/RequireAuth';
import RequireRegistration from './components/auth/RequireRegistration';
import RequireAdmin from './components/auth/RequireAdmin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRouter() {
  const pathname = usePathname();

  // Parse order ID from /orders/:id
  const orderIdMatch = pathname.match(/^\/orders\/(\d+)$/);
  const orderId = orderIdMatch ? orderIdMatch[1] : null;

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

  if (pathname === '/orders' && !orderId) {
    return (
      <RequireAuth>
        <RequireRegistration>
          <OrdersPage />
        </RequireRegistration>
      </RequireAuth>
    );
  }

  if (orderId) {
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
      <RequireAuth>
        <RequireAdmin>
          <AdminPage />
        </RequireAdmin>
      </RequireAuth>
    );
  }

  // Default route
  return <LandingPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <AppRouter />
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}

export default App;
