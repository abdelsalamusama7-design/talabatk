import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "ar" | "en";

const translations = {
  // Header & Navigation
  "nav.home": { ar: "الرئيسية", en: "Home" },
  "nav.orders": { ar: "طلباتك", en: "Orders" },
  "nav.cart": { ar: "السلة", en: "Cart" },
  "nav.account": { ar: "حسابك", en: "Account" },
  "header.deliverTo": { ar: "التوصيل إلى", en: "Deliver to" },
  "header.search": { ar: "ابحث عن متاجر أو منتجات...", en: "Search stores or products..." },

  // Categories
  "cat.restaurants": { ar: "مطاعم", en: "Restaurants" },
  "cat.pharmacy": { ar: "صيدلية", en: "Pharmacy" },
  "cat.grocery": { ar: "بقالة", en: "Grocery" },
  "cat.vegetables": { ar: "خضار", en: "Vegetables" },
  "cat.fruits": { ar: "فواكه", en: "Fruits" },
  "cat.sweets": { ar: "حلويات", en: "Sweets" },
  "cat.services": { ar: "خدمات", en: "Services" },

  // Index page
  "home.discoverStores": { ar: "اكتشف كل المتاجر", en: "Discover All Stores" },
  "home.offers": { ar: "عروض وتخفيضات 🎉", en: "Offers & Deals 🎉" },
  "home.trending": { ar: "الأكثر طلباً اليوم 🔥", en: "Trending Today 🔥" },

  // Account page
  "account.guest": { ar: "زائر", en: "Guest" },
  "account.user": { ar: "مستخدم طلباتك", en: "Talabatk User" },
  "account.loginToContinue": { ar: "سجل دخولك للمتابعة", en: "Login to continue" },
  "account.login": { ar: "تسجيل الدخول", en: "Login" },
  "account.logout": { ar: "تسجيل الخروج", en: "Logout" },
  "account.myOrders": { ar: "طلباتي السابقة", en: "My Orders" },
  "account.loyalty": { ar: "نقاط الولاء والمكافآت", en: "Loyalty & Rewards" },
  "account.restaurantPanel": { ar: "لوحة المطعم", en: "Restaurant Panel" },
  "account.driverPanel": { ar: "لوحة السائق", en: "Driver Panel" },
  "account.adminPanel": { ar: "لوحة التحكم (أدمن)", en: "Admin Panel" },
  "account.registerRestaurant": { ar: "التسجيل كمطعم", en: "Register as Restaurant" },
  "account.registerDriver": { ar: "التسجيل كسائق", en: "Register as Driver" },
  "account.help": { ar: "احصل على المساعدة", en: "Get Help" },
  "account.about": { ar: "حول التطبيق", en: "About App" },

  // Auth page
  "auth.login": { ar: "تسجيل الدخول", en: "Login" },
  "auth.signup": { ar: "إنشاء حساب", en: "Sign Up" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.fullName": { ar: "الاسم الكامل", en: "Full Name" },
  "auth.phone": { ar: "رقم الهاتف", en: "Phone Number" },
  "auth.customer": { ar: "عميل", en: "Customer" },
  "auth.driver": { ar: "سائق موتوسيكل", en: "Motorcycle Driver" },
  "auth.customerDesc": { ar: "اطلب وجباتك المفضلة", en: "Order your favorite meals" },
  "auth.driverDesc": { ar: "اكسب من التوصيل", en: "Earn from delivery" },
  "auth.noAccount": { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  "auth.haveAccount": { ar: "لديك حساب؟", en: "Already have an account?" },
  "auth.createAccount": { ar: "إنشاء حساب جديد", en: "Create New Account" },
  "auth.loginNow": { ar: "سجل دخولك", en: "Login Now" },
  "auth.welcome": { ar: "أهلاً بك في طلباتك 👋", en: "Welcome to Talabatk 👋" },
  "auth.welcomeDesc": { ar: "سجل دخولك واطلب كل اللي نفسك فيه", en: "Login and order anything you want" },
  "auth.idCard": { ar: "صورة البطاقة الشخصية", en: "ID Card Photo" },
  "auth.selfie": { ar: "سيلفي مع البطاقة", en: "Selfie with ID" },
  "auth.selectPhoto": { ar: "اختر صورة", en: "Select Photo" },
  "auth.accountType": { ar: "نوع الحساب", en: "Account Type" },
  "auth.processing": { ar: "جاري المعالجة...", en: "Processing..." },

  // Cart page
  "cart.title": { ar: "سلة المشتريات", en: "Shopping Cart" },
  "cart.empty": { ar: "السلة فاضية 🛒", en: "Cart is empty 🛒" },
  "cart.emptyDesc": { ar: "أضف وجبات من المتاجر وابدأ الطلب", en: "Add items from stores and start ordering" },
  "cart.browseStores": { ar: "تصفح المتاجر", en: "Browse Stores" },
  "cart.orderNotes": { ar: "ملاحظات على الطلب (اختياري)", en: "Order notes (optional)" },
  "cart.promoCode": { ar: "أدخل كود الخصم", en: "Enter promo code" },
  "cart.apply": { ar: "تطبيق", en: "Apply" },
  "cart.subtotal": { ar: "المجموع", en: "Subtotal" },
  "cart.deliveryFee": { ar: "رسوم التوصيل", en: "Delivery Fee" },
  "cart.discount": { ar: "الخصم", en: "Discount" },
  "cart.total": { ar: "الإجمالي", en: "Total" },
  "cart.placeOrder": { ar: "تأكيد الطلب", en: "Place Order" },
  "cart.loginToOrder": { ar: "سجل دخولك أولاً", en: "Login First" },
  "cart.deliveryAddress": { ar: "عنوان التوصيل", en: "Delivery Address" },
  "cart.detecting": { ar: "جاري تحديد الموقع...", en: "Detecting location..." },
  "cart.noLocation": { ar: "لم يتم تحديد الموقع", en: "Location not detected" },
  "cart.orderPlaced": { ar: "تم تأكيد الطلب بنجاح! 🎉", en: "Order placed successfully! 🎉" },

  // Orders page
  "orders.title": { ar: "طلباتك", en: "Your Orders" },
  "orders.active": { ar: "طلبات نشطة", en: "Active Orders" },
  "orders.past": { ar: "طلبات سابقة", en: "Past Orders" },
  "orders.noActive": { ar: "لا توجد طلبات نشطة", en: "No active orders" },
  "orders.noPast": { ar: "لا توجد طلبات سابقة", en: "No past orders" },
  "orders.empty": { ar: "لا توجد طلبات", en: "No orders yet" },
  "orders.loginToView": { ar: "سجل دخولك لعرض طلباتك", en: "Login to view your orders" },
  "orders.details": { ar: "تفاصيل", en: "Details" },
  "orders.reorder": { ar: "أعد الطلب", en: "Reorder" },
  "orders.trackOrder": { ar: "تتبع الطلب", en: "Track Order" },

  // Order statuses
  "status.pending": { ar: "في الانتظار", en: "Pending" },
  "status.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "status.preparing": { ar: "قيد التجهيز", en: "Preparing" },
  "status.ready": { ar: "جاهز", en: "Ready" },
  "status.picked_up": { ar: "تم الاستلام", en: "Picked Up" },
  "status.delivering": { ar: "قيد التوصيل", en: "Delivering" },
  "status.delivered": { ar: "تم التسليم", en: "Delivered" },
  "status.cancelled": { ar: "ملغي", en: "Cancelled" },

  // Store page
  "store.menu": { ar: "القائمة", en: "Menu" },
  "store.reviews": { ar: "التقييمات", en: "Reviews" },
  "store.addToCart": { ar: "أضف للسلة", en: "Add to Cart" },
  "store.closed": { ar: "مغلق", en: "Closed" },
  "store.open": { ar: "مفتوح", en: "Open" },
  "store.minOrder": { ar: "حد أدنى", en: "Min Order" },
  "store.deliveryTime": { ar: "وقت التوصيل", en: "Delivery Time" },
  "store.deliveryFee": { ar: "رسوم التوصيل", en: "Delivery Fee" },

  // Offers
  "offers.title": { ar: "العروض والتخفيضات 🎉", en: "Offers & Deals 🎉" },
  "offers.orderNow": { ar: "اطلب الآن", en: "Order Now" },
  "offers.noOffers": { ar: "لا توجد عروض حالياً", en: "No offers currently" },
  "offers.followUs": { ar: "تابعنا للحصول على أحدث العروض", en: "Follow us for latest offers" },
  "offers.browseStores": { ar: "تصفح المتاجر", en: "Browse Stores" },

  // Notifications
  "notif.title": { ar: "الإشعارات", en: "Notifications" },
  "notif.empty": { ar: "لا توجد إشعارات", en: "No notifications" },

  // General
  "general.loading": { ar: "جاري التحميل...", en: "Loading..." },
  "general.error": { ar: "حدث خطأ", en: "An error occurred" },
  "general.save": { ar: "حفظ", en: "Save" },
  "general.cancel": { ar: "إلغاء", en: "Cancel" },
  "general.delete": { ar: "حذف", en: "Delete" },
  "general.edit": { ar: "تعديل", en: "Edit" },
  "general.add": { ar: "إضافة", en: "Add" },
  "general.close": { ar: "إغلاق", en: "Close" },
  "general.confirm": { ar: "تأكيد", en: "Confirm" },
  "general.back": { ar: "رجوع", en: "Back" },
  "general.egp": { ar: "ج.م", en: "EGP" },
  "general.min": { ar: "د", en: "min" },
  "general.points": { ar: "نقطة", en: "points" },

  // Footer
  "footer.designBy": { ar: "تنفيذ وتصميم", en: "Designed by" },
  "footer.rights": { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },

  // Search
  "search.title": { ar: "البحث", en: "Search" },
  "search.placeholder": { ar: "ابحث عن متاجر أو وجبات...", en: "Search stores or meals..." },
  "search.noResults": { ar: "لا توجد نتائج", en: "No results found" },

  // Loyalty
  "loyalty.title": { ar: "نقاط الولاء والمكافآت", en: "Loyalty & Rewards" },
  "loyalty.points": { ar: "نقطة", en: "points" },
  "loyalty.bronze": { ar: "عضو برونزي", en: "Bronze Member" },
  "loyalty.silver": { ar: "عضو فضي", en: "Silver Member" },
  "loyalty.gold": { ar: "عضو ذهبي", en: "Gold Member" },
  "loyalty.canRedeem": { ar: "يمكنك استبدال", en: "You can redeem" },
  "loyalty.nextLevel": { ar: "نقطة للمستوى التالي", en: "points to next level" },
} as const;

type TranslationKey = keyof typeof translations;

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  dir: "rtl" | "ltr";
  isAr: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key) => translations[key]?.ar || key,
  dir: "rtl",
  isAr: true,
});

export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "en" ? "en" : "ar") as Lang;
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("app-lang", newLang);
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr", isAr: lang === "ar" }}>
      {children}
    </LangContext.Provider>
  );
};
