// Foody Music — single source of truth seed data

const CDN = "https://d64gsuwffb70l.cloudfront.net/";
export const IMG = {
  hero: CDN + "6a3cdd2b6d854d2dc292b0cc_1782374169497_67025f5f.jpg",
  recipes: [
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373947604_cf2e5321.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373918995_28f1d362.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373908256_b215b938.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373982045_0ba7b538.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373923869_8ae92cda.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373911330_5aaabeee.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373944243_da0d7ef8.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373920209_5a0144ec.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782373980796_b2d465df.png",
  ],
  artists: [
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374086988_d41d2b79.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374015961_bf6094b5.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374003884_4e2a9a1a.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374052237_e98e8717.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374053876_eab78bad.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374004957_695a4ca5.jpg",
  ],
  kitchen: [
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374135656_1b467c72.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374110528_63a1fbf8.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374111815_a41a6dc0.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374117453_bddead9d.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374149398_5f1dde81.png",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374113547_bd051585.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374116169_e92470df.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374116840_612ef789.jpg",
    CDN + "6a3cdd2b6d854d2dc292b0cc_1782374117357_38ed5e16.jpg",
  ],
};

export type Recipe = {
  id: string;
  title: string;
  image: string;
  cuisine: string;
  tags: string[];
  time: number;
  servings: number;
  costPerServing: number;
  mealCost: number;
  savings: number;
  sponsored?: boolean;
  description: string;
  ingredients: { name: string; qty: string; aisle: string }[];
  steps: string[];
  playlist: string;
};

const cuisineList = ["Italian", "Mexican", "American", "Asian", "Mediterranean", "Indian", "BBQ", "Comfort"];
const recipeNames = [
  "Seasonal Mushroom Risotto", "Smoky Birria Tacos", "Honey Glazed Salmon", "Thai Basil Chicken",
  "Charred Lemon Branzino", "Butter Chicken Masala", "Brisket Burnt Ends", "Loaded Mac & Cheese",
  "Wild Mushroom Pizza", "Korean BBQ Bowl", "Herb Roast Chicken", "Spicy Shrimp Linguine",
  "Lamb Gyro Platter", "Coconut Curry Bowl", "Pulled Pork Sliders", "Garlic Butter Steak",
  "Margherita Flatbread", "Carnitas Burrito", "Miso Glazed Cod", "Falafel Mezze Bowl",
  "Texas Beef Chili", "Three Cheese Lasagna", "Teriyaki Salmon Bowl", "Cajun Jambalaya",
];

export const recipes: Recipe[] = recipeNames.map((title, i) => {
  const cps = +(2.5 + (i % 7) * 0.9).toFixed(2);
  const servings = 4 + (i % 3);
  return {
    id: "r" + (i + 1),
    title,
    image: IMG.recipes[i % IMG.recipes.length],
    cuisine: cuisineList[i % cuisineList.length],
    tags: [cuisineList[i % cuisineList.length], i % 2 ? "Family" : "Date Night", i % 3 ? "Quick" : "Weekend"],
    time: 20 + (i % 6) * 10,
    servings,
    costPerServing: cps,
    mealCost: +(cps * servings).toFixed(2),
    savings: +(3 + (i % 5) * 1.5).toFixed(2),
    sponsored: i % 6 === 0,
    description:
      "An AI-curated crowd pleaser balanced for flavor, budget, and the perfect soundtrack. Restaurant-quality results from a simple shopping list.",
    ingredients: [
      { name: "Olive oil", qty: "2 tbsp", aisle: "Pantry" },
      { name: "Garlic cloves", qty: "4", aisle: "Produce" },
      { name: "Yellow onion", qty: "1", aisle: "Produce" },
      { name: "Protein of choice", qty: "1.5 lb", aisle: "Meat & Seafood" },
      { name: "Fresh herbs", qty: "1 bunch", aisle: "Produce" },
      { name: "Sea salt & pepper", qty: "to taste", aisle: "Pantry" },
      { name: "Stock or broth", qty: "2 cups", aisle: "Canned Goods" },
      { name: "Butter", qty: "3 tbsp", aisle: "Dairy" },
      { name: "Lemon", qty: "1", aisle: "Produce" },
    ],
    steps: [
      "Prep all ingredients: dice the onion, mince the garlic, and pat your protein dry.",
      "Heat olive oil in a large pan over medium-high until shimmering.",
      "Sear the protein 3–4 minutes per side until golden, then set aside.",
      "Soften onion and garlic in the same pan, scraping up the browned bits.",
      "Deglaze with stock and reduce by half to build a rich base.",
      "Return protein, finish with butter, herbs, and a squeeze of lemon.",
      "Plate, garnish, and press play on the matched playlist. Enjoy!",
    ],
    playlist: cuisineList[i % cuisineList.length] + " Dinner",
  };
});

