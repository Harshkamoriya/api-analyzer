import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
console.log("[DEBUG] Initializing Gemini client...");
const genAI = new GoogleGenerativeAI("AIzaSyDoy1TCK2qVzuhzNREfiNz9eNYpLoN8nvo");

export async function getOptimizationTips(prompt: string) {
  console.log("[DEBUG] getOptimizationTips called with prompt:", prompt);
console.log(process.env.GEMINI_API_KEY, "GEMINI_API_KEY");
    if (!process.env.GEMINI_API_KEY) {
        console.error("[ERROR] GEMINI_API_KEY is not set.");
        throw new Error("GEMINI_API_KEY is not set");
    }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("[DEBUG] Gemini model initialized.");

    const result = await model.generateContent(prompt)
    console.log("[DEBUG] Received response from Gemini.");

    const text = result.response.text();
    console.log("[DEBUG] Extracted text from Gemini response:", text);

    return text;
  } catch (error) {
    console.error("[ERROR] Failed to get optimization tips from Gemini:", error);
    throw error;  // rethrow so caller knows it failed
  }
}
