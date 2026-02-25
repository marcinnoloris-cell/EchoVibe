import { GoogleGenAI, Type } from "@google/genai";
import { MoodProfile, TravelPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMood(input: { text?: string; spotifyData?: any; voiceBase64?: string }): Promise<MoodProfile> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following user input and determine their current emotional state for travel planning.
    User Text: ${input.text || "None"}
    Spotify Data: ${input.spotifyData ? JSON.stringify(input.spotifyData) : "None"}
    
    Return a JSON object with:
    - primaryMood: One of 'Relax', 'Energy', 'Inspiration', 'Calm', 'Adventure', 'Melancholy', 'Joy'
    - intensity: A number between 0 and 1
    - description: A brief explanation of why this mood was chosen.
    - suggestedColors: An array of 2-3 hex colors that represent this mood.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryMood: { type: Type.STRING },
          intensity: { type: Type.NUMBER },
          description: { type: Type.STRING },
          suggestedColors: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["primaryMood", "intensity", "description", "suggestedColors"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateItineraries(moodProfile: MoodProfile, budget: string): Promise<TravelPlan> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Based on the following mood profile and budget, generate 3 distinct travel itinerary options.
    Mood: ${moodProfile.primaryMood} (${moodProfile.description})
    Intensity: ${moodProfile.intensity}
    Budget Range: ${budget}
    
    The 3 options should be categorized as:
    1. "Relax": Focus on recovery and peace.
    2. "Energy": Focus on activity and excitement.
    3. "Inspiration": Focus on culture, art, and new perspectives.
    
    For each option, provide:
    - title: A catchy name.
    - destination: City and Country.
    - description: Why it fits the mood.
    - highlights: 3 key activities.
    - estimatedCost: A string representing the cost.
    - flightDetails: Realistic flight information (e.g., "Volo A/R da Roma, 2h 30m").
    - accommodationDetails: Realistic accommodation info (e.g., "Boutique Hotel 4* in centro").
    - foodDetails: Realistic food/dining info based on the destination (e.g., "Colazione inclusa, cena tipica in taverna").
    - image: A descriptive prompt for an image (e.g., "A serene beach in Bali at sunset").
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                destination: { type: Type.STRING },
                description: { type: Type.STRING },
                highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimatedCost: { type: Type.STRING },
                flightDetails: { type: Type.STRING },
                accommodationDetails: { type: Type.STRING },
                foodDetails: { type: Type.STRING },
                image: { type: Type.STRING },
              },
              required: ["title", "type", "destination", "description", "highlights", "estimatedCost", "flightDetails", "accommodationDetails", "foodDetails", "image"],
            },
          },
        },
        required: ["options"],
      },
    },
  });

  const data = JSON.parse(response.text || "{}");
  
  // Add IDs and actual image URLs (using placeholders for now but with descriptive seeds)
  const options = data.options.map((opt: any, index: number) => ({
    ...opt,
    id: `opt-${index}`,
    image: `https://picsum.photos/seed/${encodeURIComponent(opt.destination)}/800/600`
  }));

  return {
    moodProfile,
    options
  };
}
