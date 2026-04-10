export const About = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About IAMVERSE</h2>
          <p className="text-lg text-muted-foreground mb-8">
            IAMVERSE is a global investment platform dedicated to empowering individuals to achieve financial freedom through strategic cryptocurrency investments. Our mission is to make high-yield investment opportunities accessible to everyone.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-muted-foreground">
                To democratize access to wealth-building opportunities through innovative investment solutions.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where everyone has the tools and knowledge to achieve financial independence.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="text-xl font-semibold mb-2">Our Values</h3>
              <p className="text-muted-foreground">
                Transparency, security, and commitment to our investors' success drive everything we do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
