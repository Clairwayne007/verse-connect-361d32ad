import { TrendingUp, Shield, Clock, Users } from "lucide-react";

export const Discover = () => {
  return (
    <section id="discover" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Discover Our Platform</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn why thousands of investors trust IAMVERSE for their cryptocurrency investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={TrendingUp}
            title="High Returns"
            description="Earn competitive daily ROI on your investments with our tiered plan structure."
          />
          <FeatureCard
            icon={Shield}
            title="Secure Platform"
            description="Your funds are protected with industry-leading security measures and encryption."
          />
          <FeatureCard
            icon={Clock}
            title="24/7 Access"
            description="Monitor your investments and earnings anytime, anywhere through our platform."
          />
          <FeatureCard
            icon={Users}
            title="Expert Support"
            description="Our dedicated team is available to assist you with any questions or concerns."
          />
        </div>

        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">60,000+</p>
              <p className="text-muted-foreground">Active Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">$100M+</p>
              <p className="text-muted-foreground">Total Invested</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-muted-foreground">Uptime Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
