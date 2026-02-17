import { GoogleGenAI, Type } from "@google/genai";
import { Stock, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (stock: Stock): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      Act as a senior financial analyst. Analyze the following stock based on its current simulated market data.
      
      Stock: ${stock.name} (${stock.symbol})
      Price: $${stock.price}
      Daily Change: ${stock.change}% (${stock.changeAmount > 0 ? '+' : ''}${stock.changeAmount})
      Sector: ${stock.sector}
      
      Provide a concise analysis in structured JSON format. 
      The analysis should include a sentiment (BULLISH, BEARISH, or NEUTRAL), a confidence score (0-100), a short summary (max 2 sentences), 3 key bullet points, and a final recommendation (BUY, SELL, or HOLD).
      Base the recommendation on standard technical analysis principles given the price movement.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] }
          },
          required: ["sentiment", "score", "summary", "keyPoints", "recommendation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails
    return {
      sentiment: "NEUTRAL",
      score: 50,
      summary: "AI services are currently unavailable. Please analyze market data manually.",
      keyPoints: ["Data unavailable", "Check connection", "Retry later"],
      recommendation: "HOLD"
    };
  }
};

export const getNewsSummary = async (stockSymbol: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 short, realistic-sounding financial news headlines for ${stockSymbol} that might explain its current volatility. Return only the headlines as a markdown list.`,
    });
    return response.text || "No news available.";
  } catch (error) {
    return "Failed to fetch news.";
  }
};
