import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, ArrowRight, Sparkles } from 'lucide-react';
import Container from '../layout/Container';
import { navigate } from '../../router/navigation';

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative section-spacing bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-2 text-sm font-medium">
              <Leaf className="h-4 w-4 mr-2" />
              100% Pure Vegetarian
            </Badge>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Fresh Vegetables
                <span className="block text-primary mt-2">Delivered Daily</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Pre-cut, fresh vegetables and fruits delivered to your doorstep in Chennai. 
                Save time, eat healthy, live better.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/shop')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection('recommendations')}
                className="border-2 font-semibold px-8 py-6 text-lg rounded-lg hover:bg-accent hover:border-accent transition-all duration-200"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Personalized Recommendations
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/farmgrew-hero-illustration-v3.dim_1600x900.png"
                alt="Fresh vegetables and fruits"
                className="w-full h-auto"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </Container>
    </section>
  );
}