export type Coupon = {
  id: string;
  brand: string;
  discount: string;
  detail: string;
  expiry: string;
  category: string;
  sponsored?: boolean;
};
const brands = ["FreshMart", "GreenGrocer", "DairyBest", "PrimeMeats", "PantryCo", "SnackHaus", "BeanWorks", "OliveGold", "SpiceRoad", "BakeHouse", "SeaCatch", "HarvestLane"];
export const coupons: Coupon[] = Array.from({ length: 24 }, (_, i) => ({
  id: "c" + (i + 1),
  brand: brands[i % brands.length],
  discount: ["$1.50 OFF", "20% OFF", "$3 OFF", "BOGO", "$0.75 OFF", "15% OFF"][i % 6],
  detail: ["any 2 items", "your produce order", "select meats", "snack packs", "dairy items", "pantry staples"][i % 6],
  expiry: ["Jun 30", "Jul 12", "Jul 20", "Aug 02"][i % 4],
  category: ["Produce", "Meat", "Dairy", "Pantry", "Snacks", "Bakery"][i % 6],
  sponsored: i % 5 === 0,
}));

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  sponsored?: boolean;
};
const kitchenNames = [
  "Cordierite Pizza Stone", "Damascus Chef Knife", "Enameled Dutch Oven", "Cast Iron Skillet",
  "Digital Meat Thermometer", "High-Speed Blender", "Stand Mixer Pro", "Carbon Steel Wok",
  "Mandoline Slicer", "Espresso Machine", "Sous Vide Precision", "Ceramic Knife Set",
  "Charcoal Kamado Grill", "Immersion Blender", "Copper Saucepan", "Air Fryer XL",
  "Bamboo Cutting Board", "Stainless Mixing Bowls", "Silicone Spatula Set", "Pepper Mill Grinder",
];
const kitchenCats = ["Cookware", "Knives", "Grills", "Appliances", "Bakeware", "Tools"];
export const products: Product[] = kitchenNames.map((name, i) => ({
  id: "k" + (i + 1),
  name,
  image: IMG.kitchen[i % IMG.kitchen.length],
  price: +(19.99 + (i % 8) * 24.5).toFixed(2),
  rating: +(4 + (i % 10) / 10).toFixed(1),
  reviews: 120 + i * 37,
  category: kitchenCats[i % kitchenCats.length],
  brand: ["ChefCraft", "BladeWorks", "FlameKing", "HomeAce", "BakePro", "ToolBox"][i % 6],
  sponsored: i % 7 === 0,
}));

export type FoodProduct = {
  id: string; name: string; price: number; brand: string; sponsored?: boolean;
};
export type Brand = {
  id: string; name: string; tagline: string; category: string; sponsored?: boolean; products: FoodProduct[];
};
export const foodBrands: Brand[] = brands.map((name, i) => ({
  id: "b" + (i + 1),
  name,
  tagline: ["Farm to fork freshness", "Bold everyday flavor", "Pantry essentials, elevated", "Crafted with care"][i % 4],
  category: ["Produce", "Snacks", "Dairy", "Pantry", "Meats", "Bakery"][i % 6],
  sponsored: i % 3 === 0,
  products: Array.from({ length: 3 }, (_, j) => ({
    id: `b${i + 1}p${j + 1}`,
    name: ["Signature Blend", "Family Pack", "Organic Line", "Chef's Reserve"][(i + j) % 4],
    price: +(2.99 + j * 1.5).toFixed(2),
    brand: name,
    sponsored: j === 0 && i % 2 === 0,
  })),
}));

export type Artist = {
  id: string; name: string; genre: string; image: string; followers: string; promoted?: boolean;
};
const artistNames = ["Luna Verde", "The Sage Collective", "Marco Rivera", "Indigo Bloom", "Khalil & Co.", "Velvet Static", "Aria Sol", "Nightshade", "Coast Drive", "Ember Lane", "Saffron Keys", "Dust & Gold", "Neon Olive", "River Mute", "Golden Hour", "Wildflower Hum"];
export const artists: Artist[] = artistNames.map((name, i) => ({
  id: "a" + (i + 1),
  name,
  genre: ["Indie", "Jazz", "Latin", "Lo-fi", "Soul", "Electronic", "Folk", "R&B"][i % 8],
  image: IMG.artists[i % IMG.artists.length],
  followers: (50 + i * 13) + "K",
  promoted: i % 4 === 0,
}));

