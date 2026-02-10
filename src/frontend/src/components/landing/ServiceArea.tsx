import { MapPin, TrendingUp } from 'lucide-react';
import Container from '../layout/Container';
import { Card, CardContent } from '@/components/ui/card';

export default function ServiceArea() {
  return (
    <section id="service-area" className="section-spacing">
      <Container>
        <div className="text-center space-y-4 mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Where We Serve
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Bringing fresh, quality products to your neighborhood
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          <Card className="border-brand-green/30 bg-gradient-to-br from-brand-green/5 to-transparent hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center shadow-soft">
                <MapPin className="w-7 h-7 text-brand-green" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold">Currently Serving</h3>
                <p className="text-2xl md:text-3xl font-bold text-brand-green">Chennai</p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We're proud to serve the vibrant city of Chennai with fresh, quality products delivered to your doorstep.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-yellow/30 bg-gradient-to-br from-brand-yellow/5 to-transparent hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-yellow/10 flex items-center justify-center shadow-soft">
                <TrendingUp className="w-7 h-7 text-brand-yellow-dark" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold">Coming Soon</h3>
                <p className="text-2xl md:text-3xl font-bold text-brand-yellow-dark">Expanding to More Cities</p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We're growing! Stay tuned as we bring Farmgrew's fresh products to more cities across India.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}
