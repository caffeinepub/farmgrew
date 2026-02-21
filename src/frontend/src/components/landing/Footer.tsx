import { Heart } from 'lucide-react';
import Container from '../layout/Container';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'farmgrew-app';

  return (
    <footer className="border-t bg-muted/30">
      <Container>
        <div className="py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-12 md:gap-16">
            {/* Brand */}
            <div className="space-y-5">
              <img
                src="/assets/generated/farmgrew-logo-v2.dim_512x256.png"
                alt="Farmgrew"
                className="h-10 w-auto"
              />
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
                Fresh, pre-cut fruits and vegetables delivered to your doorstep in Chennai.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground text-lg">Quick Links</h4>
              <nav className="flex flex-col space-y-3">
                <button
                  onClick={() => scrollToSection('recommendations')}
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  AI Recommendations
                </button>
                <button
                  onClick={() => scrollToSection('nutrition')}
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Nutrition Calculator
                </button>
                <button
                  onClick={() => scrollToSection('diet-plans')}
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Diet Plans
                </button>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground text-lg">Contact</h4>
              <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                <p>Chennai, Tamil Nadu</p>
                <p>India</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Farmgrew. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
