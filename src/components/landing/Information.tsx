import { Mail, MapPin, Phone } from "lucide-react";

export const Information = () => {
  return (
    <section id="information" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <a href="mailto:team@iamverse.com" className="text-primary hover:underline">
              team@iamverse.com
            </a>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Our Location</h3>
            <p className="text-muted-foreground text-sm">
              The Academi by Iamverse #5<br />
              Plot #0364-0389<br />
              Al Quoz Industrial Area 1<br />
              Dubai, UAE
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Support Hours</h3>
            <p className="text-muted-foreground text-sm">
              Monday - Friday<br />
              9:00 AM - 6:00 PM GST
            </p>
          </div>
        </div>

        <div className="mt-12 p-8 rounded-xl bg-card border border-border max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">How do I start investing?</h4>
              <p className="text-sm text-muted-foreground">
                Register an account, deposit funds via cryptocurrency, and choose an investment plan that suits your goals.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What cryptocurrencies do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, and more.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">How are returns calculated?</h4>
              <p className="text-sm text-muted-foreground">
                Returns are calculated daily based on your chosen investment plan's ROI percentage and added to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
