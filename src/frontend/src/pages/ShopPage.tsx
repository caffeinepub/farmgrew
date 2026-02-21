import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import CategoryFilter from '../components/shop/CategoryFilter';
import ProductCard from '../components/shop/ProductCard';
import { Loader2, RefreshCw, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigate } from '../router/navigation';

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'Cut Veggies & Salads', label: 'Cut Vegetables' },
  { id: 'Cut Fruits', label: 'Cut Fruits' },
  { id: 'Batter', label: 'Batter' },
  { id: 'Kitchen Needs', label: 'Kitchen Needs' },
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: products, isLoading, error, refetch, isRefetching } = useProducts(
    selectedCategory === 'all' ? null : selectedCategory
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <div className="mb-8 space-y-4">
            <h1>Shop Fresh Products</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Browse our selection of fresh cut vegetables, fruits, batter, and kitchen essentials
            </p>
          </div>

          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive text-lg">Failed to load products. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && products && products.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto space-y-6">
                <Package className="h-20 w-20 text-muted-foreground mx-auto" />
                <h2>No Products Available</h2>
                <p className="text-muted-foreground text-lg">
                  There are currently no products in the catalog.
                </p>
                <p className="text-muted-foreground">
                  If you're an admin, please visit the Admin Dashboard to add products.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    {isRefetching ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5" />
                        Refresh Products
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('/admin')}
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Go to Admin Dashboard
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && products && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
