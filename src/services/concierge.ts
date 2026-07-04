export type ConciergeRecommendation = {
  title: string;
  description: string;
  ingredients: Array<{ name: string; qty: string }>;
  steps: string[];
  estimatedCost: number;
  costPerServing: number;
  servings: number;
  time: number;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  recipeId: string;
  playlistId: string;
  couponIds: string[];
  toolIds: string[];
  artistId: string;
  vibe: string;
  budgetLabel: string;
  matchFound: boolean;
  recipeTitle: string;
  recipeCuisine: string;
  image: string;
  grocerySavings: number;
  musicVibe: string;
  summary?: string;
  source?: "openai" | "fallback";
};

type RecipeMatch = {
  keywords: string[];
  title: string;
  cuisine: string;
  description: string;
  ingredients: Array<{ name: string; qty: string }>;
  steps: string[];
  estimatedCost: number;
  costPerServing: number;
  servings: number;
  recipeId: string;
  playlistId: string;
  couponIds: string[];
  toolIds: string[];
  artistId: string;
  vibe: string;
  budgetLabel: string;
};

const recipeCatalog: RecipeMatch[] = [
  {
    keywords: ["fried chicken", "crispy chicken", "chicken fried"],
    title: "Crispy Fried Chicken",
    cuisine: "American",
    description: "A golden, crunchy fried chicken dinner with a quick pantry spice rub and a side of comfort-food energy.",
    ingredients: [{ name: "Chicken thighs", qty: "8 pieces" }, { name: "Flour", qty: "2 cups" }, { name: "Paprika", qty: "2 tbsp" }, { name: "Buttermilk", qty: "2 cups" }, { name: "Garlic powder", qty: "1 tbsp" }],
    steps: ["Soak the chicken in buttermilk and seasonings.", "Dredge in flour with paprika and garlic powder.", "Fry until deeply golden and cooked through.", "Rest briefly before serving with slaw or fries."],
    estimatedCost: 14.8,
    costPerServing: 3.7,
    servings: 4,
    recipeId: "r1",
    playlistId: "pl9",
    couponIds: ["c2", "c6"],
    toolIds: ["k4", "k16"],
    artistId: "a5",
    vibe: "Comforting and bold",
    budgetLabel: "Family-friendly under $20",
  },
  {
    keywords: ["burger", "burgers", "hamburger", "cheeseburger"],
    title: "Smoky Cheeseburgers",
    cuisine: "American",
    description: "Juicy burgers with a smoky char, melty cheese, and all the backyard flavor you want on a weeknight.",
    ingredients: [{ name: "Ground beef", qty: "1.5 lb" }, { name: "Cheddar slices", qty: "4" }, { name: "Burger buns", qty: "4" }, { name: "Pickles", qty: "1 jar" }, { name: "Onion", qty: "1" }],
    steps: ["Form the patties and season generously.", "Sear until caramelized and cooked through.", "Top with cheddar and toast the buns.", "Serve with pickles, onion, and fries."],
    estimatedCost: 13.2,
    costPerServing: 3.3,
    servings: 4,
    recipeId: "r2",
    playlistId: "pl10",
    couponIds: ["c1", "c11"],
    toolIds: ["k4", "k7"],
    artistId: "a10",
    vibe: "Casual and fun",
    budgetLabel: "Weeknight burger night",
  },
  {
    keywords: ["taco", "tacos", "taco night"],
    title: "Street-Style Tacos",
    cuisine: "Mexican",
    description: "Bright, fast, and festive tacos with a crisp finish and the kind of flavor that makes dinner feel special.",
    ingredients: [{ name: "Corn tortillas", qty: "12" }, { name: "Chicken or beef", qty: "1.25 lb" }, { name: "Cabbage", qty: "1 small head" }, { name: "Lime", qty: "2" }, { name: "Cilantro", qty: "1 bunch" }],
    steps: ["Cook the meat with taco seasoning until browned.", "Char the tortillas briefly to warm them.", "Pile on cabbage, cilantro, lime, and salsa.", "Serve family-style for a quick taco bar."],
    estimatedCost: 12.6,
    costPerServing: 3.15,
    servings: 4,
    recipeId: "r3",
    playlistId: "pl3",
    couponIds: ["c4", "c8"],
    toolIds: ["k6", "k18"],
    artistId: "a3",
    vibe: "Bright and festive",
    budgetLabel: "Budget-friendly for a crowd",
  },
  {
    keywords: ["pizza", "flatbread", "pizza night"],
    title: "Wood-Fired Pizza",
    cuisine: "Italian",
    description: "A crispy-edged pizza with gooey cheese and a bright tomato finish that feels like a treat any night of the week.",
    ingredients: [{ name: "Pizza dough", qty: "2 balls" }, { name: "Marinara", qty: "1 cup" }, { name: "Mozzarella", qty: "12 oz" }, { name: "Basil", qty: "1 bunch" }, { name: "Olive oil", qty: "2 tbsp" }],
    steps: ["Shape the dough and top with marinara and cheese.", "Bake until the crust is crisp and the edges blister.", "Finish with basil and a drizzle of olive oil.", "Slice and serve with a simple salad."],
    estimatedCost: 15.4,
    costPerServing: 3.85,
    servings: 4,
    recipeId: "r4",
    playlistId: "pl10",
    couponIds: ["c1", "c5"],
    toolIds: ["k1", "k17"],
    artistId: "a2",
    vibe: "Fun and shareable",
    budgetLabel: "Treat-yourself dinner",
  },
  {
    keywords: ["steak", "ribeye", "sirloin"],
    title: "Garlic Butter Steak",
    cuisine: "American",
    description: "A steakhouse-style dinner with a deeply seared crust and soft garlic butter finish.",
    ingredients: [{ name: "Steak", qty: "2 lb" }, { name: "Butter", qty: "3 tbsp" }, { name: "Garlic", qty: "4 cloves" }, { name: "Rosemary", qty: "1 sprig" }, { name: "Salt", qty: "to taste" }],
    steps: ["Season the steak generously and rest it at room temp.", "Sear in a hot pan until a crust forms.", "Finish with butter, garlic, and rosemary.", "Rest before slicing and serving."],
    estimatedCost: 24.5,
    costPerServing: 6.13,
    servings: 4,
    recipeId: "r5",
    playlistId: "pl7",
    couponIds: ["c2", "c12"],
    toolIds: ["k4", "k5"],
    artistId: "a11",
    vibe: "Bold and indulgent",
    budgetLabel: "Premium night in",
  },
  {
    keywords: ["salmon", "salmon fillet"],
    title: "Honey Glazed Salmon",
    cuisine: "Mediterranean",
    description: "Sweet, sticky, and bright salmon with a glossy glaze that feels polished without much effort.",
    ingredients: [{ name: "Salmon fillets", qty: "4" }, { name: "Honey", qty: "3 tbsp" }, { name: "Soy sauce", qty: "2 tbsp" }, { name: "Lemon", qty: "1" }, { name: "Garlic", qty: "2 cloves" }],
    steps: ["Whisk honey, soy sauce, lemon, and garlic into a glaze.", "Roast the salmon until just flaky.", "Brush with glaze during the final minutes.", "Serve with rice or roasted vegetables."],
    estimatedCost: 16.9,
    costPerServing: 4.23,
    servings: 4,
    recipeId: "r6",
    playlistId: "pl6",
    couponIds: ["c3", "c9"],
    toolIds: ["k12", "k14"],
    artistId: "a8",
    vibe: "Light and refined",
    budgetLabel: "Fresh dinner under $20",
  },
  {
    keywords: ["pasta", "spaghetti", "linguine", "mac and cheese"],
    title: "Creamy Tomato Basil Pasta",
    cuisine: "Italian",
    description: "A silky pasta with a quick tomato cream sauce and a fragrant basil finish.",
    ingredients: [{ name: "Pasta", qty: "12 oz" }, { name: "Tomatoes", qty: "2 cups" }, { name: "Cream", qty: "1 cup" }, { name: "Basil", qty: "1 bunch" }, { name: "Parmesan", qty: "4 oz" }],
    steps: ["Boil the pasta until al dente.", "Simmer tomatoes and cream into a glossy sauce.", "Toss in the pasta and basil.", "Finish with parmesan and black pepper."],
    estimatedCost: 11.4,
    costPerServing: 2.85,
    servings: 4,
    recipeId: "r7",
    playlistId: "pl1",
    couponIds: ["c1", "c5"],
    toolIds: ["k3", "k15"],
    artistId: "a1",
    vibe: "Warm and romantic",
    budgetLabel: "Comfort-first under $15",
  },
  {
    keywords: ["chili", "beef chili", "chili con carne"],
    title: "Texas Beef Chili",
    cuisine: "American",
    description: "Hearty, smoky chili with deep spice and a rich tomato base.",
    ingredients: [{ name: "Ground beef", qty: "1.5 lb" }, { name: "Beans", qty: "2 cans" }, { name: "Tomatoes", qty: "2 cans" }, { name: "Onion", qty: "1" }, { name: "Chili powder", qty: "2 tbsp" }],
    steps: ["Brown the beef with onion until savory.", "Add tomatoes, beans, and chili powder.", "Simmer until thick and flavorful.", "Serve with cheese, sour cream, or cornbread."],
    estimatedCost: 14.2,
    costPerServing: 3.55,
    servings: 4,
    recipeId: "r8",
    playlistId: "pl2",
    couponIds: ["c2", "c10"],
    toolIds: ["k4", "k11"],
    artistId: "a12",
    vibe: "Smoky and cozy",
    budgetLabel: "Great for leftovers",
  },
  {
    keywords: ["bbq ribs", "ribs", "barbecue ribs"],
    title: "Sticky BBQ Ribs",
    cuisine: "BBQ",
    description: "Tender, caramelized ribs with a glossy barbecue glaze and a backyard-friendly finish.",
    ingredients: [{ name: "Pork ribs", qty: "2 lb" }, { name: "BBQ sauce", qty: "1 cup" }, { name: "Brown sugar", qty: "2 tbsp" }, { name: "Paprika", qty: "1 tbsp" }, { name: "Garlic", qty: "3 cloves" }],
    steps: ["Season the ribs and slow-cook until tender.", "Brush with glaze and finish until sticky.", "Rest briefly before slicing.", "Serve with slaw or roasted potatoes."],
    estimatedCost: 19.8,
    costPerServing: 4.95,
    servings: 4,
    recipeId: "r9",
    playlistId: "pl2",
    couponIds: ["c4", "c6"],
    toolIds: ["k13", "k16"],
    artistId: "a13",
    vibe: "Smoky and celebratory",
    budgetLabel: "Weekend cookout energy",
  },
  {
    keywords: ["meatloaf", "meat loaf"],
    title: "Classic Meatloaf",
    cuisine: "American",
    description: "A comforting meatloaf with a sweet-tangy glaze and a cozy Sunday dinner feel.",
    ingredients: [{ name: "Ground beef", qty: "2 lb" }, { name: "Breadcrumbs", qty: "1 cup" }, { name: "Egg", qty: "2" }, { name: "Ketchup", qty: "1/2 cup" }, { name: "Onion", qty: "1" }],
    steps: ["Mix the meat with breadcrumbs, egg, and onion.", "Shape into a loaf and brush with glaze.", "Bake until cooked through and caramelized.", "Serve with mashed potatoes and green beans."],
    estimatedCost: 13.1,
    costPerServing: 3.28,
    servings: 4,
    recipeId: "r10",
    playlistId: "pl9",
    couponIds: ["c2", "c7"],
    toolIds: ["k4", "k17"],
    artistId: "a14",
    vibe: "Cozy and nostalgic",
    budgetLabel: "Easy comfort-food dinner",
  },
  {
    keywords: ["shrimp", "prawn", "shrimp scampi"],
    title: "Garlic Shrimp Scampi",
    cuisine: "Mediterranean",
    description: "Fast shrimp with butter, garlic, and lemon that feels restaurant-level in under 20 minutes.",
    ingredients: [{ name: "Shrimp", qty: "1.25 lb" }, { name: "Butter", qty: "4 tbsp" }, { name: "Garlic", qty: "4 cloves" }, { name: "Lemon", qty: "1" }, { name: "Parsley", qty: "1 bunch" }],
    steps: ["Sauté the shrimp until pink and just cooked.", "Add butter, garlic, and lemon juice.", "Toss until glossy and fragrant.", "Serve over pasta or toast."],
    estimatedCost: 15.7,
    costPerServing: 3.93,
    servings: 4,
    recipeId: "r11",
    playlistId: "pl6",
    couponIds: ["c3", "c9"],
    toolIds: ["k8", "k15"],
    artistId: "a15",
    vibe: "Bright and quick",
    budgetLabel: "Fast seafood night",
  },
  {
    keywords: ["sushi", "rolls", "poke"],
    title: "Easy Poke Bowl",
    cuisine: "Asian",
    description: "A fresh bowl with rice, crisp veggies, and a punchy sauce for an easy dinner that still feels special.",
    ingredients: [{ name: "Rice", qty: "2 cups" }, { name: "Salmon or tuna", qty: "1 lb" }, { name: "Cucumber", qty: "1" }, { name: "Avocado", qty: "2" }, { name: "Soy sauce", qty: "1/4 cup" }],
    steps: ["Cook the rice and chill it lightly.", "Dice the fish and vegetables.", "Assemble bowls with rice, fish, and toppings.", "Drizzle with soy sauce and sesame."],
    estimatedCost: 17.6,
    costPerServing: 4.4,
    servings: 4,
    recipeId: "r12",
    playlistId: "pl4",
    couponIds: ["c4", "c8"],
    toolIds: ["k8", "k10"],
    artistId: "a4",
    vibe: "Fresh and modern",
    budgetLabel: "Light and bright",
  },
  {
    keywords: ["sandwich", "grilled cheese", "club sandwich"],
    title: "Crispy Grilled Cheese",
    cuisine: "American",
    description: "Golden grilled cheese with a crunchy crust and a molten center perfect for a simple comfort meal.",
    ingredients: [{ name: "Bread", qty: "8 slices" }, { name: "Cheese", qty: "8 oz" }, { name: "Butter", qty: "4 tbsp" }, { name: "Tomato", qty: "2" }, { name: "Soup", qty: "2 cans" }],
    steps: ["Butter the bread and layer on cheese.", "Toast until crisp and deeply golden.", "Serve with tomato slices and soup.", "Pair with a quick salad if you want balance."],
    estimatedCost: 10.8,
    costPerServing: 2.7,
    servings: 4,
    recipeId: "r13",
    playlistId: "pl9",
    couponIds: ["c1", "c7"],
    toolIds: ["k4", "k17"],
    artistId: "a9",
    vibe: "Cozy and straightforward",
    budgetLabel: "Easy pantry dinner",
  },
  {
    keywords: ["ramen", "noodle", "udon"],
    title: "Miso Ramen Bowl",
    cuisine: "Asian",
    description: "Slurp-worthy noodles with savory broth, marinated eggs, and bright toppings.",
    ingredients: [{ name: "Ramen noodles", qty: "8 oz" }, { name: "Broth", qty: "4 cups" }, { name: "Eggs", qty: "4" }, { name: "Scallions", qty: "1 bunch" }, { name: "Miso paste", qty: "2 tbsp" }],
    steps: ["Simmer broth with miso until fragrant.", "Cook noodles and poach the eggs.", "Assemble bowls with noodles, broth, eggs, and scallions.", "Top with sesame seeds or chili crisp."],
    estimatedCost: 12.4,
    costPerServing: 3.1,
    servings: 4,
    recipeId: "r14",
    playlistId: "pl4",
    couponIds: ["c3", "c8"],
    toolIds: ["k8", "k10"],
    artistId: "a6",
    vibe: "Comforting and modern",
    budgetLabel: "Fast noodle night",
  },
  {
    keywords: ["stew", "pot roast", "braised"],
    title: "Slow Braised Pot Roast",
    cuisine: "American",
    description: "Tender beef simmered low and slow with onions, carrots, and herbs until it melts apart.",
    ingredients: [{ name: "Beef chuck", qty: "2.5 lb" }, { name: "Carrots", qty: "4" }, { name: "Potatoes", qty: "1 lb" }, { name: "Onion", qty: "2" }, { name: "Beef broth", qty: "3 cups" }],
    steps: ["Brown the roast and vegetables.", "Add broth and simmer low and slow.", "Cook until the meat shreds easily.", "Serve with potatoes and juices."],
    estimatedCost: 21.7,
    costPerServing: 5.43,
    servings: 4,
    recipeId: "r15",
    playlistId: "pl9",
    couponIds: ["c2", "c10"],
    toolIds: ["k4", "k11"],
    artistId: "a16",
    vibe: "Hearty and homey",
    budgetLabel: "Weekend comfort cook",
  },
  {
    keywords: ["soup", "tomato soup", "lentil soup"],
    title: "Roasted Tomato Soup",
    cuisine: "Mediterranean",
    description: "A velvety, roasted tomato soup with a warm, bright finish that works for lunch or dinner.",
    ingredients: [{ name: "Tomatoes", qty: "2 lb" }, { name: "Garlic", qty: "1 head" }, { name: "Cream", qty: "1/2 cup" }, { name: "Bread", qty: "1 loaf" }, { name: "Basil", qty: "1 bunch" }],
    steps: ["Roast the tomatoes and garlic until caramelized.", "Blend until smooth and add cream.", "Heat gently and finish with basil.", "Serve with grilled bread."],
    estimatedCost: 10.2,
    costPerServing: 2.55,
    servings: 4,
    recipeId: "r16",
    playlistId: "pl6",
    couponIds: ["c1", "c5"],
    toolIds: ["k8", "k14"],
    artistId: "a7",
    vibe: "Bright and soothing",
    budgetLabel: "Easy lunch or dinner",
  },
  {
    keywords: ["curry", "thai curry", "coconut curry"],
    title: "Coconut Curry Bowl",
    cuisine: "Indian",
    description: "A fragrant curry with coconut milk, spice, and a comforting bowlful of flavor.",
    ingredients: [{ name: "Coconut milk", qty: "1 can" }, { name: "Vegetables", qty: "3 cups" }, { name: "Garlic", qty: "3 cloves" }, { name: "Curry paste", qty: "2 tbsp" }, { name: "Rice", qty: "1 cup" }],
    steps: ["Sauté garlic and curry paste until aromatic.", "Add coconut milk and vegetables.", "Simmer until the vegetables are tender.", "Serve over rice with herbs."],
    estimatedCost: 12.9,
    costPerServing: 3.23,
    servings: 4,
    recipeId: "r17",
    playlistId: "pl8",
    couponIds: ["c3", "c10"],
    toolIds: ["k8", "k11"],
    artistId: "a4",
    vibe: "Warm and aromatic",
    budgetLabel: "Pantry-friendly dinner",
  },
  {
    keywords: ["quesadilla", "cheese quesadilla"],
    title: "Crispy Chicken Quesadillas",
    cuisine: "Mexican",
    description: "Crisp, cheesy quesadillas packed with savory chicken and a touch of spice.",
    ingredients: [{ name: "Tortillas", qty: "8" }, { name: "Chicken", qty: "1 lb" }, { name: "Cheese", qty: "2 cups" }, { name: "Salsa", qty: "1 cup" }, { name: "Onion", qty: "1" }],
    steps: ["Cook the chicken with onion and seasoning.", "Layer cheese and chicken onto tortillas.", "Toast until crisp and melty.", "Serve with salsa and sour cream."],
    estimatedCost: 13.7,
    costPerServing: 3.43,
    servings: 4,
    recipeId: "r18",
    playlistId: "pl3",
    couponIds: ["c4", "c8"],
    toolIds: ["k6", "k7"],
    artistId: "a3",
    vibe: "Crunchy and satisfying",
    budgetLabel: "Quick weeknight fix",
  },
  {
    keywords: ["fried rice", "rice bowl", "rice bowl dinner"],
    title: "Garlic Fried Rice Bowl",
    cuisine: "Asian",
    description: "A fast rice bowl with savory aromatics, bright greens, and a deeply satisfying finish.",
    ingredients: [{ name: "Cooked rice", qty: "3 cups" }, { name: "Eggs", qty: "2" }, { name: "Peas", qty: "1 cup" }, { name: "Scallions", qty: "1 bunch" }, { name: "Soy sauce", qty: "3 tbsp" }],
    steps: ["Sauté the rice until lightly crisp.", "Add eggs, peas, and scallions.", "Season with soy sauce and a touch of sesame oil.", "Serve hot and top with chili crisp if you like heat."],
    estimatedCost: 10.6,
    costPerServing: 2.65,
    servings: 4,
    recipeId: "r19",
    playlistId: "pl4",
    couponIds: ["c3", "c8"],
    toolIds: ["k8", "k10"],
    artistId: "a6",
    vibe: "Fast and savory",
    budgetLabel: "Great for leftovers",
  },
  {
    keywords: ["burrito", "burritos", "bean burrito"],
    title: "Loaded Bean Burritos",
    cuisine: "Mexican",
    description: "Soft burritos wrapped with beans, rice, salsa, and cheese for a no-fuss comfort dinner.",
    ingredients: [{ name: "Tortillas", qty: "8" }, { name: "Black beans", qty: "2 cans" }, { name: "Rice", qty: "2 cups" }, { name: "Cheese", qty: "2 cups" }, { name: "Salsa", qty: "1 cup" }],
    steps: ["Warm the beans and rice and season lightly.", "Fill tortillas with beans, rice, cheese, and salsa.", "Roll tightly and toast until golden.", "Serve with guacamole or sour cream."],
    estimatedCost: 11.8,
    costPerServing: 2.95,
    servings: 4,
    recipeId: "r20",
    playlistId: "pl3",
    couponIds: ["c4", "c10"],
    toolIds: ["k6", "k7"],
    artistId: "a3",
    vibe: "Hearty and easy",
    budgetLabel: "Simple pantry victory",
  },
];

