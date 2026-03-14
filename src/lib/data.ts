import catRestaurants from "@/assets/cat-restaurants.jpg";
import catPharmacy from "@/assets/cat-pharmacy.jpg";
import catGrocery from "@/assets/cat-grocery.jpg";
import catServices from "@/assets/cat-services.jpg";
import catSweets from "@/assets/cat-sweets.jpg";
import storeSultan from "@/assets/store-sultan-burger.jpg";
import storeShefa from "@/assets/store-shefa-pharmacy.jpg";
import storeTech from "@/assets/store-tech-fix.jpg";
import storeKoshari from "@/assets/store-koshari.jpg";
import storePizza from "@/assets/store-pizza.jpg";

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  products: Product[];
}

export interface CartItem {
  product: Product;
  store: Store;
  quantity: number;
}

export interface Order {
  id: string;
  storeName: string;
  storeImage: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  deliveryFee: number;
  status: "preparing" | "delivering" | "delivered";
  date: string;
  deliveryPerson: string;
}

export const categories: Category[] = [
  { id: "restaurants", name: "المطاعم", image: catRestaurants },
  { id: "pharmacy", name: "صيدليات", image: catPharmacy },
  { id: "grocery", name: "البقالة", image: catGrocery },
  { id: "services", name: "خدمات", image: catServices },
  { id: "sweets", name: "حلويات", image: catSweets },
];

export const stores: Store[] = [
  {
    id: "sultan-burger",
    name: "سلطان برجر",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeSultan,
    rating: 4.5,
    reviewCount: 320,
    deliveryTime: "25-35",
    deliveryFee: 15,
    products: [
      { id: "p1", name: "برجر كلاسيك", price: 85, description: "برجر لحم مع جبنة شيدر وخس وطماطم", image: storeSultan },
      { id: "p2", name: "برجر دبل", price: 120, description: "قطعتين لحم مع جبنة مزدوجة", image: storeSultan },
      { id: "p3", name: "وجبة عائلية", price: 250, description: "4 برجر + بطاطس كبير + 4 مشروبات", image: storeSultan },
      { id: "p4", name: "بطاطس مقلية", price: 35, description: "بطاطس مقلية مقرمشة", image: storeSultan },
      { id: "p5", name: "كولا كبير", price: 20, description: "مشروب غازي 500 مل", image: storeSultan },
    ],
  },
  {
    id: "shefa-pharmacy",
    name: "صيدلية الشفاء",
    category: "صيدليات",
    categoryId: "pharmacy",
    image: storeShefa,
    rating: 4.8,
    reviewCount: 150,
    deliveryTime: "15-25",
    deliveryFee: 10,
    products: [
      { id: "p6", name: "أدوية برد وإنفلونزا", price: 85, description: "مجموعة أدوية البرد الأساسية", image: storeShefa },
      { id: "p7", name: "فيتامين سي", price: 45, description: "فيتامين سي 1000 مجم - 30 قرص", image: storeShefa },
      { id: "p8", name: "مسكنات", price: 30, description: "بنادول أقراص - 24 قرص", image: storeShefa },
    ],
  },
  {
    id: "tech-fix",
    name: "تيك فيكس",
    category: "خدمات صيانة",
    categoryId: "services",
    image: storeTech,
    rating: 4.2,
    reviewCount: 89,
    deliveryTime: "حجز موعد",
    deliveryFee: 0,
    products: [
      { id: "p9", name: "تصليح شاشة موبايل", price: 350, description: "تغيير شاشة الموبايل بشاشة أصلية", image: storeTech },
      { id: "p10", name: "صيانة لاب توب", price: 200, description: "فحص شامل وتنظيف", image: storeTech },
      { id: "p11", name: "استبدال بطارية", price: 150, description: "تغيير البطارية ببطارية جديدة", image: storeTech },
    ],
  },
  {
    id: "koshari-sheik",
    name: "كشري شيخ العرب",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeKoshari,
    rating: 4.4,
    reviewCount: 520,
    deliveryTime: "20-30",
    deliveryFee: 12,
    products: [
      { id: "p12", name: "كشري صغير", price: 25, description: "طبق كشري صغير مع صلصة ودقة", image: storeKoshari },
      { id: "p13", name: "كشري وسط", price: 35, description: "طبق كشري وسط مع كل الإضافات", image: storeKoshari },
      { id: "p14", name: "كشري كبير", price: 50, description: "طبق كشري كبير مع إضافات مجانية", image: storeKoshari },
    ],
  },
  {
    id: "pizza-roma",
    name: "بيتزا روما",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storePizza,
    rating: 4.6,
    reviewCount: 280,
    deliveryTime: "30-45",
    deliveryFee: 20,
    products: [
      { id: "p15", name: "بيتزا مارجريتا", price: 90, description: "بيتزا بصوص الطماطم وجبنة موزاريلا", image: storePizza },
      { id: "p16", name: "بيتزا بيبروني", price: 110, description: "بيتزا مع شرائح البيبروني", image: storePizza },
      { id: "p17", name: "بيتزا سوبريم", price: 130, description: "بيتزا بكل الإضافات", image: storePizza },
    ],
  },
];

export const sampleOrders: Order[] = [
  {
    id: "3444296029",
    storeName: "كشري شيخ العرب",
    storeImage: storeKoshari,
    items: [{ name: "كشري كبير", quantity: 2, price: 50 }],
    total: 112,
    deliveryFee: 12,
    status: "delivered",
    date: "7 فبراير • 11:54م",
    deliveryPerson: "أحمد محمد",
  },
  {
    id: "3431424510",
    storeName: "سلطان برجر",
    storeImage: storeSultan,
    items: [{ name: "وجبة عائلية", quantity: 1, price: 250 }],
    total: 265,
    deliveryFee: 15,
    status: "delivering",
    date: "1 فبراير • 2:13ص",
    deliveryPerson: "محمود علي",
  },
];
