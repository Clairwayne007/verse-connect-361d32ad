import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavItem label="ABOUT" onClick={() => scrollToSection("about")} />
          <NavItem label="DISCOVER" onClick={() => scrollToSection("discover")} />
          <NavItem label="INFORMATION" onClick={() => scrollToSection("information")} />
          <NavItem label="REVIEWS" onClick={() => scrollToSection("reviews")} />
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  label: string;
  onClick: () => void;
}

const NavItem = ({ label, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    {label}
  </button>
);
