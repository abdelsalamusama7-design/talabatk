import { Phone, Facebook, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const Footer = () => {
  const { t, dir } = useLang();

  return (
    <footer className="bg-card border-t border-border py-6 px-4 mb-16" dir={dir}>
      <div className="max-w-lg mx-auto text-center space-y-3">
        <a
          href="https://www.facebook.com/share/1GDrQ7sQp4/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {t("footer.designBy")} Insta-Tech Labs
          <ExternalLink className="h-3 w-3" />
        </a>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <a href="tel:01227080430" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" /> 01227080430
          </a>
          <span>/</span>
          <a href="tel:01554400044" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" /> 01554400044
          </a>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <a
            href="https://www.facebook.com/share/1GDrQ7sQp4/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Facebook className="h-3.5 w-3.5" /> Facebook
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground">
          © 2026 <a href="https://www.facebook.com/share/1GDrQ7sQp4/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Insta-Tech Labs</a>. {t("footer.rights")}.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