const buildRecipeImage = (title: string, cuisine: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
      <rect width="1200" height="720" rx="40" fill="#111111" />
      <rect x="40" y="40" width="1120" height="640" rx="32" fill="url(#g)" />
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>
      <circle cx="900" cy="220" r="140" fill="rgba(255,255,255,0.14)" />
      <text x="90" y="250" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="700">${title}</text>
      <text x="90" y="330" fill="#fef3c7" font-family="Arial, sans-serif" font-size="34">${cuisine} • Mock recipe preview</text>
      <text x="90" y="560" fill="white" font-family="Arial, sans-serif" font-size="34">Fresh, quick, and budget-aware</text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getMusicVibe = (cuisine: string) => {
  const vibeMap: Record<string, string> = {
    American: "Classic comfort soul",
    Mexican: "Bright Latin grooves",
    Italian: "Warm jazz and bossa nova",
    BBQ: "Smoky soul and blues",
    Mediterranean: "Coastal chill beats",
    Asian: "Lo-fi and modern pop",
    Indian: "Rich world beats",
  };

  return vibeMap[cuisine] || "Chill and upbeat";
};

const getNormalizedPrompt = (text: string) => text.toLowerCase();

const getRecipeTime = (recipe: RecipeMatch) => {
  const title = recipe.title.toLowerCase();

  if (title.includes("slow") || title.includes("ribs") || title.includes("pot roast")) return 180;
  if (title.includes("meatloaf") || title.includes("chili")) return 60;
  if (title.includes("salmon") || title.includes("shrimp") || title.includes("quesadilla")) return 20;
  if (title.includes("pizza") || title.includes("burger") || title.includes("tacos")) return 25;
  if (title.includes("pasta") || title.includes("fried chicken")) return 35;

  return Math.max(15, recipe.steps.length * 6 + 10);
};

const parseNumericTime = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }
  return 0;
};

