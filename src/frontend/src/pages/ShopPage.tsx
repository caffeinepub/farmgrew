import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import TopNav from '../components/landing/TopNav';
import Footer from '../components/landing/Footer';
import Container from '../components/layout/Container';
import CategoryFilter from '../components/shop/CategoryFilter';
import ProductCard from '../components/shop/ProductCard';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 section-spacing-sm">
        <Container>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Fresh Products</h1>
            <p className="text-lg text-muted-foreground">
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
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">Failed to load products. Please try again.</p>
            </div>
          )}

          {!isLoading && !error && products && products.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground text-lg mb-4">
                  No products are currently available. The catalog may not be seeded yet.
                </p>
                <p className="text-muted-foreground mb-6">
                  Please try again later or refresh to check for updates.
                </p>
                <Button
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  variant="outline"
                  className="gap-2"
                >
                  {isRefetching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh Products
                    </>
                  )}
                </Button>
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
