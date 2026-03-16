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
import catVegetables from "@/assets/cat-vegetables.jpg";
import catFruits from "@/assets/cat-fruits.jpg";
import storeFruits1 from "@/assets/store-fruits1.jpg";
import storeFruits2 from "@/assets/store-fruits2.jpg";
import storeVegetables2 from "@/assets/store-vegetables2.jpg";

// Product images
import prodBurgerClassic from "@/assets/prod-burger-classic.jpg";
import prodBurgerDouble from "@/assets/prod-burger-double.jpg";
import prodBurgerFamily from "@/assets/prod-burger-family.jpg";
import prodFries from "@/assets/prod-fries.jpg";
import prodCola from "@/assets/prod-cola.jpg";
import prodKoshari from "@/assets/prod-koshari.jpg";
import prodPizzaMargherita from "@/assets/prod-pizza-margherita.jpg";
import prodPizzaPepperoni from "@/assets/prod-pizza-pepperoni.jpg";
import prodPizzaSupreme from "@/assets/prod-pizza-supreme.jpg";
import prodShawarmaMeat from "@/assets/prod-shawarma-meat.jpg";
import prodShawarmaChicken from "@/assets/prod-shawarma-chicken.jpg";
import prodFalafel from "@/assets/prod-falafel.jpg";
import prodGrilledChicken from "@/assets/prod-grilled-chicken.jpg";
import prodMixedGrill from "@/assets/prod-mixed-grill.jpg";
import prodFoul from "@/assets/prod-foul.jpg";
import prodBreakfast from "@/assets/prod-breakfast.jpg";
import prodGrilledFish from "@/assets/prod-grilled-fish.jpg";
import prodFriedShrimp from "@/assets/prod-fried-shrimp.jpg";
import prodSeafoodMix from "@/assets/prod-seafood-mix.jpg";
import prodMedicine from "@/assets/prod-medicine.jpg";
import prodVitamins from "@/assets/prod-vitamins.jpg";
import prodSunscreen from "@/assets/prod-sunscreen.jpg";
import prodTomatoes from "@/assets/prod-tomatoes.jpg";
import prodPotatoes from "@/assets/prod-potatoes.jpg";
import prodCucumber from "@/assets/prod-cucumber.jpg";
import prodPeppers from "@/assets/prod-peppers.jpg";
import prodEggplant from "@/assets/prod-eggplant.jpg";
import prodZucchini from "@/assets/prod-zucchini.jpg";
import prodHerbs from "@/assets/prod-herbs.jpg";
import prodMango from "@/assets/prod-mango.jpg";
import prodStrawberry from "@/assets/prod-strawberry.jpg";
import prodOrangeBanana from "@/assets/prod-orange-banana.jpg";
import prodGrapes from "@/assets/prod-grapes.jpg";
import prodAppleKiwi from "@/assets/prod-apple-kiwi.jpg";
import prodPineapple from "@/assets/prod-pineapple.jpg";
import prodFruitBasket from "@/assets/prod-fruit-basket.jpg";
import prodWatermelon from "@/assets/prod-watermelon.jpg";
import prodDairy from "@/assets/prod-dairy.jpg";
import prodGroceryStaples from "@/assets/prod-grocery-staples.jpg";
import prodPhoneRepair from "@/assets/prod-phone-repair.jpg";

// Juice images
import catJuices from "@/assets/cat-juices.jpg";
import storeFarghaly from "@/assets/store-farghaly.jpg";
import storeJuiceTime from "@/assets/store-juice-time.jpg";
import prodJuiceMango from "@/assets/prod-juice-mango.jpg";
import prodJuiceStrawberry from "@/assets/prod-juice-strawberry.jpg";
import prodJuiceOrange from "@/assets/prod-juice-orange.jpg";
import prodJuiceSugarcane from "@/assets/prod-juice-sugarcane.jpg";
import prodJuiceGuava from "@/assets/prod-juice-guava.jpg";
import prodJuiceCocktail from "@/assets/prod-juice-cocktail.jpg";
import prodJuiceLemonmint from "@/assets/prod-juice-lemonmint.jpg";

