"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { getAnalyticsSummary } from "../actions/search-recipes"

interface AnalyticsSummary {
  totalRequests: number
  groqSuccesses: number
  groqFailures: number
  jsonParseFailures: number
  schemaValidationFailures: number
  fallbackUsed: number
  groqSuccessRate: string
  fallbackRate: string
  last24HourEvents: Record<string, number>
  allTimeEvents: number
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const summary = await getAnalyticsSummary()
      setAnalytics(summary)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (!analytics) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Button onClick={fetchAnalytics} disabled={loading}>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              Load Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (rate: string) => {
    const numRate = Number.parseFloat(rate.replace("%", ""))
    if (numRate >= 90) return "bg-green-100 text-green-800"
    if (numRate >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getFallbackColor = (rate: string) => {
    const numRate = Number.parseFloat(rate.replace("%", ""))
    if (numRate <= 10) return "bg-green-100 text-green-800"
    if (numRate <= 30) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-orange-600" />
          Groq Integration Analytics
        </h2>
        <Button onClick={fetchAnalytics} disabled={loading} variant="outline">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.totalRequests}</div>
            <p className="text-xs text-gray-500 mt-1">Recipe search requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Groq Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900">{analytics.groqSuccessRate}</div>
              <Badge className={getStatusColor(analytics.groqSuccessRate)}>
                {Number.parseFloat(analytics.groqSuccessRate.replace("%", "")) >= 90 ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertTriangle className="h-3 w-3 mr-1" />
                )}
                {Number.parseFloat(analytics.groqSuccessRate.replace("%", "")) >= 90
                  ? "Excellent"
                  : Number.parseFloat(analytics.groqSuccessRate.replace("%", "")) >= 70
                    ? "Good"
                    : "Needs Attention"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">API call success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fallback Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900">{analytics.fallbackRate}</div>
              <Badge className={getFallbackColor(analytics.fallbackRate)}>
                {Number.parseFloat(analytics.fallbackRate.replace("%", "")) <= 10
                  ? "Optimal"
                  : Number.parseFloat(analytics.fallbackRate.replace("%", "")) <= 30
                    ? "Acceptable"
                    : "High"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manual recipe generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">All Time Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.allTimeEvents}</div>
            <p className="text-xs text-gray-500 mt-1">Total tracked events</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Success Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Groq API Successes</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {analytics.groqSuccesses}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">JSON Parse Successes</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {analytics.last24HourEvents.json_parse_success || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Schema Validations</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {analytics.last24HourEvents.schema_validation_success || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Failure Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Groq API Failures</span>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {analytics.groqFailures}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">JSON Parse Failures</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {analytics.jsonParseFailures}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Schema Validation Failures</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {analytics.schemaValidationFailures}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fallback Used</span>
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                {analytics.fallbackUsed}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Number.parseFloat(analytics.groqSuccessRate.replace("%", "")) < 90 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Groq success rate is below 90%. Consider reviewing API error patterns.
                </p>
              </div>
            )}

            {Number.parseFloat(analytics.fallbackRate.replace("%", "")) > 30 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  High fallback usage ({analytics.fallbackRate}). Consider improving prompt engineering or error
                  handling.
                </p>
              </div>
            )}

            {analytics.jsonParseFailures > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  JSON parsing failures detected. Review Groq response format consistency.
                </p>
              </div>
            )}

            {Number.parseFloat(analytics.groqSuccessRate.replace("%", "")) >= 90 &&
              Number.parseFloat(analytics.fallbackRate.replace("%", "")) <= 10 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Excellent performance! Groq integration is working optimally.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
