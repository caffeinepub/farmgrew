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

  return (
    <footer className="border-t border-border/40 bg-muted/30">
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
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
                >
                  AI Recommendations
                </button>
                <button
                  onClick={() => scrollToSection('nutrition')}
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
                >
                  Nutrition Calculator
                </button>
                <button
                  onClick={() => scrollToSection('diet-plans')}
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
                >
                  Diet Plans
                </button>
                <button
                  onClick={() => scrollToSection('service-area')}
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
                >
                  Service Area
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md w-fit"
                >
                  About Us
                </button>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h4 className="font-semibold text-foreground text-lg">Get in Touch</h4>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Currently serving Chennai with plans to expand across India.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5 flex-wrap justify-center">
              © {currentYear}. Built with <Heart className="w-4 h-4 text-red-500 fill-red-500 inline-block" /> using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline underline-offset-4 decoration-muted-foreground hover:decoration-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-center md:text-right font-medium">
              Owned by GUGAS i-tech India LLP.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
