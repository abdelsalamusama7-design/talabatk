import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Truck, ShoppingBag, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type AccountType = "customer" | "driver";

const accountTypes: { type: AccountType; label: string; icon: typeof ShoppingBag; desc: string }[] = [
  { type: "customer", label: "عميل", icon: ShoppingBag, desc: "اطلب وجباتك المفضلة" },
  { type: "driver", label: "سائق توصيل", icon: Truck, desc: "اكسب من التوصيل" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: "خطأ", description: "الرجاء إدخال الاسم الكامل", variant: "destructive" });
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, accountType);
      if (error) {
        toast({ title: "خطأ في إنشاء الحساب", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم إنشاء الحساب بنجاح! 🎉", description: "يمكنك الآن تسجيل الدخول" });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-primary pt-16 pb-12 px-6 rounded-b-[2.5rem] text-center">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">طلباتك</h1>
        <p className="text-primary-foreground/80 text-sm">أسرع منصة توصيل بالذكاء الاصطناعي</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        <h2 className="text-xl font-bold text-foreground mb-1">
          {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isLogin ? "أدخل بياناتك للمتابعة" : "اختر نوع حسابك وأنشئ حسابك"}
        </p>

        {/* Account Type Selection (only for signup) */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {accountTypes.map((at) => (
              <motion.button
                key={at.type}
                type="button"
                onClick={() => setAccountType(at.type)}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  accountType === at.type
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border bg-card"
                }`}
              >
                <at.icon className={`h-8 w-8 mx-auto mb-2 ${accountType === at.type ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`font-semibold text-sm ${accountType === at.type ? "text-primary" : "text-foreground"}`}>
                  {at.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{at.desc}</p>
              </motion.button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="الاسم الكامل"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pr-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground"
                maxLength={100}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pr-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground"
              required
              maxLength={254}
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11 pl-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground"
              required
              minLength={6}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            {loading ? "جارٍ التحميل..." : isLogin ? "تسجيل الدخول" : `إنشاء حساب ${accountType === "driver" ? "سائق" : "عميل"}`}
            <ArrowRight className="h-5 w-5 mr-2" />
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary font-medium"
          >
            {isLogin ? "ليس لديك حساب؟ أنشئ حساباً جديداً" : "لديك حساب بالفعل؟ سجل الدخول"}
          </button>
        </div>

        {/* Admin hint */}
        {isLogin && (
          <div className="mt-6 bg-muted/50 rounded-xl p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              حساب الأدمن يتم إنشاؤه من لوحة التحكم. سجل دخول بحسابك العادي وسيتم ترقيتك.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
