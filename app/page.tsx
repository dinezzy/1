"use client"

import type React from "react"
import { useState } from "react"
import { Search, Sparkles, RefreshCw, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RecipeCard } from "./components/recipe-card"
import { DayPlanModal } from "./components/day-plan-modal"
import { ChefBookingModal } from "@/components/chef-booking-modal"
import { LoadingAnimation } from "./components/loading-animation"
import { DinezzyLogo } from "./components/dinezzy-logo"
import { DirectGroqPanel } from "./components/direct-groq-panel"
import { searchRecipes } from "./actions/search-recipes"

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

// Enhanced ingredient corrections with duplicates handling
const ingredientCorrections: { [key: string]: string } = {
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

function correctIngredientSpelling(ingredients: string): string {
  let corrected = ingredients.toLowerCase()

  // Apply corrections
  for (const [hindi, english] of Object.entries(ingredientCorrections)) {
    corrected = corrected.replace(new RegExp(`\\b${hindi}\\b`, "g"), english)
  }

  // Split, clean, and remove duplicates
  const ingredientList = corrected
    .split(/[,\s]+/)
    .map((item) => {
      const trimmed = item.trim()
      return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : ""
    })
    .filter((item) => item.length > 2)

  // Remove duplicates by converting to Set and back to array
  const uniqueIngredients = Array.from(new Set(ingredientList))

  return uniqueIngredients.join(", ")
}

export default function HomePage() {
  const [ingredients, setIngredients] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [includeExtra, setIncludeExtra] = useState(false)
  const [showDayPlan, setShowDayPlan] = useState(false)
  const [showChefBooking, setShowChefBooking] = useState(false)
  const [correctedIngredients, setCorrectedIngredients] = useState("")
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null)
  const [showGroqPanel, setShowGroqPanel] = useState(false)

  const handleSearch = async (mealTypeFilter?: string) => {
    if (!ingredients.trim()) return

    const corrected = correctIngredientSpelling(ingredients)
    setCorrectedIngredients(corrected)

    setLoading(true)
    try {
      // Start the loading animation and API call simultaneously
      const [_, results] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 15000)), // 15 second loading animation
        searchRecipes(ingredients, includeExtra, mealTypeFilter), // Actual API call
      ])
      setRecipes(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReload = async () => {
    setRecipes([])
    handleSearch(selectedMealType || undefined)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(selectedMealType || undefined)
    }
  }

  const handleMealTypeFilter = (mealType: string) => {
    setSelectedMealType(mealType)
    if (ingredients.trim()) {
      handleSearch(mealType)
    }
  }

  const clearMealTypeFilter = () => {
    setSelectedMealType(null)
    if (ingredients.trim()) {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Loading Animation */}
      <LoadingAnimation isLoading={loading} />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-orange-100/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DinezzyLogo className="h-8 w-8 text-orange-600" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Dinezzy
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowGroqPanel(!showGroqPanel)}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full text-sm"
              >
                <Bot className="h-4 w-4 mr-1" />
                Ask Groq AI
              </Button>
              <Button
                onClick={() => setShowChefBooking(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Book Chef
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            What Can You Cook With
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent block sm:inline">
              {" "}
              What You Have?
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed">
            Tell us what ingredients you have at home, and we'll suggest delicious Indian recipes you can make right
            now!
          </p>
        </div>

        {/* Direct Groq Panel */}
        {showGroqPanel && (
          <div className="max-w-4xl mx-auto mb-6">
            <DirectGroqPanel onClose={() => setShowGroqPanel(false)} />
          </div>
        )}

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-3 sm:p-4 border border-orange-100/50">
            <div className="flex flex-col space-y-3">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="आलू, प्याज, टमाटर, rice, dal... (Hindi or English)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-3 text-base border-2 border-orange-200 focus:border-orange-500 rounded-xl bg-white/50 backdrop-blur-sm"
                />
              </div>

              {/* Meal Type Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={clearMealTypeFilter}
                  variant={selectedMealType === null ? "default" : "outline"}
                  className={`text-xs px-3 py-1.5 rounded-lg ${
                    selectedMealType === null
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Meals
                </Button>
                <Button
                  onClick={() => handleMealTypeFilter("breakfast")}
                  variant={selectedMealType === "breakfast" ? "default" : "outline"}
                  className={`text-xs px-3 py-1.5 rounded-lg ${
                    selectedMealType === "breakfast"
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Breakfast
                </Button>
                <Button
                  onClick={() => handleMealTypeFilter("lunch")}
                  variant={selectedMealType === "lunch" ? "default" : "outline"}
                  className={`text-xs px-3 py-1.5 rounded-lg ${
                    selectedMealType === "lunch"
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Lunch
                </Button>
                <Button
                  onClick={() => handleMealTypeFilter("dinner")}
                  variant={selectedMealType === "dinner" ? "default" : "outline"}
                  className={`text-xs px-3 py-1.5 rounded-lg ${
                    selectedMealType === "dinner"
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Dinner
                </Button>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeExtra"
                    checked={includeExtra}
                    onChange={(e) => setIncludeExtra(e.target.checked)}
                    className="rounded border-orange-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <label htmlFor="includeExtra" className="text-xs sm:text-sm text-gray-600">
                    Include recipes that need extra ingredients
                  </label>
                </div>

                <div className="flex space-x-2">
                  {recipes.length > 0 && (
                    <Button
                      onClick={handleReload}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      New Search
                    </Button>
                  )}
                  <Button
                    onClick={() => setShowDayPlan(true)}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-1.5 text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Day Plan
                  </Button>
                  <Button
                    onClick={() => handleSearch(selectedMealType || undefined)}
                    disabled={loading || !ingredients.trim()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-xs"
                  >
                    {loading ? "Searching..." : "Find Recipes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {recipes.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🍽️ Recipe Suggestions</h2>
                {selectedMealType && (
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)} Only
                    <span className="ml-2 bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full text-xs">
                      {recipes.length} recipes
                    </span>
                  </span>
                )}
              </div>
              {recipes.length >= 5 && (
                <Button
                  onClick={() => setShowChefBooking(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 sm:px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                >
                  Book Chef
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onBookChef={() => setShowChefBooking(true)}
                  showBookChef={index === 2 || index === 7}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && ingredients && (
          <div className="text-center py-8 sm:py-12">
            <DinezzyLogo className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recipes Found</h3>
            <p className="text-gray-500 text-base">Try different ingredients or enable "Include Extra Ingredients"</p>
          </div>
        )}
      </section>

      {/* Modals */}
      <DayPlanModal open={showDayPlan} onClose={() => setShowDayPlan(false)} ingredients={ingredients} />
      <ChefBookingModal open={showChefBooking} onClose={() => setShowChefBooking(false)} />
    </div>
  )
}
