import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
      
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in">
            Transform Your Financial Future with{" "}
            <span className="text-gradient">IAMVERSE</span>
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Discover powerful investment opportunities with our secure cryptocurrency platform. 
            Start your journey to financial freedom today.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Start Investing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Login to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <FeatureCard
              icon={TrendingUp}
              title="High Returns"
              description="Up to 60% ROI on your investments"
            />
            <FeatureCard
              icon={Shield}
              title="Secure Platform"
              description="Advanced encryption & protection"
            />
            <FeatureCard
              icon={Zap}
              title="Fast Payouts"
              description="Quick and reliable withdrawals"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  </div>
);