"use client"

import { useState, useEffect } from "react"
import { Database, Brain, ChefHat, Sparkles } from "lucide-react"

interface LoadingAnimationProps {
  isLoading: boolean
}

const loadingSteps = [
  { icon: Database, text: "Analyzing your ingredients...", duration: 3000 },
  { icon: Brain, text: "AI matching flavor profiles...", duration: 4000 },
  { icon: Sparkles, text: "Creating unique recipes...", duration: 4000 },
  { icon: ChefHat, text: "Finalizing perfect dishes...", duration: 4000 },
]

export function LoadingAnimation({ isLoading }: LoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    let stepIndex = 0

    const runStep = () => {
      if (stepIndex >= loadingSteps.length) {
        return
      }

      const step = loadingSteps[stepIndex]
      setCurrentStep(stepIndex)

      const stepProgress = ((stepIndex + 1) / loadingSteps.length) * 100
      const startProgress = (stepIndex / loadingSteps.length) * 100

      let currentProgress = startProgress
      const progressInterval = setInterval(() => {
        currentProgress += (stepProgress - startProgress) / (step.duration / 50)
        setProgress(Math.min(currentProgress, stepProgress))
      }, 50)

      setTimeout(() => {
        clearInterval(progressInterval)
        setProgress(stepProgress)
        stepIndex++
        if (stepIndex < loadingSteps.length) {
          setTimeout(runStep, 200)
        }
      }, step.duration)
    }

    runStep()
  }, [isLoading])

  if (!isLoading) return null

  const CurrentIcon = loadingSteps[currentStep]?.icon || Database

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Dinezzy Branding */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <ChefHat className="h-6 w-6 text-orange-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Dinezzy
            </span>
          </div>

          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <CurrentIcon className="h-10 w-10 text-white animate-bounce" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mx-auto animate-ping opacity-20"></div>
          </div>

          {/* Loading Text */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI Chef Working</h3>
          <p className="text-gray-600 mb-6 animate-pulse font-medium">
            {loadingSteps[currentStep]?.text || "Getting ready..."}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-orange-600 to-red-600 h-3 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Progress Text */}
          <p className="text-sm text-gray-500 mb-4">{Math.round(progress)}% Complete</p>

          {/* Processing Steps */}
          <div className="space-y-2">
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                  index === currentStep
                    ? "bg-orange-50 border border-orange-200"
                    : index < currentStep
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50"
                }`}
              >
                <step.icon
                  className={`h-4 w-4 ${
                    index === currentStep
                      ? "text-orange-600 animate-spin"
                      : index < currentStep
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm ${
                    index === currentStep
                      ? "text-orange-800 font-medium"
                      : index < currentStep
                        ? "text-green-800"
                        : "text-gray-500"
                  }`}
                >
                  {step.text}
                </span>
                {index < currentStep && <span className="text-green-600 text-xs ml-auto">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
