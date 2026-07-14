// ---------------------------------------------------------------------------
// BASE PRODUCT CATALOGUE
// ---------------------------------------------------------------------------
// Every retail/wholesale price below has been cross-checked line-by-line
// against the two handwritten price sheets. Items that were crossed out on
// the sheet (spinach, amaranth, fenugreek leaves, garlic, ginger) are
// intentionally NOT included — they were discontinued by the shop owner.
//
// `inStock` is the default availability. The owner can flip this live from
// the dashboard; that override is layered on top of this file at runtime
// (see utils/storage.js + App.jsx), so this file never needs to be edited
// just to mark something out of stock.
//
// The owner can also add brand-new vegetables from the dashboard — those are
// stored separately (see utils/storage.js) and merged with this list, so
// this file only needs editing for permanent catalogue changes.

export const PRODUCTS = [
  { id: 1, name: "Onion", te: "ఉల్లిపాయ", emoji: "🧅", cat: "Roots & Tubers", price: 60, wholesalePrice: 45, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/onion_1783693545934.png" },
  { id: 2, name: "Potato", te: "బంగాళదుంప", emoji: "🥔", cat: "Roots & Tubers", price: 30, wholesalePrice: 22, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/potato_1783693556029.png" },
  { id: 3, name: "Tomato", te: "టమాట", emoji: "🍅", cat: "Other Vegetables", price: 50, wholesalePrice: 38, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/tomato_1783693568358.png" },
  { id: 4, name: "Green Brinjal", te: "పచ్చి వంకాయ", emoji: "🍆", cat: "Other Vegetables", price: 20, wholesalePrice: 15, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/green_brinjal_1783693579886.png" },
  { id: 5, name: "Lady's Finger", te: "బెండకాయ", emoji: "🫛", cat: "Other Vegetables", price: 30, wholesalePrice: 22, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/okra_1783693590479.png" },
  { id: 6, name: "Carrot", te: "క్యారెట్", emoji: "🥕", cat: "Roots & Tubers", price: 50, wholesalePrice: 38, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/carrot_1783693603450.png" },
  { id: 7, name: "Radish", te: "ముల్లంగి", emoji: "🫚", cat: "Roots & Tubers", price: 30, wholesalePrice: 22, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/radish_1783693614459.png" },
  { id: 8, name: "Beetroot", te: "బీట్‌రూట్", emoji: "🍠", cat: "Roots & Tubers", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/beetroot_1783693624043.png" },
  { id: 9, name: "Cabbage", te: "క్యాబేజీ", emoji: "🥬", cat: "Other Vegetables", price: 20, wholesalePrice: 15, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/cabbage_1783693634635.png" },
  { id: 10, name: "Cauliflower", te: "కాలీఫ్లవర్", emoji: "🥦", cat: "Other Vegetables", price: 30, unit: "piece", organic: false, bulkAvailable: false, todayDelta: 0, inStock: true, image: "/images/cauliflower_1783693645566.png" },
  { id: 11, name: "Cucumber", te: "దోసకాయ", emoji: "🥒", cat: "Gourds & Squash", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/cucumber_1783693669259.png" },
  { id: 12, name: "Bitter Gourd", te: "కాకరకాయ", emoji: "🥒", cat: "Gourds & Squash", price: 60, wholesalePrice: 45, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/bitter_gourd_1783693681822.png" },
  { id: 13, name: "Ridge Gourd", te: "బీరకాయ", emoji: "🥒", cat: "Gourds & Squash", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/ridge_gourd_1783693695256.png" },
  { id: 14, name: "Bottle Gourd", te: "సొరకాయ", emoji: "🥒", cat: "Gourds & Squash", price: 60, wholesalePrice: 45, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/bottle_gourd_1783693706956.png" },
  { id: 15, name: "Beans", te: "చిక్కుళ్ళు", emoji: "🫘", cat: "Beans & Pods", price: 90, wholesalePrice: 68, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/green_beans_1783693716685.png" },
  { id: 16, name: "Drumstick", te: "మునగకాడ", emoji: "🌿", cat: "Beans & Pods", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/drumstick_1783693728016.png" },
  { id: 17, name: "Green Chillies", te: "పచ్చిమిర్చి", emoji: "🌶️", cat: "Other Vegetables", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "/images/green_chillies_1783693739070.png" },
  { id: 18, name: "Ivy Gourd", te: "దొండకాయ", emoji: "🥒", cat: "Gourds & Squash", price: 20, wholesalePrice: 15, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Ivy+Gourd" },
  { id: 19, name: "Ankur Brinjal", te: "చిన్న వంకాయ", emoji: "🍆", cat: "Other Vegetables", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Ankur+Brinjal" },
  { id: 20, name: "Broad Beans", te: "చిక్కుడు కాయ", emoji: "🫘", cat: "Beans & Pods", price: 60, wholesalePrice: 45, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Broad+Beans" },
  { id: 21, name: "Cluster Beans", te: "గోరుచిక్కుడు", emoji: "🫘", cat: "Beans & Pods", price: 80, wholesalePrice: 60, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Cluster+Beans" },
  { id: 22, name: "Black-eyed Peas", te: "అలసందలు", emoji: "🫘", cat: "Beans & Pods", price: 50, wholesalePrice: 38, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Black-eyed+Peas" },
  { id: 23, name: "Anapakaya", te: "అనపకాయ", emoji: "🎃", cat: "Gourds & Squash", price: 80, wholesalePrice: 60, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Anapakaya" },
  { id: 24, name: "Curry Leaves", te: "కరివేపాకు", emoji: "🌿", cat: "Leafy & Herbs", price: 15, unit: "100g", organic: false, bulkAvailable: false, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Curry+Leaves" },
  { id: 25, name: "Mint", te: "పుదీనా", emoji: "🌿", cat: "Leafy & Herbs", price: 20, unit: "piece", organic: false, bulkAvailable: false, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Mint" },
  { id: 26, name: "Coriander", te: "కొత్తిమీర", emoji: "🌱", cat: "Leafy & Herbs", price: 15, unit: "piece", organic: false, bulkAvailable: false, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Coriander" },
  { id: 27, name: "Taro Root", te: "చేమదుంప", emoji: "🍠", cat: "Roots & Tubers", price: 40, wholesalePrice: 30, unit: "kg", organic: false, bulkAvailable: true, todayDelta: 0, inStock: true, image: "https://placehold.co/400x300?text=Taro+Root" },
];

// Handy default template used by the "Add Vegetable" admin form.
export const BLANK_PRODUCT_DRAFT = {
  name: "",
  te: "",
  emoji: "🥬",
  cat: "Other Vegetables",
  price: "",
  wholesalePrice: "",
  unit: "kg",
  bulkAvailable: true,
  inStock: true,
  image: "",
};

// Next id to hand out to an owner-added vegetable. Custom items are id'd
// starting at 1000 so they never collide with the base catalogue above.
export const CUSTOM_ID_START = 1000;
