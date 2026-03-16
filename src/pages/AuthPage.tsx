import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Bike, ShoppingBag, Shield, Phone, Camera, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type AccountType = "customer" | "driver";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("customer");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, dir, isAr, lang } = useLang();

  // Determine where to redirect after auth
  const from = (location.state as any)?.from || "/";

  const accountTypes = [
    { type: "customer" as AccountType, label: t("auth.customer"), icon: ShoppingBag, desc: t("auth.customerDesc") },
    { type: "driver" as AccountType, label: t("auth.driver"), icon: Bike, desc: t("auth.driverDesc") },
  ];

  const handleFileChange = (file: File | null, type: "id" | "selfie") => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("general.error"), description: lang === "ar" ? "حجم الملف يجب أن يكون أقل من 5 ميجابايت" : "File must be under 5MB", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: t("general.error"), description: lang === "ar" ? "يجب رفع صورة فقط" : "Only images allowed", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "id") {
        setIdCardFile(file);
        setIdCardPreview(reader.result as string);
      } else {
        setSelfieFile(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, userId: string, folder: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("driver-documents").upload(path, file);
    if (error) { console.error("Upload error:", error); return null; }
    const { data } = supabase.storage.from("driver-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: lang === "ar" ? "خطأ في تسجيل الدخول" : "Login Error", description: error.message, variant: "destructive" });
      } else {
        // Navigate to where user came from (cart, etc.) or home
        navigate(from, { replace: true });
      }
    } else {
      if (!fullName.trim()) {
        toast({ title: t("general.error"), description: lang === "ar" ? "الرجاء إدخال الاسم الكامل" : "Please enter your full name", variant: "destructive" });
        setLoading(false); return;
      }
      if (accountType === "driver") {
        if (!phone.trim() || phone.length < 10) {
          toast({ title: t("general.error"), description: lang === "ar" ? "الرجاء إدخال رقم تليفون صحيح" : "Please enter a valid phone number", variant: "destructive" });
          setLoading(false); return;
        }
        if (!idCardFile) {
          toast({ title: t("general.error"), description: lang === "ar" ? "الرجاء رفع صورة البطاقة" : "Please upload your ID card", variant: "destructive" });
          setLoading(false); return;
        }
        if (!selfieFile) {
          toast({ title: t("general.error"), description: lang === "ar" ? "الرجاء رفع صورة سيلفي بالبطاقة" : "Please upload a selfie with your ID", variant: "destructive" });
          setLoading(false); return;
        }
      }

      const { error, userId } = await signUp(email, password, fullName, accountType);
      if (error) {
        toast({ title: lang === "ar" ? "خطأ في إنشاء الحساب" : "Signup Error", description: error.message, variant: "destructive" });
      } else if (userId && accountType === "driver") {
        const idCardUrl = await uploadFile(idCardFile!, userId, "id-card");
        const selfieUrl = await uploadFile(selfieFile!, userId, "selfie-id");
        await supabase.from("drivers").update({
          phone, id_card_url: idCardUrl, selfie_with_id_url: selfieUrl,
        }).eq("user_id", userId);
        toast({ title: lang === "ar" ? "تم إنشاء حساب السائق بنجاح! 🎉" : "Driver account created! 🎉", description: lang === "ar" ? "سيتم مراجعة بياناتك والموافقة عليها قريباً" : "Your data will be reviewed soon" });
        // Auto-login and redirect after signup
        const { error: loginErr } = await signIn(email, password);
        if (!loginErr) {
          navigate(from, { replace: true });
        } else {
          setIsLogin(true);
        }
      } else {
        toast({ title: lang === "ar" ? "تم إنشاء الحساب بنجاح! 🎉" : "Account created! 🎉" });
        // Auto-login after signup and redirect to where user was
        const { error: loginErr } = await signIn(email, password);
        if (!loginErr) {
          navigate(from, { replace: true });
        } else {
          // Fallback: tell user to login manually
          toast({ description: lang === "ar" ? "يمكنك الآن تسجيل الدخول" : "You can now login" });
          setIsLogin(true);
        }
      }
    }
    setLoading(false);
  };

  const isDriver = accountType === "driver" && !isLogin;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      {/* Header */}
      <div className="bg-primary pt-16 pb-12 px-6 rounded-b-[2.5rem] text-center">
        <h1 className="text-3xl font-bold text-primary-foreground mb-2">{lang === "ar" ? "طلباتك" : "Talabatk"}</h1>
        <p className="text-primary-foreground/80 text-sm">{lang === "ar" ? "أسرع منصة توصيل في مصر" : "The fastest delivery platform in Egypt"}</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 pb-8 max-w-md mx-auto w-full">
        <h2 className="text-xl font-bold text-foreground mb-1">
          {isLogin ? t("auth.login") : t("auth.createAccount")}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {isLogin
            ? (lang === "ar" ? "أدخل بياناتك للمتابعة" : "Enter your details to continue")
            : (lang === "ar" ? "اختر نوع حسابك وأنشئ حسابك" : "Choose account type and create your account")}
        </p>

        {/* Account Type Selection */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {accountTypes.map((at) => (
              <motion.button
                key={at.type}
                type="button"
                onClick={() => setAccountType(at.type)}
                whileTap={{ scale: 0.97 }}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  accountType === at.type ? "border-primary bg-primary/5 shadow-card" : "border-border bg-card"
                }`}
              >
                <at.icon className={`h-8 w-8 mx-auto mb-2 ${accountType === at.type ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`font-semibold text-sm ${accountType === at.type ? "text-primary" : "text-foreground"}`}>{at.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{at.desc}</p>
              </motion.button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder={t("auth.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="pr-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground" maxLength={100} />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)}
              className="pr-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground" required maxLength={254} />
          </div>

          <div className="relative">
            <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} placeholder={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)}
              className="pr-11 pl-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground" required minLength={6} maxLength={128} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3 text-muted-foreground">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Driver-specific fields */}
          {isDriver && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="tel" placeholder={t("auth.phone")} value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                  className="pr-11 h-12 rounded-xl bg-muted/50 border-0 text-foreground placeholder:text-muted-foreground" maxLength={15} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> {t("auth.idCard")}
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                  {idCardPreview ? (
                    <img src={idCardPreview} alt="ID" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("auth.selectPhoto")}</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "id")} />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" /> {t("auth.selfie")}
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
                  {selfiePreview ? (
                    <img src={selfiePreview} alt="Selfie" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("auth.selectPhoto")}</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null, "selfie")} />
                </label>
              </div>
            </motion.div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold">
            {loading ? t("auth.processing") : isLogin ? t("auth.login") : `${t("auth.signup")} ${accountType === "driver" ? t("auth.driver") : t("auth.customer")}`}
            <ArrowIcon className="h-5 w-5 ms-2" />
          </Button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary font-medium">
            {isLogin
              ? `${t("auth.noAccount")} ${t("auth.createAccount")}`
              : `${t("auth.haveAccount")} ${t("auth.loginNow")}`}
          </button>
        </div>

        {isLogin && (
          <div className="mt-6 bg-muted/50 rounded-xl p-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              {lang === "ar"
                ? "حساب الأدمن يتم إنشاؤه من لوحة التحكم. سجل دخول بحسابك العادي وسيتم ترقيتك."
                : "Admin accounts are created from the control panel. Login with your regular account."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
