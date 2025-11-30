import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface TravelItineraryInput {
  prompt: string;
}

export interface Activity {
  time: string;
  title: string;
  location: string;
  description: string;
  estimatedCost: number;
  type?: 'food' | 'attraction' | 'transportation' | 'accommodation' | 'activity' | 'transport-between';
  detailedInfo?: string;
  websiteUrl?: string;
  rating?: number;
  menuHighlights?: string[];
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  activities: Activity[];
}

export interface TravelItinerary {
  destination: string;
  tripDates: {
    startDate: string;
    endDate: string;
  };
  days: ItineraryDay[];
  totalEstimatedCost: number;
}

export interface GenerateItineraryResponse {
  itinerary: TravelItinerary;
  rawResponse: string;
}

/**
 * Hook for generating travel itineraries using Google Gemini API
 *
 * Accepts a prompt containing user preferences and questionnaire responses,
 * returns a structured travel itinerary with activities, costs, and dates.
 */
export function useGenerateItineraryMutation(): UseMutationResult<
  GenerateItineraryResponse,
  Error,
  TravelItineraryInput
> {
  return useMutation({
    mutationFn: async (input: TravelItineraryInput): Promise<GenerateItineraryResponse> => {
      if (!input.prompt || typeof input.prompt !== 'string' || input.prompt.trim().length === 0) {
        throw new Error('Valid prompt string is required');
      }

      const systemPrompt = `You are a travel itinerary expert. Generate a detailed, personalized travel itinerary based on the user's preferences and requirements.

CRITICAL: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no additional text. The response must be parseable by JSON.parse().

Return your response in this EXACT JSON structure:
{
  "destination": "City/Country Name",
  "tripDates": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM AM/PM",
          "title": "Activity Name",
          "location": "Specific Location",
          "description": "Brief description of the activity (1-2 sentences)",
          "estimatedCost": 0,
          "type": "food|attraction|transportation|accommodation|activity",
          "detailedInfo": "Detailed information about this place - for restaurants include cuisine style and ambiance, for museums include notable collections, for historical sites include key historical facts, for hotels include amenities and features",
          "websiteUrl": "https://example.com (official website if known, or null)",
          "rating": 4.5,
          "menuHighlights": ["Dish 1", "Dish 2"]
        }
      ]
    }
  ],
  "totalEstimatedCost": 0
}

Activity type guidelines:
- "food": restaurants, cafes, bars, food tours
- "attraction": museums, monuments, viewpoints, parks
- "transportation": flights, trains, buses, transfers, car rentals
- "accommodation": hotels, check-in/check-out activities
- "activity": tours, experiences, classes, entertainment

IMPORTANT BUDGET GUIDELINES FOR TRANSPORTATION:
- Unless explicitly requested, ALWAYS choose economy class flights
- CRITICAL: For round-trip flights, quote the ROUND-TRIP price ONCE on the OUTBOUND flight only. Set the return flight cost to $0 and note "(Return - included in round-trip)" in the description.
- Provide REALISTIC ROUND-TRIP flight prices based on actual route distances:
  * Domestic US round-trip: $200-$500 economy
  * US to Caribbean/Mexico round-trip: $350-$600 economy
  * US to Europe round-trip: $600-$1200 economy
  * US to South America (e.g., NYC to Buenos Aires) round-trip: $700-$1100 economy
  * US to Middle East round-trip: $900-$1500 economy
  * US to Southeast Asia round-trip: $900-$1600 economy
  * US to Australia/New Zealand round-trip: $1200-$2200 economy
- NEVER quote a long-haul international flight under $600 for round-trip
- Never select business or first class unless the user specifically requests luxury/comfort priority
- When user prioritizes "cost", choose budget airlines but still use realistic minimum prices for the distance
- IMPORTANT: The return flight should ALWAYS have estimatedCost: 0 since it's included in the round-trip price

For "food" type activities, ALWAYS include menuHighlights with 3-5 signature dishes.
For other types, set menuHighlights to null or empty array.

CRITICAL - INTER-ACTIVITY TRANSPORTATION:
Between EVERY main activity (like a museum visit or a restaurant meal), you MUST include a "transport-between" type activity block. This applies to ALL modes of travel: walking, taxi, bus, metro, train, etc. These blocks MUST be simple and MUST follow this format:
- "type": "transport-between"
- "title": A brief title like "Taxi to Dinner" or "Metro to Eiffel Tower".
- "description": Include ONLY the estimated travel time (e.g., "Approx. 25 minute ride").
- "estimatedCost": The fare for the taxi, bus, or train.
- Example for a taxi: {"time": "6:30 PM", "title": "Taxi to Restaurant", "location": "N/A", "description": "Approx. 15 minute ride", "estimatedCost": 15, "type": "transport-between"}
- Example for a walk: {"time": "10:45 AM", "title": "Walk to Museum", "location": "Via Main Street", "description": "10 minute walk", "estimatedCost": 0, "type": "transport-between"}

Do NOT create full, detailed activity blocks for regular city transit like buses or taxis. They must be \`transport-between\` blocks.
Main "transportation" activity types should only be used for major travel events, like the main flight to the destination.

Include 4-6 MAIN activities per day, PLUS transport-between blocks connecting each activity. Estimate costs in USD. Consider dietary restrictions, budget constraints, accommodation preferences, and user interests.`;

      const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
            {
                role: "model",
                parts: [{ text: "Okay, I am ready to generate a travel itinerary. Please provide the user's preferences."}]
            }
        ],
      });

      const result = await chat.sendMessage(input.prompt);
      const response = result.response;
      const rawResponse = response.text();

      // Parse the JSON response
      let itinerary: TravelItinerary;
      try {
        // Remove potential markdown code blocks if present
        let cleanedResponse = rawResponse.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        itinerary = JSON.parse(cleanedResponse);
      } catch (parseError) {
        throw new Error(
          `Failed to parse itinerary response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON format'}`
        );
      }

      // Validate the parsed itinerary structure
      if (!itinerary.destination || typeof itinerary.destination !== 'string') {
        throw new Error('Invalid itinerary: Missing or invalid destination');
      }

      if (!itinerary.tripDates || !itinerary.tripDates.startDate || !itinerary.tripDates.endDate) {
        throw new Error('Invalid itinerary: Missing or invalid trip dates');
      }

      if (!Array.isArray(itinerary.days) || itinerary.days.length === 0) {
        throw new Error('Invalid itinerary: Missing or invalid days array');
      }

      // Validate each day has required fields
      for (const day of itinerary.days) {
        if (typeof day.dayNumber !== 'number' || !day.date || !Array.isArray(day.activities)) {
          throw new Error('Invalid itinerary: Day missing required fields');
        }
      }

      if (typeof itinerary.totalEstimatedCost !== 'number') {
        throw new Error('Invalid itinerary: Missing or invalid total estimated cost');
      }

      return {
        itinerary,
        rawResponse,
      };
    },  });
}