const parseServings = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : 4;
  }
  return 4;
};

const parseCost = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  }
  return 0;
};

const normalizeRecipe = (recipe: Partial<ConciergeRecommendation> & { title?: string; description?: string; ingredients?: Array<{ name?: string; qty?: string; item?: string; quantity?: string }>; steps?: string[]; prepTime?: number | string; cookTime?: number | string; totalTime?: number | string; servings?: number | string; cuisine?: string; estimatedCost?: number | string; costPerServing?: number | string; vibe?: string; summary?: string; }): ConciergeRecommendation => {
  const fallback = matchRecipe(recipe.title || "");
  const title = recipe.title || fallback.title;
  const description = recipe.description || fallback.description;
  const ingredients = (recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients.map((ingredient) => ({
    name: ingredient.name || ingredient.item || "Ingredient",
    qty: ingredient.qty || ingredient.quantity || "to taste",
  })) : fallback.ingredients);
  const steps = (recipe.steps && recipe.steps.length > 0 ? recipe.steps : fallback.steps);
  const estimatedCost = parseCost(recipe.estimatedCost);
  const costPerServing = parseCost(recipe.costPerServing);
  const servings = parseServings(recipe.servings);
  const prepTime = parseNumericTime(recipe.prepTime);
  const cookTime = parseNumericTime(recipe.cookTime);
  const totalTime = parseNumericTime(recipe.totalTime);
  const cuisine = recipe.cuisine || fallback.recipeCuisine;
  const vibe = recipe.vibe || fallback.vibe;
  const summary = recipe.summary || description;

  return {
    ...fallback,
    title,
    description,
    ingredients,
    steps,
    estimatedCost: estimatedCost || fallback.estimatedCost,
    costPerServing: costPerServing || fallback.costPerServing,
    servings: servings || fallback.servings,
    prepTime: prepTime || fallback.prepTime,
    cookTime: cookTime || fallback.cookTime,
    totalTime: totalTime || fallback.totalTime,
    recipeTitle: title,
    recipeCuisine: cuisine,
    vibe,
    summary,
    source: "openai",
    time: totalTime || prepTime + cookTime || fallback.time,
    image: buildRecipeImage(title, cuisine),
  };
};