export type Playlist = {
  id: string; title: string; mood: string; tracks: number; spotifyId: string; note: string;
};
export const playlists: Playlist[] = [
  { id: "pl1", title: "Italian Dinner", mood: "Romantic & Warm", tracks: 42, spotifyId: "37i9dQZF1DX9wa6XirBPv8", note: "Soft Italian jazz and acoustic guitar to slow down dinner." },
  { id: "pl2", title: "BBQ Vibes", mood: "Smoky & Upbeat", tracks: 58, spotifyId: "37i9dQZF1DX0BcQWzuB7ZO", note: "Southern rock and blues for the backyard grill." },
  { id: "pl3", title: "Taco Night", mood: "Festive & Bright", tracks: 64, spotifyId: "37i9dQZF1DX10zKzsJ2jva", note: "Latin grooves to spice up taco Tuesday." },
  { id: "pl4", title: "Asian Fusion", mood: "Cool & Modern", tracks: 50, spotifyId: "37i9dQZF1DWZ2sE3kTp1Hk", note: "Lo-fi and downtempo for wok nights." },
  { id: "pl5", title: "Sunday Brunch", mood: "Easy Mornings", tracks: 47, spotifyId: "37i9dQZF1DX6ziVCJnEm59", note: "Mellow soul and folk for slow brunches." },
  { id: "pl6", title: "Mediterranean Mezze", mood: "Sun-soaked", tracks: 39, spotifyId: "37i9dQZF1DX1s9knjP51Oa", note: "Coastal acoustic and global folk." },
  { id: "pl7", title: "Date Night", mood: "Intimate Glow", tracks: 55, spotifyId: "37i9dQZF1DX50QitC6Oqtn", note: "Smooth R&B for two." },
  { id: "pl8", title: "Indian Feast", mood: "Rich & Vibrant", tracks: 44, spotifyId: "37i9dQZF1DX5q67ZpWyRrZ", note: "Fusion beats with classical accents." },
  { id: "pl9", title: "Comfort Food", mood: "Cozy & Nostalgic", tracks: 61, spotifyId: "37i9dQZF1DWXe9gFZP0gtP", note: "Warm classics for rainy days." },
  { id: "pl10", title: "Pizza Party", mood: "Fun & Loud", tracks: 70, spotifyId: "37i9dQZF1DX2sUQwD7tbmL", note: "Upbeat pop-punk for pizza night." },
  { id: "pl11", title: "Late Night Bites", mood: "Smoky Lounge", tracks: 36, spotifyId: "37i9dQZF1DX4wta20PHgwo", note: "Lounge jazz for midnight snacks." },
  { id: "pl12", title: "Morning Prep", mood: "Bright Focus", tracks: 48, spotifyId: "37i9dQZF1DX0SM0LYsmbMT", note: "Upbeat indie to fuel meal prep." },
];

// AI Concierge seed prompts + rich responses
export const suggestedPrompts = [
  "What should I cook tonight?",
  "Feed my family of 5 for under $25.",
  "I only have chicken, rice, and broccoli.",
  "Plan a BBQ for 20 people.",
];

export type ConciergeResponse = {
  intro: string;
  recipeId: string;
  shoppingList: { name: string; qty: string }[];
  coupons: string[];
  affiliate: { name: string; deal: string }[];
  playlistId: string;
  artistIds: string[];
  brandProducts: { name: string; brand: string; price: number }[];
  kitchenIds: string[];
  cost: { mealCost: number; savings: number; perServing: number; servings: number };
};

