import { GoogleGenAI, Type } from "@google/genai";
import { MonitoringNode, CrowdZone } from "../types";

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
            Format the output strictly as follows:
            
            **1. Visual Observations:**
            [Detail 1]
            [Detail 2]

            **2. Estimated Turbidity:**
            [Low/Medium/High] - [Reasoning]

            **3. Contaminant Risk:**
            [Details]

            **4. Recommended Action:**
            [Actionable advice]`
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

export const analyzeCrowdImage = async (base64Image: string, mimeType: string): Promise<string> => {
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
            text: `Analyze this surveillance image of a crowd gathering.
            Assess crowd density, flow patterns, visible bottlenecks, and potential safety risks (e.g. stampede precursors).
            Provide a security and safety assessment suitable for ground control units.
            Format the output strictly as follows:

            **1. Density Analysis:**
            [Estimated Density Level: Low/Moderate/Critical] - [Observation]

            **2. Flow Dynamics:**
            [Static/Moving/Bottlenecked] - [Details on movement patterns]

            **3. Safety Hazards:**
            [Identify any blocked exits, pressure points, or aggressive behavior]

            **4. Tactical Recommendation:**
            [Actionable advice for crowd control]`
          },
        ],
      },
      config: {
        systemInstruction: "You are an expert in crowd dynamics, public safety, and surveillance analysis.",
      }
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze crowd feed.";
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

export const fetchCrowdIntelligence = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "What are the latest large gatherings, religious processions (Aarti), festivals, or traffic restrictions in Nashik (Godavari area) today? Focus on events that could impact crowd density.",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a public safety intelligence analyst. Summarize key events affecting crowd control.",
      }
    });
    return response.text || "No crowd intelligence available.";
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return "Unable to fetch live crowd intelligence.";
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

export const generateWaterQualityForecast = async (node: MonitoringNode): Promise<string> => {
  try {
    const prompt = `
      Analyze these real-time water quality metrics for ${node.name}:
      - pH: ${node.ph}
      - Dissolved Oxygen: ${node.do} mg/L
      - BOD: ${node.bod} mg/L
      - Turbidity: ${node.turbidity} NTU
      - Current Risk Level: ${node.riskLevel}
      - Quality Score: ${node.qualityScore}/100

      Based on these numbers, provide a 2-sentence forecast.
      Sentence 1: Predict the short-term trend (improving/degrading) and why.
      Sentence 2: Provide a specific safety recommendation for river authorities or the public.
      Keep it technical but concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    });
    return response.text || "Forecast data unavailable.";
  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    return "AI Forecast temporarily unavailable due to connectivity.";
  }
};

export const generateCrowdInsight = async (zone: CrowdZone): Promise<string> => {
  try {
    const prompt = `
      Analyze these real-time crowd metrics for ${zone.name}:
      - Headcount: ${zone.headcount}
      - Occupancy: ${zone.occupancy}%
      - Flow Rate: ${zone.flowRate} people/min
      - Risk Level: ${zone.riskLevel}
      - Trend: ${zone.trend}
      - Next Event: ${zone.nextEvent}

      Act as a security command AI. 
      Provide a brief, tactical prediction (1 sentence) regarding congestion or safety in the next 15-30 minutes.
      Suggest a specific action if risk is elevated (e.g. divert traffic, deploy drone, monitor gates).
      Examples: 
      "High probability of congestion at North Exit in 15 mins; recommend diverting flow to Sector C."
      "Flow rate stabilizing; maintain current monitoring protocols and check drone battery."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 100,
      }
    });
    return response.text || "Crowd analytics unavailable.";
  } catch (error) {
    console.error("Gemini Crowd Insight Error:", error);
    return "AI Insight temporarily unavailable.";
  }
};