"use server"

import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function directGroqQuery(prompt: string) {
  try {
    // Track when the request starts
    const startTime = Date.now()

    // Send the prompt directly to Groq
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      system:
        "You are a helpful cooking assistant specializing in Indian cuisine. Provide detailed, helpful responses about cooking, recipes, ingredients, and techniques.",
      maxTokens: 8000,
      temperature: 0.7,
    })

    // Calculate response time
    const responseTime = Date.now() - startTime

    return {
      success: true,
      text,
      responseTime,
      model: "llama-3.1-8b-instant",
    }
  } catch (error) {
    console.error("Direct Groq query failed:", error)
    return {
      success: false,
      text: "Sorry, I couldn't process your request. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
