import { useState } from 'react';
import TopNav from '../components/landing/TopNav';
import Hero from '../components/landing/Hero';
import RecommendationsSection from '../components/landing/RecommendationsSection';
import NutritionCalculatorSection from '../components/landing/NutritionCalculatorSection';
import DietPlansSection from '../components/landing/DietPlansSection';
import ServiceArea from '../components/landing/ServiceArea';
import About from '../components/landing/About';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Hero />
        <RecommendationsSection selectedPlan={selectedPlan} />
        <NutritionCalculatorSection selectedPlan={selectedPlan} />
        <DietPlansSection selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
        <ServiceArea />
        <About />
      </main>
      <Footer />
    </div>
  );
}
