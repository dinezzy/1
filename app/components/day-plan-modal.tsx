"use client"

import { useState } from "react"
import { X, Sparkles, Clock, ChefHat, Utensils, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateDayPlan } from "../actions/generate-day-plan"
import { LoadingAnimation } from "./loading-animation"
import { RecipeCard } from "./recipe-card"

interface DayPlanModalProps {
  open: boolean
  onClose: () => void
  ingredients: string
}

interface MealPlan {
  breakfast: any
  lunch: any
  dinner: any
  totalCookingTime: number
  shoppingList: string[]
  planName: string
  planDescription: string
}

const planGradients = ["from-green-400 to-blue-500", "from-purple-400 to-pink-500", "from-orange-400 to-red-500"]

export function DayPlanModal({ open, onClose, ingredients }: DayPlanModalProps) {
  const [dayPlans, setDayPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [showRecipeDetail, setShowRecipeDetail] = useState(false)

  const handleGeneratePlan = async () => {
    if (!ingredients.trim()) return

    setLoading(true)
    try {
      // Start the loading animation and API call simultaneously
      const [_, plans] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 15000)), // 15 second loading animation
        generateDayPlan(ingredients), // Actual API call
      ])
      setDayPlans(plans)
    } catch (error) {
      console.error("Failed to generate day plan:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecipe = (meal: any, mealType: string) => {
    // Convert meal to recipe format
    const recipe = {
      ...meal,
      id: `${mealType}-${Date.now()}`,
      mealType: mealType.toLowerCase(),
      difficulty: meal.difficulty || "easy",
      needsExtraIngredients: false,
      extraIngredients: [],
    }
    setSelectedRecipe(recipe)
    setShowRecipeDetail(true)
  }

  const handleCloseRecipeDetail = () => {
    setShowRecipeDetail(false)
    setSelectedRecipe(null)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Loading Animation */}
      <LoadingAnimation isLoading={loading} />

      {/* Recipe Detail View */}
      {showRecipeDetail && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">{selectedRecipe.name}</h3>
              <Button variant="ghost" onClick={handleCloseRecipeDetail} className="p-2">
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4">
              <RecipeCard recipe={selectedRecipe} onBookChef={() => {}} showBookChef={false} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Full Day Meal Plans</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-4">
          {dayPlans.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get 3 Different Day Plans</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get 3 Complete Meal Plans for Breakfast, Lunch, and Dinner Using Your Ingredients
              </p>
              <Button
                onClick={handleGeneratePlan}
                disabled={loading || !ingredients.trim()}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-semibold"
              >
                {loading ? "Creating Plans..." : "Generate 3 Day Plans"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Your Perfect Day Plan</h3>
                <p className="text-gray-600">3 Different Meal Combinations Using Your Ingredients</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {dayPlans.map((plan, planIndex) => (
                  <Card key={planIndex} className="border-0 shadow-lg bg-white hover:shadow-xl transition-all">
                    <CardContent className="p-4">
                      {/* Plan Header */}
                      <div className={`relative mb-4 rounded-lg overflow-hidden h-24`}>
                        <div
                          className={`w-full h-full bg-gradient-to-br ${planGradients[planIndex]} flex items-center justify-center`}
                        >
                          <Utensils className="h-8 w-8 text-white opacity-80" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 text-white">
                          <h4 className="font-bold text-sm">{plan.planName}</h4>
                          <p className="text-xs opacity-90">{plan.planDescription}</p>
                        </div>
                      </div>

                      {/* Plan Info */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          Plan {planIndex + 1}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {plan.totalCookingTime} Mins Total
                        </div>
                      </div>

                      {/* Meals */}
                      <div className="space-y-3 mb-4">
                        {[
                          { meal: plan.breakfast, title: "Breakfast", color: "yellow" },
                          { meal: plan.lunch, title: "Lunch", color: "green" },
                          { meal: plan.dinner, title: "Dinner", color: "blue" },
                        ].map(({ meal, title, color }) => (
                          <div key={title} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`bg-${color}-100 text-${color}-800 text-xs`}>{title}</Badge>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-xs text-gray-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {meal.cookingTime}m
                                </div>
                                <Button
                                  onClick={() => handleViewRecipe(meal, title)}
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">{meal.name}</h5>
                            <p className="text-xs text-gray-600 mb-2">{meal.description}</p>
                            <div className="text-xs text-gray-500">
                              {meal.ingredients.slice(0, 3).join(", ")}
                              {meal.ingredients.length > 3 && ` +${meal.ingredients.length - 3} More`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shopping List */}
                      {plan.shoppingList.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-xs font-semibold text-gray-900 mb-2">Extra Items Needed:</h6>
                          <div className="flex flex-wrap gap-1">
                            {plan.shoppingList.slice(0, 4).map((item, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs border-orange-300 text-orange-600"
                              >
                                {item}
                              </Badge>
                            ))}
                            {plan.shoppingList.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{plan.shoppingList.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-xs py-2">
                        <ChefHat className="h-3 w-3 mr-1" />
                        Choose This Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setDayPlans([])}
                  variant="outline"
                  className="mr-3 border-gray-300 text-gray-600"
                >
                  Generate New Plans
                </Button>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-2 rounded-xl font-semibold">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Book Chef for Any Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
