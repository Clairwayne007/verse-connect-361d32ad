import { cn } from "@/lib/utils";
import logoImage from "@/assets/iamverse-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ className, size = "md", showText = true }: LogoProps) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div className={cn("flex items-center", showText && "gap-2", className)}>
      <img 
        src={logoImage} 
        alt="IAMVERSE" 
        className={cn("object-contain", sizes[size])}
      />
      {showText && (
        <span className="font-bold text-foreground">
          IAMVERSE<span className="text-primary">.com</span>
        </span>
      )}
    </div>
  );
};
