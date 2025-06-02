"use client"

import { Clock, ChefHat, Users, ChevronDown, ChevronUp, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Recipe {
  id: string
  name: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  cookingTime: number
  difficulty: "easy" | "medium" | "hard"
  ingredients: string[]
  steps: string[]
  description: string
  needsExtraIngredients?: boolean
  extraIngredients?: string[]
  prepTime?: number
  servings?: number
}

interface RecipeCardProps {
  recipe: Recipe
  onBookChef: () => void
  showBookChef?: boolean
}

const mealTypeColors = {
  breakfast: "bg-yellow-100 text-yellow-800",
  lunch: "bg-green-100 text-green-800",
  dinner: "bg-blue-100 text-blue-800",
  snack: "bg-purple-100 text-purple-800",
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
}

// Dish emojis based on recipe name
const getDishEmoji = (recipeName: string): string => {
  const name = recipeName.toLowerCase()
  if (name.includes("rice") || name.includes("biryani") || name.includes("pulao")) return "🍚"
  if (name.includes("curry") || name.includes("dal") || name.includes("sabzi")) return "🍛"
  if (name.includes("roti") || name.includes("chapati") || name.includes("naan")) return "🫓"
  if (name.includes("tea") || name.includes("chai")) return "🍵"
  if (name.includes("paratha") || name.includes("bread")) return "🥖"
  if (name.includes("samosa") || name.includes("pakora")) return "🥟"
  if (name.includes("sweet") || name.includes("dessert") || name.includes("halwa")) return "🍮"
  if (name.includes("soup")) return "🍲"
  if (name.includes("salad")) return "🥗"
  if (name.includes("egg")) return "🥚"
  return "🍽️"
}

// Capitalize first letter of each ingredient
const capitalizeIngredient = (ingredient: string): string => {
  return ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
}

// Random pro tips
const proTips = {
  curry: [
    "Add a pinch of sugar to balance the flavors.",
    "Use fresh ginger and garlic for the best taste.",
    "Let the curry simmer on low heat for a richer flavor.",
  ],
  dal: [
    "Soak lentils for at least 30 minutes before cooking.",
    "Add a squeeze of lemon juice for extra tanginess.",
    "Use a pressure cooker to save time and energy.",
  ],
  rice: [
    "Wash rice thoroughly before cooking to remove starch.",
    "Add a teaspoon of ghee for fluffy rice.",
    "Let the rice rest for 10 minutes after cooking before serving.",
  ],
  default: ["Taste and adjust salt at each step.", "Keep all items ready before cooking.", "Use medium heat always."],
}

const getRandomProTips = (dishName: string): string[] => {
  const name = dishName.toLowerCase()
  let tips = proTips.default

  if (name.includes("curry")) tips = proTips.curry
  else if (name.includes("dal")) tips = proTips.dal
  else if (name.includes("rice")) tips = proTips.rice

  // Shuffle and select 3 random tips
  const shuffled = [...tips].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export function RecipeCard({ recipe, onBookChef, showBookChef = false }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const dishEmoji = getDishEmoji(recipe.name)
  const randomTips = getRandomProTips(recipe.name)

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm ${isExpanded ? "col-span-full" : ""}`}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Recipe Header with Emoji */}
        <div className="mb-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-3xl sm:text-4xl">{dishEmoji}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">{recipe.name}</h3>
              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{recipe.description}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge className={`text-xs px-2 py-0.5 ${mealTypeColors[recipe.mealType]}`}>
              {recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}
            </Badge>
            <Badge className={`text-xs px-2 py-0.5 ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
            </Badge>
            {recipe.needsExtraIngredients && (
              <Badge variant="outline" className="border-orange-300 text-orange-600 text-xs px-2 py-0.5">
                + Extra
              </Badge>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            <div className="text-center p-1.5 bg-gray-50/80 backdrop-blur-sm rounded-lg">
              <Clock className="h-4 w-4 text-orange-600 mx-auto mb-0.5" />
              <div className="font-semibold text-sm">{recipe.cookingTime}m</div>
            </div>
            <div className="text-center p-1.5 bg-gray-50/80 backdrop-blur-sm rounded-lg">
              <Users className="h-4 w-4 text-green-600 mx-auto mb-0.5" />
              <div className="font-semibold text-sm">{recipe.servings || 4}</div>
            </div>
            <div className="text-center p-1.5 bg-gray-50/80 backdrop-blur-sm rounded-lg">
              <ChefHat className="h-4 w-4 text-blue-600 mx-auto mb-0.5" />
              <div className="font-semibold text-sm">{recipe.prepTime || 15}m</div>
            </div>
          </div>
        </div>

        {!isExpanded ? (
          // Collapsed View
          <div>
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">What You Need:</h4>
              <div className="space-y-0.5">
                {recipe.ingredients.slice(0, 4).map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 truncate">{capitalizeIngredient(ingredient)}</span>
                  </div>
                ))}
                {recipe.ingredients.length > 4 && (
                  <div className="text-orange-600 font-medium text-sm">+{recipe.ingredients.length - 4} More</div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">How to Make:</h4>
              <div className="space-y-0.5">
                {recipe.steps.slice(0, 2).map((step, index) => (
                  <div key={index} className="flex space-x-2">
                    <div className="flex-shrink-0 w-4 h-4 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-600 text-sm line-clamp-2">{step}</span>
                  </div>
                ))}
                <div className="text-orange-600 font-medium text-sm ml-6">+{recipe.steps.length - 2} More Steps</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setIsExpanded(true)}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-1.5 text-sm"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Full Recipe
              </Button>
              {showBookChef && (
                <Button
                  onClick={onBookChef}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 px-4 text-sm"
                >
                  Get Chef
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Expanded View
          <div className="space-y-3">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
                All Ingredients
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-1.5 bg-gray-50/80 backdrop-blur-sm rounded-lg"
                  >
                    <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-900 text-sm">{capitalizeIngredient(ingredient)}</span>
                  </div>
                ))}
              </div>

              {recipe.extraIngredients && recipe.extraIngredients.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold text-orange-800 mb-1.5">Also Need:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {recipe.extraIngredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-1.5 bg-orange-50/80 backdrop-blur-sm rounded-lg"
                      >
                        <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0"></div>
                        <span className="text-orange-800 text-sm">{capitalizeIngredient(ingredient)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <div className="w-1 h-6 bg-orange-600 rounded-full mr-3"></div>
                How to Cook
              </h3>
              <div className="space-y-2">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex space-x-3 p-2 bg-gray-50/80 backdrop-blur-sm rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </div>
                    <p className="text-gray-900 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-2.5">
              <h4 className="text-sm font-semibold text-blue-900 mb-1.5 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Pro Tips
              </h4>
              <ul className="space-y-0.5 text-blue-800 text-sm">
                {randomTips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2 border-t border-gray-200">
              <Button onClick={() => setIsExpanded(false)} variant="outline" className="flex-1 py-1.5 text-sm">
                <ChevronUp className="h-4 w-4 mr-1" />
                Close
              </Button>
              <Button
                onClick={onBookChef}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-1.5 text-sm"
              >
                <ChefHat className="h-4 w-4 mr-1" />
                Get Chef
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