const parseRecipePayload = (content: string) => {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

export const getConciergeRecipe = async (prompt: string): Promise<ConciergeRecommendation> => {
  try {
    const response = await fetch("/api/concierge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Unable to reach concierge service");
    }

    const data = await response.json();
    const recipePayload = data?.recipe;

    if (!recipePayload) {
      throw new Error("No recipe returned");
    }

    return normalizeRecipe(recipePayload);
  } catch {
    return matchRecipe(prompt);
  }
};

export const matchRecipe = (text: string): ConciergeRecommendation => {
  const normalized = getNormalizedPrompt(text);

  const match = recipeCatalog.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));

  if (match) {
    return {
      ...match,
      title: `Recipe match: ${match.title}`,
      description: `${match.description} This recommendation was selected from your request so the concierge feels responsive and personal.`,
      matchFound: true,
      recipeTitle: match.title,
      recipeCuisine: match.cuisine,
      image: buildRecipeImage(match.title, match.cuisine),
      grocerySavings: Number((match.estimatedCost * 0.24).toFixed(2)),
      musicVibe: getMusicVibe(match.cuisine),
      time: getRecipeTime(match),
      prepTime: Math.max(10, Math.round(getRecipeTime(match) * 0.35)),
      cookTime: Math.max(10, Math.round(getRecipeTime(match) * 0.65)),
      totalTime: getRecipeTime(match),
      summary: match.description,
      source: "fallback",
    };
  }

  return {
    title: "No recipe found",
    description: "Try a more common dish like fried chicken, burgers, tacos, pizza, steak, salmon, pasta, chili, BBQ ribs, meatloaf, or shrimp so I can match a recipe for you.",
    ingredients: [{ name: "Try a different prompt", qty: "—" }],
    steps: ["Share a dish name, a few ingredients, or a cuisine style."],
    estimatedCost: 0,
    costPerServing: 0,
    servings: 0,
    recipeId: "",
    playlistId: "pl9",
    couponIds: [],
    toolIds: [],
    artistId: "a5",
    vibe: "Helpful and flexible",
    budgetLabel: "No match yet",
    matchFound: false,
    recipeTitle: "No recipe found",
    recipeCuisine: "Unknown",
    image: buildRecipeImage("No recipe found", "Unknown"),
    grocerySavings: 0,
    musicVibe: "Helpful and flexible",
    time: 0,
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    summary: "Try a more common dish name so I can generate a tailored recipe.",
    source: "fallback",
  };
};

export const buildConciergeRecommendation = (text: string): ConciergeRecommendation => matchRecipe(text);
