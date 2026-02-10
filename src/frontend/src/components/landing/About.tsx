import { Leaf, Clock, ShieldCheck } from 'lucide-react';
import Container from '../layout/Container';

export default function About() {
  const features = [
    {
      icon: Leaf,
      title: 'Fresh & Quality',
      description: 'Sourced daily from trusted farms and suppliers to ensure maximum freshness and quality.',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Pre-cut and ready to use vegetarian products that save you valuable time in the kitchen.',
    },
    {
      icon: ShieldCheck,
      title: 'Hygienic Processing',
      description: 'Processed in clean, sanitized facilities following strict quality and safety standards.',
    },
  ];

  return (
    <section id="about" className="section-spacing bg-muted/30">
      <Container>
        <div className="text-center space-y-4 mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Why Choose Farmgrew?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner for fresh, convenient, and quality pure vegetarian agri-commerce
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 lg:gap-16 mb-16 lg:mb-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="text-center space-y-5 group">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-green/10 via-brand-green/5 to-brand-yellow/10 flex items-center justify-center shadow-soft group-hover:shadow-soft-lg group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-10 h-10 text-brand-green" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 bg-card border border-border/50 rounded-3xl p-10 md:p-14 shadow-soft">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold">About Farmgrew</h3>
          <div className="space-y-6">
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              Farmgrew is an innovative online agri-commerce platform dedicated to bringing fresh, <span className="text-brand-green font-semibold">pure vegetarian</span> pre-cut fruits, chopped vegetables, and essential kitchen products directly to your home in Chennai. We understand the value of your time and the importance of quality, which is why we've created a seamless solution that combines convenience with freshness.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              From hand-cut seasonal fruits to freshly ground batter and authentic South Indian podis, every product is 100% vegetarian and prepared with care to meet the highest standards of quality and hygiene.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