// Sweets images
import storeBalaban from "@/assets/store-balaban.jpg";
import storelapoar from "@/assets/store-lapoar.jpg";
import prodKunafa from "@/assets/prod-kunafa.jpg";
import prodBasbousa from "@/assets/prod-basbousa.jpg";
import prodRicePudding from "@/assets/prod-rice-pudding.jpg";
import prodChocolateCake from "@/assets/prod-chocolate-cake.jpg";
import prodMacarons from "@/assets/prod-macarons.jpg";
import prodBaklava from "@/assets/prod-baklava.jpg";
import prodCreamCaramel from "@/assets/prod-cream-caramel.jpg";
import prodCheesecake from "@/assets/prod-cheesecake.jpg";

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

export type WeightOption = "0.25" | "0.5" | "1" | "2" | "3";

export const weightLabels: Record<WeightOption, string> = {
  "0.25": "ربع كيلو",
  "0.5": "نص كيلو",
  "1": "كيلو",
  "2": "2 كيلو",
  "3": "3 كيلو",
};

export const isWeightCategory = (categoryId: string) =>
  ["vegetables", "fruits"].includes(categoryId);

export interface CartItem {
  product: Product;
  store: Store;
  quantity: number;
  weight?: WeightOption;
  itemNote?: string;
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
  { id: "vegetables", name: "خضار", image: catVegetables },
  { id: "fruits", name: "فواكه", image: catFruits },
  { id: "juices", name: "عصائر", image: catJuices },
  { id: "sweets", name: "حلويات", image: catSweets },
  { id: "services", name: "خدمات", image: catServices },
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
      { id: "p1", name: "برجر كلاسيك", price: 85, description: "برجر لحم مع جبنة شيدر وخس وطماطم", image: prodBurgerClassic },
      { id: "p2", name: "برجر دبل", price: 120, description: "قطعتين لحم مع جبنة مزدوجة", image: prodBurgerDouble },
      { id: "p3", name: "وجبة عائلية", price: 250, description: "4 برجر + بطاطس كبير + 4 مشروبات", image: prodBurgerFamily },
      { id: "p4", name: "بطاطس مقلية", price: 35, description: "بطاطس مقلية مقرمشة", image: prodFries },
      { id: "p5", name: "كولا كبير", price: 20, description: "مشروب غازي 500 مل", image: prodCola },
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
      { id: "p6", name: "أدوية برد وإنفلونزا", price: 85, description: "مجموعة أدوية البرد الأساسية", image: prodMedicine },
      { id: "p7", name: "فيتامين سي", price: 45, description: "فيتامين سي 1000 مجم - 30 قرص", image: prodVitamins },
      { id: "p8", name: "مسكنات", price: 30, description: "بنادول أقراص - 24 قرص", image: prodMedicine },
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
      { id: "p9", name: "تصليح شاشة موبايل", price: 350, description: "تغيير شاشة الموبايل بشاشة أصلية", image: prodPhoneRepair },
      { id: "p10", name: "صيانة لاب توب", price: 200, description: "فحص شامل وتنظيف", image: storeTech },
      { id: "p11", name: "استبدال بطارية", price: 150, description: "تغيير البطارية ببطارية جديدة", image: prodPhoneRepair },
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
      { id: "p12", name: "كشري صغير", price: 25, description: "طبق كشري صغير مع صلصة ودقة", image: prodKoshari },
      { id: "p13", name: "كشري وسط", price: 35, description: "طبق كشري وسط مع كل الإضافات", image: prodKoshari },
      { id: "p14", name: "كشري كبير", price: 50, description: "طبق كشري كبير مع إضافات مجانية", image: prodKoshari },
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
      { id: "p15", name: "بيتزا مارجريتا", price: 90, description: "بيتزا بصوص الطماطم وجبنة موزاريلا", image: prodPizzaMargherita },
      { id: "p16", name: "بيتزا بيبروني", price: 110, description: "بيتزا مع شرائح البيبروني", image: prodPizzaPepperoni },
      { id: "p17", name: "بيتزا سوبريم", price: 130, description: "بيتزا بكل الإضافات", image: prodPizzaSupreme },
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
      { id: "p18", name: "شاورما لحم", price: 45, description: "شاورما لحم مع طحينة وبقدونس", image: prodShawarmaMeat },
      { id: "p19", name: "شاورما فراخ", price: 40, description: "شاورما فراخ مع ثومية وسلطة", image: prodShawarmaChicken },
      { id: "p20", name: "وجبة شاورما ميكس", price: 95, description: "شاورما لحم وفراخ مع بطاطس ومشروب", image: prodShawarmaMeat },
      { id: "p21", name: "ساندوتش فلافل", price: 20, description: "فلافل مقرمشة مع طحينة وسلطة", image: prodFalafel },
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
      { id: "p22", name: "نص فرخة مشوية", price: 90, description: "نص فرخة مشوية مع أرز وسلطة", image: prodGrilledChicken },
      { id: "p23", name: "فرخة كاملة", price: 160, description: "فرخة كاملة مشوية مع أرز وبطاطس", image: prodGrilledChicken },
      { id: "p24", name: "مشكل مشويات", price: 220, description: "كفتة + ريش + كباب مع أرز وسلطات", image: prodMixedGrill },
      { id: "p25", name: "كباب حلة", price: 130, description: "كباب حلة مع صلصة وأرز", image: prodMixedGrill },
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
      { id: "p26", name: "فول بالزيت", price: 15, description: "طبق فول بالزيت الحار والليمون", image: prodFoul },
      { id: "p27", name: "فول بالطحينة", price: 20, description: "فول مدمس بالطحينة والبهارات", image: prodFoul },
      { id: "p28", name: "طعمية (5 أقراص)", price: 15, description: "طعمية مقرمشة طازة", image: prodFalafel },
      { id: "p29", name: "وجبة فطار كاملة", price: 45, description: "فول + طعمية + بيض + سلطة + عيش", image: prodBreakfast },
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
      { id: "p30", name: "سمك بلطي مشوي", price: 120, description: "سمك بلطي مشوي مع أرز وسلطة", image: prodGrilledFish },
      { id: "p31", name: "جمبري مقلي", price: 180, description: "جمبري مقلي مقرمش مع صوص كوكتيل", image: prodFriedShrimp },
      { id: "p32", name: "وجبة سي فود ميكس", price: 250, description: "سمك + جمبري + كاليماري + أرز", image: prodSeafoodMix },
      { id: "p33", name: "سمك موسى فيليه", price: 160, description: "فيليه سمك موسى مشوي بالليمون", image: prodGrilledFish },
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
      { id: "p34", name: "كريم واقي شمس", price: 180, description: "واقي شمس SPF50 للبشرة الحساسة", image: prodSunscreen },
      { id: "p35", name: "مكمل غذائي أوميجا 3", price: 220, description: "أوميجا 3 - 60 كبسولة", image: prodVitamins },
      { id: "p36", name: "شامبو طبي", price: 95, description: "شامبو مضاد للقشرة 200 مل", image: prodSunscreen },
      { id: "p37", name: "فيتامين د", price: 65, description: "فيتامين د3 1000 وحدة - 30 قرص", image: prodVitamins },
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
      { id: "p38", name: "مسكن أدفيل", price: 40, description: "أقراص مسكنة للألم - 20 قرص", image: prodMedicine },
      { id: "p39", name: "مرطب بيوديرما", price: 350, description: "كريم مرطب للبشرة الجافة 200 مل", image: prodSunscreen },
      { id: "p40", name: "غسول وجه", price: 120, description: "غسول وجه للبشرة الدهنية 150 مل", image: prodSunscreen },
      { id: "p41", name: "ماسك شعر", price: 85, description: "ماسك ترطيب عميق للشعر", image: prodSunscreen },
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
      { id: "p47", name: "لبن كامل الدسم 1 لتر", price: 22, description: "لبن طازج كامل الدسم", image: prodDairy },
      { id: "p48", name: "جبنة بيضاء كيلو", price: 80, description: "جبنة بيضاء دمياطي", image: prodDairy },
      { id: "p49", name: "زيت عباد الشمس 1 لتر", price: 65, description: "زيت طبخ عالي الجودة", image: prodGroceryStaples },
      { id: "p50", name: "أرز مصري كيلو", price: 30, description: "أرز مصري فاخر", image: prodGroceryStaples },
      { id: "p51", name: "سكر كيلو", price: 18, description: "سكر أبيض ناعم", image: prodGroceryStaples },
    ],
  },
  {
    id: "khedar-elbalad",
    name: "خضار البلد",
    category: "خضار",
    categoryId: "vegetables",
    image: storeVegetables2,
    rating: 4.5,
    reviewCount: 340,
    deliveryTime: "20-30",
    deliveryFee: 10,
    products: [
      { id: "p52", name: "كيلو طماطم بلدي", price: 18, description: "طماطم بلدي طازة من المزرعة", image: prodTomatoes },
      { id: "p53", name: "كيلو فلفل رومي", price: 25, description: "فلفل رومي ألوان مشكلة", image: prodPeppers },
      { id: "p54", name: "كيلو باذنجان", price: 12, description: "باذنجان رومي طازج", image: prodEggplant },
      { id: "p55", name: "كيلو كوسة", price: 14, description: "كوسة صغيرة طازة", image: prodZucchini },
      { id: "p56", name: "حزمة بقدونس + شبت", price: 5, description: "خضرة طازة مغسولة", image: prodHerbs },
      { id: "p57", name: "كيلو جزر", price: 10, description: "جزر طازج ومقرمش", image: prodPotatoes },
    ],
  },
  {
    id: "khedar-eltazeg",
    name: "خضار الطازج",
    category: "خضار",
    categoryId: "vegetables",
    image: storeVegetables,
    rating: 4.4,
    reviewCount: 190,
    deliveryTime: "25-35",
    deliveryFee: 10,
    products: [
      { id: "p42", name: "كيلو طماطم", price: 15, description: "طماطم طازة من المزرعة", image: prodTomatoes },
      { id: "p43", name: "كيلو بطاطس", price: 12, description: "بطاطس نظيفة ومختارة", image: prodPotatoes },
      { id: "p44", name: "كيلو خيار", price: 10, description: "خيار طازج ومقرمش", image: prodCucumber },
      { id: "p45", name: "كيلو بصل", price: 8, description: "بصل أحمر طازج", image: prodPotatoes },
      { id: "p46", name: "باكت سلطة جاهزة", price: 25, description: "خس + طماطم + خيار + جزر مقطعة", image: prodHerbs },
    ],
  },
  {
    id: "fawakih-elkhair",
    name: "فواكه الخير",
    category: "فواكه",
    categoryId: "fruits",
    image: storeFruits1,
    rating: 4.6,
    reviewCount: 280,
    deliveryTime: "25-35",
    deliveryFee: 12,
    products: [
      { id: "p58", name: "كيلو مانجو", price: 60, description: "مانجو عويسي طازة", image: prodMango },
      { id: "p59", name: "كيلو فراولة", price: 45, description: "فراولة طازة ومختارة", image: prodStrawberry },
      { id: "p60", name: "كيلو برتقال", price: 15, description: "برتقال بلدي حلو", image: prodOrangeBanana },
      { id: "p61", name: "كيلو موز", price: 20, description: "موز مستوي وطازج", image: prodOrangeBanana },
      { id: "p62", name: "كيلو عنب", price: 40, description: "عنب أحمر بدون بذر", image: prodGrapes },
    ],
  },
  {
    id: "fruits-plaza",
    name: "فروتس بلازا",
    category: "فواكه",
    categoryId: "fruits",
    image: storeFruits2,
    rating: 4.7,
    reviewCount: 210,
    deliveryTime: "20-30",
    deliveryFee: 10,
    products: [
      { id: "p63", name: "كيلو تفاح أحمر", price: 35, description: "تفاح أحمر مستورد", image: prodAppleKiwi },
      { id: "p64", name: "كيلو كيوي", price: 55, description: "كيوي طازج ومستورد", image: prodAppleKiwi },
      { id: "p65", name: "كيلو أناناس", price: 70, description: "أناناس طازج مقشر", image: prodPineapple },
      { id: "p66", name: "سلة فواكه مشكلة", price: 120, description: "تشكيلة فواكه موسمية 2 كيلو", image: prodFruitBasket },
      { id: "p67", name: "كيلو بطيخ مقطع", price: 25, description: "بطيخ أحمر مقطع جاهز", image: prodWatermelon },
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
