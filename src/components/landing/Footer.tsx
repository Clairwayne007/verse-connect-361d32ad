import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Threads icon component
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.133 1.37-2.789.812-.554 1.86-.861 3.12-.915.878-.038 1.705.009 2.502.14-.081-.79-.297-1.392-.643-1.776-.413-.46-1.069-.695-1.949-.695h-.054c-.684.014-1.523.2-2.088.783l-1.406-1.503c.973-.962 2.272-1.442 3.51-1.47 1.397-.032 2.566.362 3.379 1.14.906.868 1.383 2.163 1.418 3.85v.053c.018.397.018.767 0 1.12 1.216.652 2.18 1.633 2.677 2.783.745 1.72.711 4.636-1.525 6.823-1.916 1.875-4.232 2.697-7.508 2.717zm-.034-8.986c-.863.037-1.534.29-2.003.755-.45.446-.502.928-.49 1.143.029.516.273.963.687 1.257.48.343 1.165.502 1.929.461 1.846-.1 2.936-1.265 3.083-3.593-.685-.127-1.418-.172-2.206-.023z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Logo size="lg" />
            <div className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:team@iamverse.com" className="text-sm hover:text-foreground transition-colors">
                team@iamverse.com
              </a>
            </div>
            <div className="mt-2 flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                The Academi by Iamverse #5 Plot #0364-0389 – Al Quoz Industrial Area 1 – Dubai – UAE
              </span>
            </div>
            <div className="mt-6 flex gap-4">
              <SocialIcon href="https://x.com/Iamverse_" icon={XIcon} label="X (Twitter)" />
              <SocialIcon href="https://www.instagram.com/academibyiamverse" icon={Instagram} label="Instagram" />
              <SocialIcon href="https://www.threads.com/@academibyiamverse" icon={ThreadsIcon} label="Threads" />
              <SocialIcon href="https://www.linkedin.com/company/iamverse/" icon={Linkedin} label="LinkedIn" />
            </div>
          </div>

          <FooterColumn
            title="LINKS"
            links={[
              { label: "About", href: "#about" },
              { label: "Discover", href: "#discover" },
            ]}
          />

          <FooterColumn
            title="SUPPORT"
            links={[
              { label: "Information", href: "#information" },
              { label: "Contact Us", href: "mailto:team@iamverse.com" },
            ]}
          />

          <FooterColumn
            title="COMPANY"
            links={[
              { label: "About Us", href: "#about" },
              { label: "Contact Us", href: "mailto:team@iamverse.com" },
            ]}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            2022 Copyright | Iamverse
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface SocialIconProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const SocialIcon = ({ href, icon: Icon, label }: SocialIconProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
  >
    <Icon className="h-4 w-4" />
  </a>
);

interface FooterLink {
  label: string;
  href: string;
}

const FooterColumn = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div>
    <h4 className="font-semibold mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
