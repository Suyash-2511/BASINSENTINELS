import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
// Note: We create a new instance per call if needed to ensure key freshness in some contexts,
// but for this app structure, a single instance or lazy init is fine.
const ai = new GoogleGenAI({ apiKey });

export const analyzeWaterImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze this image of a water body (likely the Godavari river). 
            Assess visible water quality indicators such as turbidity, color, floating debris, and surface foam.
            Provide a technical assessment suitable for an environmental engineer.
            Format the output as a concise report with: 
            1. Visual Observations
            2. Estimated Turbidity Level (Low/Medium/High)
            3. Potential Contaminants
            4. Recommended Action.`
          },
        ],
      },
      config: {
        systemInstruction: "You are an expert environmental engineer specializing in hydrology and water quality analysis.",
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze image. Please ensure your API key is valid and try again.";
  }
};

export const fetchBasinIntelligence = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "What are the latest significant events, news, or environmental concerns affecting the Godavari River Basin in Nashik, India recently? Focus on water quality, Kumbh Mela preparations, or industrial discharge.",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a basin intelligence sentry. Summarize key environmental risks and events.",
      }
    });
    
    // Check for grounding chunks to display sources if needed, but here we return text
    return response.text || "No intelligence data available at this moment.";
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Unable to fetch live basin intelligence. Displaying historical baseline data.";
  }
};

export const fetchLocationDetails = async (locationName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a brief geographical and hydrological profile of ${locationName} in Nashik. Is it a critical monitoring point for pollution?`,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });
    return response.text || "Location details unavailable.";
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return "Could not retrieve location specific details.";
  }
};
