
import { GoogleGenAI, Type } from "@google/genai";
import { CompanyData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseProcoreHTML = async (htmlContent: string): Promise<CompanyData[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Extract company information from the following HTML snippet of a Procore Network search result. 
    Look for general contractors, their names, phone numbers, email addresses, websites, and any mentioned point of contact.
    If a field is missing, use "N/A".
    
    HTML Content:
    ${htmlContent.substring(0, 15000)}`, // Truncate to avoid token limits if HTML is massive
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING },
            pointOfContact: { type: Type.STRING },
            address: { type: Type.STRING },
            website: { type: Type.STRING }
          },
          required: ["companyName", "phone", "email"]
        }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text) as CompanyData[];
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};
