import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import Container from '../layout/Container';
import { goals, dietaryPreferences, getRecommendations } from '@/lib/recommendationsData';
import type { Goal, DietaryPreference } from '@/lib/recommendationsData';

interface RecommendationsSectionProps {
  selectedPlan: string | null;
}

export default function RecommendationsSection({ selectedPlan }: RecommendationsSectionProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal>('balanced');
  const [selectedPreferences, setSelectedPreferences] = useState<DietaryPreference[]>(['vegetarian']);

  useEffect(() => {
    if (selectedPlan) {
      // Update goal based on selected diet plan
      if (selectedPlan === 'high-protein') {
        setSelectedGoal('muscle-gain');
        setSelectedPreferences(['vegetarian', 'high-protein']);
      } else if (selectedPlan === 'low-sugar') {
        setSelectedGoal('weight-loss');
        setSelectedPreferences(['vegetarian', 'low-sugar']);
      } else if (selectedPlan === 'balanced') {
        setSelectedGoal('balanced');
        setSelectedPreferences(['vegetarian']);
      }
    }
  }, [selectedPlan]);

  const togglePreference = (pref: DietaryPreference) => {
    // Always keep vegetarian selected
    if (pref === 'vegetarian') return;
    
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const recommendations = getRecommendations(selectedGoal, selectedPreferences);

  return (
    <section id="recommendations" className="section-spacing bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-brand-green" />
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  AI-Powered Recommendations
                </h2>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground">
                Get personalized pure vegetarian product suggestions based on your health goals and dietary preferences. Our AI analyzes your needs to recommend the perfect combination of fresh produce.
              </p>
            </div>

            {/* Image */}
            <div className="animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden shadow-soft-lg">
                <img
                  src="/assets/generated/icon-ai-recommendations-v3.dim_1024x1024.png"
                  alt="AI Recommendations"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/10 via-transparent to-brand-yellow/10 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interactive Section */}
          <div className="space-y-6">
            {/* Goal Selection */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Select Your Health Goal</CardTitle>
                <CardDescription>Choose what you want to achieve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {goals.map((goal) => (
                    <Button
                      key={goal.id}
                      variant={selectedGoal === goal.id ? 'default' : 'outline'}
                      className="h-auto py-4 px-4 text-left justify-start"
                      onClick={() => setSelectedGoal(goal.id)}
                    >
                      <span className="text-sm font-medium">{goal.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Customize your recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dietaryPreferences.map((pref) => (
                    <div key={pref.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={pref.id}
                        checked={selectedPreferences.includes(pref.id)}
                        onCheckedChange={() => togglePreference(pref.id)}
                        disabled={pref.id === 'vegetarian'}
                      />
                      <label
                        htmlFor={pref.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {pref.label}
                        {pref.id === 'vegetarian' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Always Active
                          </Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-soft-lg border-2 border-brand-green/20">
              <CardHeader>
                <CardTitle>Your Personalized Recommendations</CardTitle>
                <CardDescription>Pure vegetarian products tailored for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg space-y-2 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-foreground">{rec.item}</h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {rec.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
