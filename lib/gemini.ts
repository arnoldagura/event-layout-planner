import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface LayoutSuggestionRequest {
  eventType: string;
  capacity: number;
  venue?: string;
  specialRequirements?: string;
  existingElements?: Array<{
    type: string;
    name: string;
  }>;
}

export interface LayoutElement {
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties?: Record<string, unknown>;
}

export interface LayoutSuggestion {
  elements: LayoutElement[];
  reasoning: string;
  alternatives?: string[];
}

export async function generateLayoutSuggestion(
  request: LayoutSuggestionRequest
): Promise<LayoutSuggestion> {
  const prompt = `You are an expert event planner. Generate an optimal layout for the following event:

Event Type: ${request.eventType}
Capacity: ${request.capacity} people
Venue: ${request.venue || 'Not specified'}
Special Requirements: ${request.specialRequirements || 'None'}
${
  request.existingElements && request.existingElements.length > 0
    ? `Existing Elements: ${request.existingElements
        .map((e) => `${e.name} (${e.type})`)
        .join(', ')}`
    : ''
}

Please suggest an optimal layout considering:
1. Flow and accessibility
2. Safety regulations (emergency exits, clear pathways)
3. Attendee comfort and experience
4. Functionality for the event type
5. Space efficiency

Provide your response as a JSON object with the following structure:
{
  "elements": [
    {
      "type": "stage|table|chair|booth|entrance|exit|restroom|bar|registration",
      "name": "descriptive name",
      "x": number (0-1000, representing canvas coordinates),
      "y": number (0-1000, representing canvas coordinates),
      "width": number,
      "height": number,
      "rotation": number (0-360),
      "properties": {
        "capacity": number (if applicable),
        "notes": "any special notes"
      }
    }
  ],
  "reasoning": "Brief explanation of the layout decisions",
  "alternatives": ["alternative suggestion 1", "alternative suggestion 2"]
}

IMPORTANT: Respond with ONLY valid JSON, no markdown code blocks or additional text.`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();

  if (!content) {
    throw new Error('No response from Gemini');
  }

  return JSON.parse(content);
}
