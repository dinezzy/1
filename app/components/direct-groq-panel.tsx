"use client"

import type React from "react"

import { useState } from "react"
import { Send, RefreshCw, Clock, Bot, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { directGroqQuery } from "../actions/direct-groq"
import ReactMarkdown from "react-markdown"

interface DirectGroqPanelProps {
  onClose: () => void
}

export function DirectGroqPanel({ onClose }: DirectGroqPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    setLoading(true)
    setResponse(null)

    try {
      const result = await directGroqQuery(prompt)
      if (result.success) {
        setResponse(result.text)
        setResponseTime(result.responseTime)
      } else {
        setResponse(`Error: ${result.error || "Failed to get response"}`)
      }
    } catch (error) {
      console.error("Failed to query Groq:", error)
      setResponse("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-100/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Direct Groq AI Chat
          </CardTitle>
          <Button variant="ghost" className="text-white hover:bg-white/20 h-8 w-8 p-0" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-gray-700">
              Ask anything about Indian cooking:
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., How do I make butter chicken? What spices go well with cauliflower?"
              className="min-h-[100px] border-2 border-orange-200 focus:border-orange-500 rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Groq
                </>
              )}
            </Button>
          </div>
        </form>

        {response && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Groq Response:</h3>
              <div className="flex items-center space-x-3">
                {responseTime && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {(responseTime / 1000).toFixed(2)}s
                  </span>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs border-gray-300" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-[400px] prose prose-sm">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  )
}