export const conciergeResponses: Record<string, ConciergeResponse> = {
  [suggestedPrompts[0]]: {
    intro: "Tonight calls for something cozy yet impressive. Here's a chef-balanced plan with the perfect soundtrack.",
    recipeId: "r1",
    shoppingList: [
      { name: "Arborio rice", qty: "1 lb" }, { name: "Cremini mushrooms", qty: "12 oz" },
      { name: "Parmesan", qty: "4 oz" }, { name: "White wine", qty: "1 cup" },
      { name: "Vegetable stock", qty: "4 cups" }, { name: "Shallots", qty: "2" },
      { name: "Butter", qty: "4 tbsp" }, { name: "Fresh thyme", qty: "1 bunch" },
    ],
    coupons: ["c1", "c5", "c9"],
    affiliate: [{ name: "FreshMart Delivery", deal: "$10 off first order" }, { name: "GreenGrocer", deal: "Free produce box" }],
    playlistId: "pl1",
    artistIds: ["a1", "a3"],
    brandProducts: [{ name: "Aged Parmesan", brand: "DairyBest", price: 6.49 }, { name: "Cold-Press Olive Oil", brand: "OliveGold", price: 8.99 }],
    kitchenIds: ["k3", "k15"],
    cost: { mealCost: 18.4, savings: 7.25, perServing: 4.6, servings: 4 },
  },
  [suggestedPrompts[1]]: {
    intro: "Budget-friendly and crowd-pleasing. This feeds 5 generously while staying under $25 — coupons stacked.",
    recipeId: "r8",
    shoppingList: [
      { name: "Elbow pasta", qty: "2 lb" }, { name: "Sharp cheddar", qty: "1 lb" },
      { name: "Milk", qty: "1 qt" }, { name: "Butter", qty: "1 stick" },
      { name: "Bacon", qty: "8 oz" }, { name: "Breadcrumbs", qty: "1 cup" },
      { name: "Onion", qty: "1" }, { name: "Garlic powder", qty: "1 jar" },
    ],
    coupons: ["c2", "c6", "c11"],
    affiliate: [{ name: "PantryCo Bundle", deal: "Buy 3 save $5" }, { name: "DairyBest", deal: "20% off cheese" }],
    playlistId: "pl9",
    artistIds: ["a5", "a7"],
    brandProducts: [{ name: "Family Pasta Pack", brand: "PantryCo", price: 3.99 }, { name: "Block Cheddar", brand: "DairyBest", price: 5.49 }],
    kitchenIds: ["k4", "k18"],
    cost: { mealCost: 23.1, savings: 9.4, perServing: 4.62, servings: 5 },
  },
  [suggestedPrompts[2]]: {
    intro: "Three ingredients, infinite potential. Here's a fast, flavor-packed stir-fry using exactly what you have.",
    recipeId: "r4",
    shoppingList: [
      { name: "Soy sauce", qty: "1 bottle" }, { name: "Garlic", qty: "1 head" },
      { name: "Sesame oil", qty: "1 bottle" }, { name: "Green onion", qty: "1 bunch" },
      { name: "Ginger", qty: "1 knob" }, { name: "Chili flakes", qty: "1 jar" },
    ],
    coupons: ["c3", "c7"],
    affiliate: [{ name: "FreshMart", deal: "$5 off sauces" }],
    playlistId: "pl4",
    artistIds: ["a2", "a6"],
    brandProducts: [{ name: "Toasted Sesame Oil", brand: "SpiceRoad", price: 4.29 }],
    kitchenIds: ["k8", "k5"],
    cost: { mealCost: 11.8, savings: 4.5, perServing: 2.95, servings: 4 },
  },
  [suggestedPrompts[3]]: {
    intro: "Time to feed a crowd! This BBQ plan scales to 20 with a smoky playlist and stacked savings.",
    recipeId: "r7",
    shoppingList: [
      { name: "Beef brisket", qty: "12 lb" }, { name: "BBQ rub", qty: "2 jars" },
      { name: "Burger buns", qty: "40" }, { name: "Coleslaw mix", qty: "3 bags" },
      { name: "BBQ sauce", qty: "3 bottles" }, { name: "Corn on cob", qty: "20" },
      { name: "Charcoal", qty: "20 lb" }, { name: "Pickles", qty: "2 jars" },
    ],
    coupons: ["c4", "c8", "c12"],
    affiliate: [{ name: "PrimeMeats Wholesale", deal: "$25 off bulk brisket" }, { name: "FlameKing Fuel", deal: "BOGO charcoal" }],
    playlistId: "pl2",
    artistIds: ["a4", "a8"],
    brandProducts: [{ name: "Pit Master Rub", brand: "SpiceRoad", price: 7.99 }, { name: "Smoky BBQ Sauce", brand: "PantryCo", price: 4.49 }],
    kitchenIds: ["k13", "k5"],
    cost: { mealCost: 168.5, savings: 42.0, perServing: 8.43, servings: 20 },
  },
};

export const adminRevenue = [
  { stream: "Subscriptions", amount: 18420, color: "#f59e0b" },
  { stream: "Grocery Affiliate", amount: 9240, color: "#10b981" },
  { stream: "Kitchen+ Affiliate", amount: 6730, color: "#1db954" },
  { stream: "Sponsored Coupons", amount: 4120, color: "#fbbf24" },
  { stream: "Sponsored Recipes", amount: 3380, color: "#34d399" },
  { stream: "Artist Promotions", amount: 2150, color: "#a78bfa" },
  { stream: "Brand Advertising", amount: 5600, color: "#f97316" },
  { stream: "Kitchen Placements", amount: 1980, color: "#22d3ee" },
];

export const adminMetrics = {
  subscribers: 3842,
  mrr: 19160,
  affiliateRevenue: 17950,
  topRecipes: ["Smoky Birria Tacos", "Brisket Burnt Ends", "Truffle Risotto", "Butter Chicken"],
};
