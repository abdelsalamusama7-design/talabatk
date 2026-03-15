import { Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-6 px-4 mb-16" dir="rtl">
      <div className="max-w-lg mx-auto text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">
          تنفيذ وتصميم Insta-Tech Labs
        </p>
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <a href="tel:01227080430" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" /> 01227080430
          </a>
          <span>/</span>
          <a href="tel:01554400044" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" /> 01554400044
          </a>
        </div>
        <p className="text-[11px] text-muted-foreground">
          © 2026 Insta-Tech Labs. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
