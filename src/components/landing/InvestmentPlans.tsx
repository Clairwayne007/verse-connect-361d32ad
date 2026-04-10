import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export interface InvestmentPlan {
  id: string;
  name: string;
  amount: number;
  roi: number;
  duration: string;
  durationDays: number;
  features: string[];
}

export const investmentPlans: InvestmentPlan[] = [
  {
    id: "plan-108",
    name: "108 Circle",
    amount: 100,
    roi: 25,
    duration: "14 Days",
    durationDays: 14,
    features: ["25% Total ROI", "~1.79% Daily", "Secure Investment", "24/7 Support"],
  },
  {
    id: "plan-2222",
    name: "2222 Investment",
    amount: 2000,
    roi: 35,
    duration: "14 Days",
    durationDays: 14,
    features: ["35% Total ROI", "~2.5% Daily", "Priority Support", "Advanced Analytics"],
  },
  {
    id: "plan-8888",
    name: "8888 Investment",
    amount: 8000,
    roi: 45,
    duration: "14 Days",
    durationDays: 14,
    features: ["45% Total ROI", "~3.21% Daily", "VIP Support", "Premium Features"],
  },
  {
    id: "plan-tier3",
    name: "Tier 3 Investment",
    amount: 15000,
    roi: 55,
    duration: "14 Days",
    durationDays: 14,
    features: ["55% Total ROI", "~3.93% Daily", "Dedicated Manager", "Exclusive Access"],
  },
  {
    id: "plan-elite",
    name: "Bitcoin Elite Group",
    amount: 20000,
    roi: 60,
    duration: "14 Days",
    durationDays: 14,
    features: ["60% Total ROI", "~4.29% Daily", "Elite VIP Support", "Priority Withdrawals"],
  },
];

export const InvestmentPlans = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Investment Plans</h2>
          <p className="text-muted-foreground mt-2">
            Choose the plan that fits your investment goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {investmentPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PlanCard = ({ plan }: { plan: InvestmentPlan }) => (
  <Card className="relative overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg">
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/70" />
    
    <CardHeader className="text-center pb-2">
      <CardTitle className="text-lg">{plan.name}</CardTitle>
      <div className="mt-4 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        {plan.roi}% ROI in {plan.durationDays} Days
      </div>
      <p className="text-xs text-muted-foreground mt-1">Min. ${plan.amount.toLocaleString()}</p>
    </CardHeader>

    <CardContent className="pt-4">
      <div className="text-center text-sm text-muted-foreground mb-4">
        Duration: {plan.duration}
      </div>
      
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Link to="/register">
        <Button className="w-full">Invest Now</Button>
      </Link>
    </CardContent>
  </Card>
);
