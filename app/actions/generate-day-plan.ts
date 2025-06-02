"use server"

import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { z } from "zod"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Ingredient spelling corrections
const ingredientCorrections: { [key: string]: string } = {
  aloo: "potato",
  pyaz: "onion",
  tamatar: "tomato",
  chawal: "rice",
  atta: "wheat flour",
  daal: "lentils",
  sabzi: "vegetables",
  masala: "spices",
  namak: "salt",
  tel: "oil",
  pani: "water",
  doodh: "milk",
  dahi: "yogurt",
  ghee: "clarified butter",
}

function correctIngredientSpelling(ingredients: string): string {
  let corrected = ingredients.toLowerCase()
  for (const [hindi, english] of Object.entries(ingredientCorrections)) {
    corrected = corrected.replace(new RegExp(hindi, "g"), english)
  }
  return corrected
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(", ")
}

// Data cleaning function for day plan
function cleanDayPlanData(rawData: any) {
  // If the response contains multiple plans
  if (rawData.plans && Array.isArray(rawData.plans)) {
    return rawData.plans.map((plan: any, index: number) => cleanSinglePlan(plan, index))
  }

  // If it's a single plan, create 3 variations
  const basePlan = cleanSinglePlan(rawData, 0)
  return [basePlan, createPlanVariation(basePlan, 1), createPlanVariation(basePlan, 2)]
}

function cleanSinglePlan(rawData: any, index: number) {
  const planNames = ["Comfort Food Plan", "Quick & Easy Plan", "Traditional Plan"]
  const planDescriptions = ["Hearty and satisfying meals", "Fast cooking, great taste", "Classic Indian flavors"]

  const meals = ["breakfast", "lunch", "dinner"]

  meals.forEach((meal) => {
    if (typeof rawData[meal] === "string") {
      rawData[meal] = {
        name: rawData[meal],
        description: `Simple ${meal} dish`,
        cookingTime: 20,
        ingredients: ["Basic ingredients"],
        steps: ["Simple cooking steps"],
      }
    } else if (!rawData[meal] || typeof rawData[meal] !== "object") {
      rawData[meal] = {
        name: `Simple ${meal.charAt(0).toUpperCase() + meal.slice(1)}`,
        description: `Easy ${meal} recipe`,
        cookingTime: 20,
        ingredients: ["Basic ingredients"],
        steps: ["Simple cooking steps"],
      }
    }

    const mealData = rawData[meal]
    mealData.name = mealData.name || `Simple ${meal}`
    mealData.description = mealData.description || `Easy ${meal} recipe`
    mealData.cookingTime = Number.parseInt(mealData.cookingTime) || 20
    mealData.ingredients = Array.isArray(mealData.ingredients) ? mealData.ingredients : ["Basic ingredients"]
    mealData.steps = Array.isArray(mealData.steps) ? mealData.steps : ["Simple cooking steps"]
  })

  rawData.totalCookingTime = Number.parseInt(rawData.totalCookingTime) || 60
  rawData.shoppingList = Array.isArray(rawData.shoppingList) ? rawData.shoppingList : []
  rawData.planName = planNames[index] || `Plan ${index + 1}`
  rawData.planDescription = planDescriptions[index] || "Delicious meal plan"

  return rawData
}

function createPlanVariation(basePlan: any, index: number) {
  const variations = [
    {
      planName: "Quick & Easy Plan",
      planDescription: "Fast cooking, great taste",
      breakfast: { ...basePlan.breakfast, name: "Quick " + basePlan.breakfast.name, cookingTime: 15 },
      lunch: { ...basePlan.lunch, name: "Easy " + basePlan.lunch.name, cookingTime: 20 },
      dinner: { ...basePlan.dinner, name: "Simple " + basePlan.dinner.name, cookingTime: 25 },
    },
    {
      planName: "Traditional Plan",
      planDescription: "Classic Indian flavors",
      breakfast: { ...basePlan.breakfast, name: "Traditional " + basePlan.breakfast.name, cookingTime: 25 },
      lunch: { ...basePlan.lunch, name: "Classic " + basePlan.lunch.name, cookingTime: 35 },
      dinner: { ...basePlan.dinner, name: "Authentic " + basePlan.dinner.name, cookingTime: 40 },
    },
  ]

  const variation = variations[index - 1] || variations[0]
  return {
    ...basePlan,
    ...variation,
    totalCookingTime: variation.breakfast.cookingTime + variation.lunch.cookingTime + variation.dinner.cookingTime,
  }
}

