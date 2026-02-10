import { Heart, Dumbbell, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Container from '../layout/Container';
import { dietPlans } from '@/lib/dietPlans';

interface DietPlansSectionProps {
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

const planIcons = {
  balanced: Heart,
  'high-protein': Dumbbell,
  'low-sugar': Leaf,
};

export default function DietPlansSection({ selectedPlan, onSelectPlan }: DietPlansSectionProps) {
  return (
    <section id="diet-plans" className="section-spacing bg-background">
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Pure Vegetarian Diet Plans
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose a pure vegetarian diet plan tailored to your lifestyle. Each plan comes with personalized recommendations and nutrition guidance to help you achieve your health goals.
            </p>
          </div>

          {/* Image */}
          <div className="max-w-md mx-auto animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src="/assets/generated/icon-diet-plans-v3.dim_1024x1024.png"
                alt="Diet Plans"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/10 via-transparent to-brand-yellow/10 pointer-events-none" />
            </div>
          </div>

          {/* Diet Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {dietPlans.map((plan) => {
              const Icon = planIcons[plan.id as keyof typeof planIcons];
              const isSelected = selectedPlan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`shadow-soft hover:shadow-soft-lg transition-all duration-300 ${
                    isSelected ? 'border-2 border-brand-green ring-2 ring-brand-green/20' : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-8 h-8 text-brand-green" />
                      {isSelected && (
                        <Badge variant="default" className="bg-brand-green">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Benefits:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-brand-green mt-0.5">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Focus Areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.focusAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant={isSelected ? 'outline' : 'default'}
                      onClick={() => onSelectPlan(plan.id)}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
