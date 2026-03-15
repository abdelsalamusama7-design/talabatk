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
import storeShawarma from "@/assets/store-shawarma.jpg";
import storeGrilled from "@/assets/store-grilled.jpg";
import storeFoul from "@/assets/store-foul.jpg";
import storePharmacy2 from "@/assets/store-pharmacy2.jpg";
import storePharmacy3 from "@/assets/store-pharmacy3.jpg";
import storeVegetables from "@/assets/store-vegetables.jpg";
import storeGrocery2 from "@/assets/store-grocery2.jpg";
import storeSeafood from "@/assets/store-seafood.jpg";

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
  {
    id: "shawarma-amir",
    name: "شاورما الأمير",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeShawarma,
    rating: 4.7,
    reviewCount: 410,
    deliveryTime: "20-30",
    deliveryFee: 10,
    products: [
      { id: "p18", name: "شاورما لحم", price: 45, description: "شاورما لحم مع طحينة وبقدونس", image: storeShawarma },
      { id: "p19", name: "شاورما فراخ", price: 40, description: "شاورما فراخ مع ثومية وسلطة", image: storeShawarma },
      { id: "p20", name: "وجبة شاورما ميكس", price: 95, description: "شاورما لحم وفراخ مع بطاطس ومشروب", image: storeShawarma },
      { id: "p21", name: "ساندوتش فلافل", price: 20, description: "فلافل مقرمشة مع طحينة وسلطة", image: storeShawarma },
    ],
  },
  {
    id: "grilled-house",
    name: "بيت المشويات",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeGrilled,
    rating: 4.6,
    reviewCount: 350,
    deliveryTime: "30-45",
    deliveryFee: 18,
    products: [
      { id: "p22", name: "نص فرخة مشوية", price: 90, description: "نص فرخة مشوية مع أرز وسلطة", image: storeGrilled },
      { id: "p23", name: "فرخة كاملة", price: 160, description: "فرخة كاملة مشوية مع أرز وبطاطس", image: storeGrilled },
      { id: "p24", name: "مشكل مشويات", price: 220, description: "كفتة + ريش + كباب مع أرز وسلطات", image: storeGrilled },
      { id: "p25", name: "كباب حلة", price: 130, description: "كباب حلة مع صلصة وأرز", image: storeGrilled },
    ],
  },
  {
    id: "foul-elkheir",
    name: "فول الخير",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeFoul,
    rating: 4.3,
    reviewCount: 680,
    deliveryTime: "15-20",
    deliveryFee: 8,
    products: [
      { id: "p26", name: "فول بالزيت", price: 15, description: "طبق فول بالزيت الحار والليمون", image: storeFoul },
      { id: "p27", name: "فول بالطحينة", price: 20, description: "فول مدمس بالطحينة والبهارات", image: storeFoul },
      { id: "p28", name: "طعمية (5 أقراص)", price: 15, description: "طعمية مقرمشة طازة", image: storeFoul },
      { id: "p29", name: "وجبة فطار كاملة", price: 45, description: "فول + طعمية + بيض + سلطة + عيش", image: storeFoul },
    ],
  },
  {
    id: "seafood-captain",
    name: "كابتن سي فود",
    category: "مطاعم",
    categoryId: "restaurants",
    image: storeSeafood,
    rating: 4.5,
    reviewCount: 230,
    deliveryTime: "35-50",
    deliveryFee: 25,
    products: [
      { id: "p30", name: "سمك بلطي مشوي", price: 120, description: "سمك بلطي مشوي مع أرز وسلطة", image: storeSeafood },
      { id: "p31", name: "جمبري مقلي", price: 180, description: "جمبري مقلي مقرمش مع صوص كوكتيل", image: storeSeafood },
      { id: "p32", name: "وجبة سي فود ميكس", price: 250, description: "سمك + جمبري + كاليماري + أرز", image: storeSeafood },
      { id: "p33", name: "سمك موسى فيليه", price: 160, description: "فيليه سمك موسى مشوي بالليمون", image: storeSeafood },
    ],
  },
  {
    id: "pharmacy-elezaby",
    name: "صيدلية العزبي",
    category: "صيدليات",
    categoryId: "pharmacy",
    image: storePharmacy2,
    rating: 4.7,
    reviewCount: 420,
    deliveryTime: "20-30",
    deliveryFee: 10,
    products: [
      { id: "p34", name: "كريم واقي شمس", price: 180, description: "واقي شمس SPF50 للبشرة الحساسة", image: storePharmacy2 },
      { id: "p35", name: "مكمل غذائي أوميجا 3", price: 220, description: "أوميجا 3 - 60 كبسولة", image: storePharmacy2 },
      { id: "p36", name: "شامبو طبي", price: 95, description: "شامبو مضاد للقشرة 200 مل", image: storePharmacy2 },
      { id: "p37", name: "فيتامين د", price: 65, description: "فيتامين د3 1000 وحدة - 30 قرص", image: storePharmacy2 },
    ],
  },
  {
    id: "pharmacy-seif",
    name: "صيدليات سيف",
    category: "صيدليات",
    categoryId: "pharmacy",
    image: storePharmacy3,
    rating: 4.6,
    reviewCount: 310,
    deliveryTime: "15-25",
    deliveryFee: 12,
    products: [
      { id: "p38", name: "مسكن أدفيل", price: 40, description: "أقراص مسكنة للألم - 20 قرص", image: storePharmacy3 },
      { id: "p39", name: "مرطب بيوديرما", price: 350, description: "كريم مرطب للبشرة الجافة 200 مل", image: storePharmacy3 },
      { id: "p40", name: "غسول وجه", price: 120, description: "غسول وجه للبشرة الدهنية 150 مل", image: storePharmacy3 },
      { id: "p41", name: "ماسك شعر", price: 85, description: "ماسك ترطيب عميق للشعر", image: storePharmacy3 },
    ],
  },
  {
    id: "khedar-eltazeg",
    name: "خضار الطازج",
    category: "خضار وفواكه",
    categoryId: "grocery",
    image: storeVegetables,
    rating: 4.4,
    reviewCount: 190,
    deliveryTime: "25-35",
    deliveryFee: 10,
    products: [
      { id: "p42", name: "كيلو طماطم", price: 15, description: "طماطم طازة من المزرعة", image: storeVegetables },
      { id: "p43", name: "كيلو بطاطس", price: 12, description: "بطاطس نظيفة ومختارة", image: storeVegetables },
      { id: "p44", name: "كيلو خيار", price: 10, description: "خيار طازج ومقرمش", image: storeVegetables },
      { id: "p45", name: "كيلو بصل", price: 8, description: "بصل أحمر طازج", image: storeVegetables },
      { id: "p46", name: "باكت سلطة جاهزة", price: 25, description: "خس + طماطم + خيار + جزر مقطعة", image: storeVegetables },
    ],
  },
  {
    id: "supermarket-elkhair",
    name: "سوبر ماركت الخير",
    category: "بقالة",
    categoryId: "grocery",
    image: storeGrocery2,
    rating: 4.3,
    reviewCount: 270,
    deliveryTime: "30-45",
    deliveryFee: 15,
    products: [
      { id: "p47", name: "لبن كامل الدسم 1 لتر", price: 22, description: "لبن طازج كامل الدسم", image: storeGrocery2 },
      { id: "p48", name: "جبنة بيضاء كيلو", price: 80, description: "جبنة بيضاء دمياطي", image: storeGrocery2 },
      { id: "p49", name: "زيت عباد الشمس 1 لتر", price: 65, description: "زيت طبخ عالي الجودة", image: storeGrocery2 },
      { id: "p50", name: "أرز مصري كيلو", price: 30, description: "أرز مصري فاخر", image: storeGrocery2 },
      { id: "p51", name: "سكر كيلو", price: 18, description: "سكر أبيض ناعم", image: storeGrocery2 },
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
