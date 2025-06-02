"use server"

import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { z } from "zod"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Analytics tracking for failures
interface AnalyticsEvent {
  timestamp: string
  event: string
  details: any
  sessionId: string
}

// In-memory analytics store (in production, this would be a database)
let analyticsStore: AnalyticsEvent[] = []

function trackEvent(event: string, details: any = {}) {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const analyticsEvent: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    event,
    details,
    sessionId,
  }

  analyticsStore.push(analyticsEvent)
  console.log(`📊 Analytics: ${event}`, details)

  // Keep only last 1000 events to prevent memory issues
  if (analyticsStore.length > 1000) {
    analyticsStore = analyticsStore.slice(-1000)
  }
}

// Function to get analytics summary
export function getAnalyticsSummary() {
  const now = Date.now()
  const last24Hours = analyticsStore.filter((event) => now - new Date(event.timestamp).getTime() < 24 * 60 * 60 * 1000)

  const events = last24Hours.reduce(
    (acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalRequests = events["recipe_search_started"] || 0
  const groqSuccesses = events["groq_api_success"] || 0
  const groqFailures = events["groq_api_failure"] || 0
  const jsonParseFailures = events["json_parse_failure"] || 0
  const schemaValidationFailures = events["schema_validation_failure"] || 0
  const fallbackUsed = events["fallback_recipes_used"] || 0

  const groqSuccessRate = totalRequests > 0 ? ((groqSuccesses / totalRequests) * 100).toFixed(2) : "0"
  const fallbackRate = totalRequests > 0 ? ((fallbackUsed / totalRequests) * 100).toFixed(2) : "0"

  return {
    totalRequests,
    groqSuccesses,
    groqFailures,
    jsonParseFailures,
    schemaValidationFailures,
    fallbackUsed,
    groqSuccessRate: `${groqSuccessRate}%`,
    fallbackRate: `${fallbackRate}%`,
    last24HourEvents: events,
    allTimeEvents: analyticsStore.length,
  }
}

// Comprehensive Indian dish database for realistic results
const indianDishDatabase = {
  potato: ["Aloo Gobi", "Aloo Paratha", "Aloo Tikki", "Aloo Matar", "Bombay Potato", "Aloo Baingan", "Aloo Palak"],
  onion: ["Pyaz Ki Sabzi", "Onion Pakoda", "Onion Curry", "Pyaz Ka Paratha", "Onion Bhaji", "Onion Raita"],
  tomato: ["Tamatar Ki Sabzi", "Tomato Rice", "Tomato Curry", "Tamatar Ka Shorba", "Tomato Chutney", "Tomato Soup"],
  rice: ["Jeera Rice", "Vegetable Pulao", "Lemon Rice", "Coconut Rice", "Biryani", "Curd Rice", "Tamarind Rice"],
  dal: ["Dal Tadka", "Dal Fry", "Moong Dal", "Masoor Dal", "Chana Dal", "Dal Makhani", "Sambar", "Rasam"],
  paneer: ["Paneer Butter Masala", "Palak Paneer", "Paneer Tikka", "Matar Paneer", "Kadai Paneer", "Shahi Paneer"],
  chicken: ["Chicken Curry", "Butter Chicken", "Chicken Biryani", "Tandoori Chicken", "Chicken Tikka", "Chicken Korma"],
  vegetables: ["Mixed Vegetable Curry", "Sabzi", 'Vegetable Pulao", Bhindi Masala', "Baingan Bharta", "Aloo Gobi"],
  bread: ["Roti", "Naan", "Paratha", "Puri", "Bhatura", "Kulcha", "Roomali Roti"],
  yogurt: ["Raita", "Kadhi", "Lassi", "Dahi Bhalla", "Shrikhand", "Chaas"],
  lentils: ["Dal Tadka", "Sambar", "Rasam", "Khichdi", "Vada", "Idli", "Dosa"],
  flour: ["Roti", "Paratha", "Puri", "Bhatura", "Naan", "Halwa", "Ladoo"],
  milk: ["Kheer", "Rabri", "Basundi", "Kulfi", "Payasam", "Rasmalai"],
  fruits: ["Fruit Chaat", "Mango Lassi", "Aamras", "Fruit Cream", "Fruit Custard", "Fruit Salad"],
  nuts: ["Badam Milk", "Kaju Katli", "Badam Halwa", "Pista Kulfi", "Chikki", "Gajak"],
  spices: ["Garam Masala", "Biryani", "Curry", "Masala Chai", "Tadka Dal", "Spiced Rice"],
}

// Additional dish categories for more variety
const regionalDishes = {
  north: ["Chole Bhature", "Rajma Chawal", "Kadhi Pakora", "Butter Chicken", "Paneer Tikka", "Aloo Paratha"],
  south: ["Dosa", "Idli Sambar", "Uttapam", "Rasam", "Appam", "Pongal", "Bisi Bele Bath"],
  east: ["Macher Jhol", "Rasgulla", "Mishti Doi", "Luchi Aloor Dom", "Pitha", "Chingri Malai Curry"],
  west: ["Dhokla", "Pav Bhaji", "Vada Pav", "Puran Poli", "Modak", "Shrikhand", "Undhiyu"],
  street: ["Pani Puri", "Bhel Puri", "Samosa", "Kachori", "Jalebi", "Chaat", "Dabeli", "Vada Pav"],
}

// Recipe complexity levels
const complexityLevels = {
  easy: { cookTime: [15, 25], prepTime: [5, 15], steps: [6, 10] },
  medium: { cookTime: [25, 40], prepTime: [10, 20], steps: [8, 12] },
  hard: { cookTime: [40, 60], prepTime: [15, 30], steps: [10, 15] },
}

// Meal timing logic
function getMealTypeFromTime(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return "breakfast"
  if (hour >= 11 && hour < 16) return "lunch"
  if (hour >= 16 && hour < 21) return "dinner"
  return "snack"
}

// Enhanced ingredient parsing with duplicate removal
function parseIngredients(input: string): string[] {
  const corrections: { [key: string]: string } = {
    aloo: "Potato",
    aaloo: "Potato",
    alu: "Potato",
    potato: "Potato",
    pyaz: "Onion",
    pyaaz: "Onion",
    onion: "Onion",
    tamatar: "Tomato",
    tamaatar: "Tomato",
    tomato: "Tomato",
    chawal: "Rice",
    rice: "Rice",
    atta: "Wheat Flour",
    flour: "Wheat Flour",
    daal: "Lentils",
    dal: "Lentils",
    lentils: "Lentils",
    sabzi: "Vegetables",
    vegetables: "Vegetables",
    masala: "Spices",
    spices: "Spices",
    namak: "Salt",
    salt: "Salt",
    tel: "Oil",
    oil: "Oil",
    pani: "Water",
    water: "Water",
    doodh: "Milk",
    milk: "Milk",
    dahi: "Yogurt",
    yogurt: "Yogurt",
    ghee: "Clarified Butter",
    krela: "Karela",
    karela: "Karela",
    bhindi: "Okra",
    okra: "Okra",
    shimla: "Bell Pepper",
    adrak: "Ginger",
    ginger: "Ginger",
    lehsun: "Garlic",
    garlic: "Garlic",
    palak: "Spinach",
    spinach: "Spinach",
    matar: "Peas",
    peas: "Peas",
    gobi: "Cauliflower",
    cauliflower: "Cauliflower",
    baingan: "Eggplant",
    eggplant: "Eggplant",
  }

  const ingredientList = input
    .toLowerCase()
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => corrections[item] || (item.length > 2 ? item.charAt(0).toUpperCase() + item.slice(1) : item))
    .filter((item) => item.length > 2)

  // Remove duplicates by converting to Set and back to array
  return Array.from(new Set(ingredientList))
}

// Smart recipe generation based on ingredients
function generateIntelligentRecipes(ingredients: string[], includeExtra: boolean, targetCount = 6): any[] {
  trackEvent("fallback_recipes_used", {
    ingredientCount: ingredients.length,
    includeExtra,
    targetCount,
    ingredients: ingredients.slice(0, 5), // Log first 5 ingredients only
  })

  const recipes = []
  const usedDishes = new Set()
  const currentMealType = getMealTypeFromTime()

  // Add some default ingredients if the list is too short
  if (ingredients.length < 3) {
    ingredients = [...ingredients, "onion", "tomato", "spices"]
  }

  // Generate target number of unique recipes
  for (let i = 0; i < targetCount; i++) {
    const recipe = createSmartRecipe(ingredients, includeExtra, usedDishes, currentMealType, i)
    recipes.push(recipe)
    usedDishes.add(recipe.name)
  }

  return recipes
}

function createSmartRecipe(
  userIngredients: string[],
  includeExtra: boolean,
  usedDishes: Set<string>,
  preferredMealType: string,
  index: number,
): any {
  // Add randomness to ingredient selection
  const shuffledIngredients = [...userIngredients].sort(() => Math.random() - 0.5)

  // Select main ingredient with randomness
  const mainIngredient = shuffledIngredients[index % shuffledIngredients.length] || shuffledIngredients[0] || "potato"

  // Get possible dishes for this ingredient
  let possibleDishes = indianDishDatabase[mainIngredient.toLowerCase() as keyof typeof indianDishDatabase] || [
    `${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} Curry`,
  ]

  // Add regional dishes for more variety
  const regions = Object.keys(regionalDishes)
  const randomRegion = regions[Math.floor(Math.random() * regions.length)] as keyof typeof regionalDishes
  possibleDishes = [...possibleDishes, ...regionalDishes[randomRegion]]

  // Shuffle possible dishes for randomness
  possibleDishes = possibleDishes.sort(() => Math.random() - 0.5)

  // Select unique dish
  let dishName = possibleDishes[0]
  let counter = 0
  while (usedDishes.has(dishName) && counter < possibleDishes.length) {
    dishName = possibleDishes[counter % possibleDishes.length]
    counter++
  }

  // Determine meal type intelligently but with randomness
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"]
  let mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)]

  // Some dishes have natural meal types
  if (dishName.includes("Paratha") || dishName.includes("Poha") || dishName.includes("Upma")) {
    mealType = "breakfast"
  } else if (dishName.includes("Rice") || dishName.includes("Pulao") || dishName.includes("Biryani")) {
    mealType = Math.random() > 0.5 ? "lunch" : "dinner"
  } else if (dishName.includes("Pakoda") || dishName.includes("Tikka") || dishName.includes("Samosa")) {
    mealType = "snack"
  }

  // Determine difficulty and timing with randomness
  const difficulties = ["easy", "medium", "hard"]
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as keyof typeof complexityLevels
  const complexity = complexityLevels[difficulty]

  const cookingTime =
    complexity.cookTime[0] + Math.floor(Math.random() * (complexity.cookTime[1] - complexity.cookTime[0]))
  const prepTime =
    complexity.prepTime[0] + Math.floor(Math.random() * (complexity.prepTime[1] - complexity.prepTime[0]))
  const stepCount = complexity.steps[0] + Math.floor(Math.random() * (complexity.steps[1] - complexity.steps[0]))

  // Generate realistic ingredients
  const baseIngredients = generateRealisticIngredients(mainIngredient, dishName)
  const extraIngredients = includeExtra ? generateExtraIngredients(dishName) : []

  // Generate cooking steps with simple English
  const steps = generateSimpleCookingSteps(dishName, mainIngredient, stepCount)

  return {
    id: `recipe-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: dishName,
    mealType,
    cookingTime,
    prepTime,
    servings: 2 + Math.floor(Math.random() * 4), // 2-5 servings
    difficulty,
    ingredients: baseIngredients,
    steps,
    description: `Delicious ${dishName.toLowerCase()} made with ${mainIngredient} and traditional Indian spices`,
    needsExtraIngredients: extraIngredients.length > 0,
    extraIngredients,
  }
}

function generateRealisticIngredients(mainIngredient: string, dishName: string): string[] {
  const baseIngredients = [`${mainIngredient.charAt(0).toUpperCase() + mainIngredient.slice(1)} - 2 cups`]

  // Common Indian cooking ingredients
  const commonIngredients = [
    "Onion - 1 large",
    "Tomato - 2 medium",
    "Ginger garlic paste - 1 tablespoon",
    "Green chilies - 2-3 pieces",
    "Cumin seeds - 1 teaspoon",
    "Mustard seeds - 1/2 teaspoon",
    "Turmeric powder - 1/2 teaspoon",
    "Red chili powder - 1 teaspoon",
    "Coriander powder - 1 teaspoon",
    "Garam masala - 1/2 teaspoon",
    "Salt - to taste",
    "Oil - 2 tablespoons",
    "Fresh coriander - for garnish",
    "Curry leaves - 8-10",
    "Asafoetida - a pinch",
    "Cardamom - 2-3 pods",
    "Cinnamon - 1 inch stick",
    "Cloves - 2-3",
    "Bay leaf - 1-2",
    "Black pepper - 1/2 teaspoon",
    "Ghee - 1 tablespoon",
    "Lemon juice - 1 teaspoon",
    "Yogurt - 1/4 cup",
    "Coconut - 2 tablespoons grated",
  ]

  // Dish-specific ingredients
  if (dishName.includes("Rice") || dishName.includes("Pulao") || dishName.includes("Biryani")) {
    baseIngredients.push("Basmati rice - 1 cup", "Water - 2 cups", "Bay leaves - 2 pieces")
  }

  if (dishName.includes("Dal")) {
    baseIngredients.push("Lentils - 1 cup", "Water - 3 cups", "Asafoetida - pinch")
  }

  if (dishName.includes("Paneer")) {
    baseIngredients.push("Paneer - 200g", "Cream - 2 tablespoons")
  }

  if (dishName.includes("Paratha")) {
    baseIngredients.push("Wheat flour - 2 cups", "Water - as needed", "Ghee - for cooking")
  }

  // Shuffle and add 6-8 random common ingredients
  const shuffled = commonIngredients.sort(() => Math.random() - 0.5)
  baseIngredients.push(...shuffled.slice(0, 6 + Math.floor(Math.random() * 3)))

  return baseIngredients
}

function generateExtraIngredients(dishName: string): string[] {
  const extraOptions = [
    "Cashews - 10-12 pieces",
    "Coconut milk - 1/2 cup",
    "Yogurt - 1/4 cup",
    "Lemon juice - 1 tablespoon",
    "Mint leaves - few sprigs",
    "Curry leaves - 8-10 pieces",
    "Fennel seeds - 1/2 teaspoon",
    "Cinnamon stick - 1 inch",
    "Cardamom - 2-3 pods",
    "Cloves - 2-3 pieces",
    "Saffron - a pinch",
    "Rose water - 1 teaspoon",
    "Kewra water - 1/2 teaspoon",
    "Dried fenugreek leaves - 1 teaspoon",
    "Poppy seeds - 1 teaspoon",
  ]

  // Shuffle and select 2-4 extra ingredients
  const shuffled = extraOptions.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 3))
}

// Simplified cooking steps in very simple English
function generateSimpleCookingSteps(dishName: string, mainIngredient: string, stepCount: number): string[] {
  const simpleSteps = [
    "Heat oil in a pan",
    "Add cumin seeds and let them sizzle",
    "Add chopped onions and cook until golden",
    "Add ginger garlic paste and cook for 1 minute",
    "Add chopped tomatoes and cook until soft",
    "Add turmeric, red chili powder, and salt",
    "Mix all spices well",
    `Add ${mainIngredient.toLowerCase()} and mix gently`,
    "Add a little water if needed",
    "Cover and cook on low heat",
    "Cook until tender",
    "Add garam masala and mix",
    "Taste and add more salt if needed",
    "Garnish with fresh coriander",
    "Serve hot with rice or roti",
  ]

  // Dish-specific simple steps
  if (dishName.includes("Rice") || dishName.includes("Pulao") || dishName.includes("Biryani")) {
    simpleSteps.splice(0, 0, "Wash rice and soak for 20 minutes", "Drain the water from rice")
  }

  if (dishName.includes("Dal")) {
    simpleSteps.splice(0, 0, "Wash lentils 3-4 times", "Soak lentils for 15 minutes")
  }

  // Return the requested number of steps
  return simpleSteps.slice(0, Math.max(stepCount, 8)) // Minimum 8 steps
}

// Data cleaning function (keeping existing)
function cleanRecipeData(rawData: any) {
  if (!rawData.recipes || !Array.isArray(rawData.recipes)) {
    trackEvent("schema_validation_failure", {
      reason: "missing_recipes_array",
      dataStructure: typeof rawData,
      hasRecipes: !!rawData.recipes,
    })
    return rawData
  }

  rawData.recipes = rawData.recipes.map((recipe: any) => {
    if (typeof recipe.mealType === "string" && recipe.mealType.includes("|")) {
      const mealTypes = recipe.mealType.split("|")
      const validMealTypes = ["breakfast", "lunch", "dinner", "snack"]
      recipe.mealType = mealTypes.find((type: string) => validMealTypes.includes(type.trim())) || "lunch"
    }

    if (typeof recipe.difficulty === "string" && recipe.difficulty.includes("|")) {
      const difficulties = recipe.difficulty.split("|")
      const validDifficulties = ["easy", "medium", "hard"]
      recipe.difficulty = difficulties.find((diff: string) => validDifficulties.includes(diff.trim())) || "easy"
    }

    recipe.cookingTime = Number.parseInt(recipe.cookingTime) || 30
    recipe.prepTime = Number.parseInt(recipe.prepTime) || 15
    recipe.servings = Number.parseInt(recipe.servings) || 4
    recipe.ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
    recipe.steps = Array.isArray(recipe.steps) ? recipe.steps : []
    recipe.extraIngredients = Array.isArray(recipe.extraIngredients) ? recipe.extraIngredients : []
    recipe.needsExtraIngredients = Boolean(recipe.needsExtraIngredients)

    return recipe
  })

  return rawData
}

const RecipeSchema = z.object({
  recipes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      cookingTime: z.number(),
      prepTime: z.number().optional().default(15),
      servings: z.number().optional().default(4),
      difficulty: z.enum(["easy", "medium", "hard"]),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
      description: z.string(),
      needsExtraIngredients: z.boolean().optional().default(false),
      extraIngredients: z.array(z.string()).optional().default([]),
    }),
  ),
})

// Improved JSON extraction function
function extractValidJSON(text: string): any {
  // Try to find JSON using regex pattern matching
  const jsonRegex = /{[\s\S]*?recipes[\s\S]*?}/g
  const matches = text.match(jsonRegex)

  if (matches && matches.length > 0) {
    try {
      // Try each match until we find valid JSON
      for (const match of matches) {
        try {
          return JSON.parse(match)
        } catch (e) {
          // Continue to next match
        }
      }
    } catch (e) {
      // Fall through to next method
    }
  }

  // Try to find JSON using bracket counting
  let openBrackets = 0
  let startPos = -1
  let endPos = -1

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (openBrackets === 0) {
        startPos = i
      }
      openBrackets++
    } else if (text[i] === "}") {
      openBrackets--
      if (openBrackets === 0 && startPos !== -1) {
        endPos = i + 1
        try {
          const jsonCandidate = text.substring(startPos, endPos)
          return JSON.parse(jsonCandidate)
        } catch (e) {
          // Not valid JSON
          throw new Error("Could not extract valid JSON from response")
        }
      }
    }
  }

  throw new Error("No JSON found in response")
}

export async function searchRecipes(ingredients: string, includeExtra = false, mealTypeFilter?: string) {
  const startTime = Date.now()

  trackEvent("recipe_search_started", {
    ingredients: ingredients.substring(0, 100), // Log first 100 chars only
    includeExtra,
    mealTypeFilter,
    timestamp: new Date().toISOString(),
  })

  try {
    // Parse and analyze ingredients intelligently
    const parsedIngredients = parseIngredients(ingredients)

    // Generate intelligent recipes first (as backup)
    const intelligentRecipes = generateIntelligentRecipes(parsedIngredients, includeExtra)

    // Try AI generation with better prompting
    const randomSeed = Math.floor(Math.random() * 10000)
    const prompt = `
You are an expert Indian chef with 20 years of experience. Create exactly 6 unique, authentic Indian recipes using these ingredients: "${parsedIngredients.join(", ")}".

REQUIREMENTS:
- Generate EXACTLY 6 different recipes
- Use authentic Indian dish names (like "Aloo Gobi", "Dal Tadka", "Jeera Rice")
- Each recipe must have 8-12 detailed cooking steps in VERY SIMPLE ENGLISH
- Use proper Indian measurements and cooking techniques
- Include realistic cooking times and difficulty levels
- Focus on traditional Indian home cooking
- Be creative and varied - don't repeat similar dishes
- Keep cooking steps very simple and easy to understand

IMPORTANT: Return ONLY valid JSON with no additional text. The response must be parseable by JSON.parse().

Recipe Structure (JSON format):
{
  "recipes": [
    {
      "id": "recipe-${randomSeed}-1",
      "name": "Authentic Indian Dish Name",
      "mealType": "lunch",
      "cookingTime": 25,
      "prepTime": 10,
      "servings": 4,
      "difficulty": "easy",
      "ingredients": ["Ingredient 1 - 1 cup", "Ingredient 2 - 2 tablespoons"],
      "steps": ["Heat oil in pan", "Add cumin seeds", "Add onions and cook"],
      "description": "Traditional Indian dish description",
      "needsExtraIngredients": false,
      "extraIngredients": []
    }
  ]
}

CRITICAL: Return ONLY the JSON object above with 6 recipes. No explanations or additional text.
`

    const groqStartTime = Date.now()

    try {
      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt,
        system: `You are a JSON-generating assistant. Return ONLY valid JSON with no additional text. Your response must be parseable by JSON.parse(). Use very simple English for cooking steps.`,
        maxTokens: 8000,
        temperature: 0.9, // Higher temperature for more randomness
      })

      const groqEndTime = Date.now()
      const groqResponseTime = groqEndTime - groqStartTime

      trackEvent("groq_api_success", {
        responseTime: groqResponseTime,
        responseLength: text.length,
        model: "llama-3.1-8b-instant",
        maxTokens: 8000,
        temperature: 0.9,
      })

      try {
        // Use the improved JSON extraction function
        const parsedData = extractValidJSON(text)

        trackEvent("json_parse_success", {
          responseLength: text.length,
          parsedDataStructure: typeof parsedData,
          hasRecipes: !!parsedData.recipes,
          recipeCount: parsedData.recipes?.length || 0,
        })

        const cleanedData = cleanRecipeData(parsedData)

        // Ensure we have exactly 6 recipes
        if (cleanedData.recipes && cleanedData.recipes.length >= 3) {
          try {
            const validatedData = RecipeSchema.parse(cleanedData)

            trackEvent("schema_validation_success", {
              recipeCount: validatedData.recipes.length,
              totalTime: Date.now() - startTime,
            })

            // Filter recipes by meal type if specified
            const filteredRecipes = mealTypeFilter
              ? validatedData.recipes.filter((recipe) => recipe.mealType === mealTypeFilter)
              : validatedData.recipes

            // If filtering by meal type and we have less than 5, generate more
            if (mealTypeFilter && filteredRecipes.length < 5) {
              const additionalRecipes = generateIntelligentRecipes(parsedIngredients, includeExtra)
                .filter((recipe) => recipe.mealType === mealTypeFilter)
                .slice(0, 5 - filteredRecipes.length)

              trackEvent("additional_recipes_generated", {
                mealType: mealTypeFilter,
                originalCount: filteredRecipes.length,
                additionalCount: additionalRecipes.length,
              })

              return [...filteredRecipes, ...additionalRecipes].slice(0, 6)
            }

            trackEvent("recipe_search_completed", {
              source: "groq",
              finalRecipeCount: filteredRecipes.slice(0, 6).length,
              totalTime: Date.now() - startTime,
              filtered: !!mealTypeFilter,
            })

            // Return exactly 6 recipes
            return filteredRecipes.slice(0, 6)
          } catch (schemaError) {
            trackEvent("schema_validation_failure", {
              error: schemaError instanceof Error ? schemaError.message : "Unknown schema error",
              recipeCount: cleanedData.recipes?.length || 0,
              dataStructure: typeof cleanedData,
            })
          }
        } else {
          trackEvent("insufficient_recipes", {
            recipeCount: cleanedData.recipes?.length || 0,
            hasRecipes: !!cleanedData.recipes,
          })
        }
      } catch (parseError) {
        trackEvent("json_parse_failure", {
          error: parseError instanceof Error ? parseError.message : "Unknown parse error",
          responseLength: text.length,
          responsePreview: text.substring(0, 200),
        })
        console.error("AI parsing failed, using intelligent generation:", parseError)
      }
    } catch (groqError) {
      const groqEndTime = Date.now()
      const groqResponseTime = groqEndTime - groqStartTime

      trackEvent("groq_api_failure", {
        error: groqError instanceof Error ? groqError.message : "Unknown Groq error",
        responseTime: groqResponseTime,
        model: "llama-3.1-8b-instant",
      })
      console.error("Groq API failed:", groqError)
    }

    // Return intelligent recipes if AI fails
    trackEvent("recipe_search_completed", {
      source: "fallback",
      finalRecipeCount: intelligentRecipes.length,
      totalTime: Date.now() - startTime,
    })

    // If filtering by meal type, ensure we have at least 5
    if (mealTypeFilter) {
      const filteredFallback = intelligentRecipes.filter((recipe) => recipe.mealType === mealTypeFilter)
      if (filteredFallback.length < 5) {
        const additionalRecipes = generateIntelligentRecipes(parsedIngredients, includeExtra, 8)
          .filter((recipe) => recipe.mealType === mealTypeFilter)
          .slice(0, 5 - filteredFallback.length)
        return [...filteredFallback, ...additionalRecipes].slice(0, 6)
      }
      return filteredFallback.slice(0, 6)
    }

    return intelligentRecipes
  } catch (error) {
    trackEvent("recipe_search_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      totalTime: Date.now() - startTime,
    })
    console.error("Recipe search error:", error)
    // Fallback to intelligent generation
    const parsedIngredients = parseIngredients(ingredients)
    return generateIntelligentRecipes(parsedIngredients, includeExtra)
  }
}
