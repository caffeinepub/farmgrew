import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Container from '../layout/Container';
import { navigate } from '@/router/navigation';

export default function Hero() {
  const scrollToRecommendations = () => {
    const element = document.getElementById('recommendations');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopNow = () => {
    navigate('/shop');
  };

  return (
    <section className="relative section-spacing overflow-hidden bg-gradient-to-br from-brand-green/5 via-background to-brand-yellow/5">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <Badge className="bg-brand-green text-white text-base px-4 py-2 w-fit">
                🌱 Pure Vegetarian
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground">
                Fresh, Pre-Cut & Ready to Cook
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Premium quality <span className="text-brand-green font-semibold">pure vegetarian</span> fresh cut fruits, prepped vegetables, batter, and podis delivered to your doorstep in Chennai.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-base md:text-lg px-8 py-6 shadow-soft-lg hover:shadow-glow-green transition-all duration-300"
                onClick={handleShopNow}
              >
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 py-6 shadow-soft hover:shadow-soft-lg transition-all duration-300"
                onClick={scrollToRecommendations}
              >
                Get Personalized Recommendations
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 py-6 shadow-soft hover:shadow-soft-lg transition-all duration-300"
                onClick={scrollToAbout}
              >
                Learn More
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <span className="text-sm text-muted-foreground">Fresh Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <span className="text-sm text-muted-foreground">Hygienic Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-green" />
                <span className="text-sm text-muted-foreground">100% Vegetarian</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in animation-delay-200">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src="/assets/generated/farmgrew-hero-illustration-v3.dim_1600x900.png"
                alt="Fresh vegetables and fruits"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/10 via-transparent to-brand-yellow/10 pointer-events-none" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-card border-2 border-brand-green/20 rounded-2xl p-4 shadow-soft-lg animate-scale-in animation-delay-400">
              <p className="text-sm font-medium text-muted-foreground">Serving Chennai</p>
              <p className="text-2xl font-bold text-brand-green">Fresh Daily</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
