import { GoogleGenerativeAI } from "@google/generative-ai";

(async () => {
  console.log("[DEBUG] GEMINI_API_KEY:", process.env.GEMINI_API_KEY);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent("Say hello!");
  console.log("Gemini says:", result.response.text());
})();