const DayPlanSchema = z.array(
  z.object({
    breakfast: z.object({
      name: z.string(),
      description: z.string(),
      cookingTime: z.number(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
    lunch: z.object({
      name: z.string(),
      description: z.string(),
      cookingTime: z.number(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
    dinner: z.object({
      name: z.string(),
      description: z.string(),
      cookingTime: z.number(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
    totalCookingTime: z.number(),
    shoppingList: z.array(z.string()),
    planName: z.string(),
    planDescription: z.string(),
  }),
)

function generateFallbackDayPlans(ingredients: string) {
  const mainIngredient = ingredients.split(",")[0].trim()

  const basePlan = {
    breakfast: {
      name: mainIngredient + " Paratha",
      description: "Easy stuffed bread",
      cookingTime: 20,
      ingredients: ["Wheat flour - 2 cups", mainIngredient + " - 1 cup", "Salt - as needed", "Oil - for cooking"],
      steps: ["Mix flour with water", "Make filling", "Roll and stuff", "Cook on pan", "Serve hot"],
    },
    lunch: {
      name: mainIngredient + " Rice",
      description: "Simple rice dish",
      cookingTime: 25,
      ingredients: ["Rice - 1 cup", mainIngredient + " - 1 cup", "Onion - 1 piece", "Salt - as needed"],
      steps: ["Wash rice", "Heat oil", "Add ingredients", "Cook together", "Serve hot"],
    },
    dinner: {
      name: mainIngredient + " Curry",
      description: "Tasty curry",
      cookingTime: 30,
      ingredients: [mainIngredient + " - 2 cups", "Onion - 2 pieces", "Tomato - 2 pieces", "Spices - as needed"],
      steps: ["Heat oil", "Add onions", "Add tomatoes", "Add spices", "Add main ingredient", "Cook well", "Serve"],
    },
    totalCookingTime: 75,
    shoppingList: ["Wheat flour", "Rice", "Onions", "Tomatoes"],
    planName: "Comfort Food Plan",
    planDescription: "Hearty and satisfying meals",
  }

  return [basePlan, createPlanVariation(basePlan, 1), createPlanVariation(basePlan, 2)]
}

export async function generateDayPlan(ingredients: string) {
  try {
    const correctedIngredients = correctIngredientSpelling(ingredients)

    const prompt = `
Create 3 different Indian meal plans for one day using these ingredients: "${correctedIngredients}".

IMPORTANT RULES:
- Create 3 DIFFERENT complete day plans
- Use VERY SIMPLE English words
- Each meal should have 5-7 easy steps
- Use simple measurements like "1 cup", "2 spoons"
- Give proper Indian dish names
- Make each plan unique and different

Your response must be valid JSON:
{
  "plans": [
    {
      "planName": "Comfort Food Plan",
      "planDescription": "Hearty and satisfying meals",
      "breakfast": {
        "name": "Dish Name",
        "description": "Simple description",
        "cookingTime": 20,
        "ingredients": ["Item 1 - 1 cup", "Item 2 - 2 spoons"],
        "steps": ["Step 1", "Step 2", "Step 3"]
      },
      "lunch": {
        "name": "Dish Name", 
        "description": "Simple description",
        "cookingTime": 25,
        "ingredients": ["Item 1 - 1 cup"],
        "steps": ["Step 1", "Step 2"]
      },
      "dinner": {
        "name": "Dish Name",
        "description": "Simple description", 
        "cookingTime": 30,
        "ingredients": ["Item 1 - 1 cup"],
        "steps": ["Step 1", "Step 2"]
      },
      "totalCookingTime": 75,
      "shoppingList": ["Extra item 1", "Extra item 2"]
    },
    {
      "planName": "Quick & Easy Plan",
      "planDescription": "Fast cooking, great taste",
      "breakfast": { ... },
      "lunch": { ... },
      "dinner": { ... },
      "totalCookingTime": 60,
      "shoppingList": ["Extra item 1"]
    },
    {
      "planName": "Traditional Plan", 
      "planDescription": "Classic Indian flavors",
      "breakfast": { ... },
      "lunch": { ... },
      "dinner": { ... },
      "totalCookingTime": 90,
      "shoppingList": ["Extra item 1", "Extra item 2"]
    }
  ]
}

CRITICAL: Create 3 completely different meal plans with different dishes for each plan.
`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      system:
        "You are a helpful assistant that creates 3 different Indian meal plans. Always return 3 unique plans with different dishes.",
      maxTokens: 6000,
    })

    try {
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonText = text.substring(jsonStart, jsonEnd)
        const parsedData = JSON.parse(jsonText)

        const cleanedData = cleanDayPlanData(parsedData)
        const validatedData = DayPlanSchema.parse(cleanedData)
        return validatedData
      }
    } catch (parseError) {
      console.error("Error parsing day plan JSON response:", parseError)
    }

    console.warn("Using fallback day plan generation")
    return generateFallbackDayPlans(ingredients)
  } catch (error) {
    console.error("Error generating day plan:", error)
    return generateFallbackDayPlans(ingredients)
  }
}
