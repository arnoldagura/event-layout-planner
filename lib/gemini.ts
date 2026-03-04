import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables")
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export interface LayoutSuggestionRequest {
  eventType: string
  capacity: number
  venue?: string
  specialRequirements?: string
  existingElements?: Array<{
    type: string
    name: string
  }>
}

export interface LayoutElement {
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties?: Record<string, unknown>
}

export interface LayoutSuggestion {
  elements: LayoutElement[]
  reasoning: string
  alternatives?: string[]
}

export async function generateLayoutSuggestion(
  request: LayoutSuggestionRequest
): Promise<LayoutSuggestion> {
  const prompt = `You are an expert event layout planner. Generate an optimal, non-overlapping layout for the following event.

Event Type: ${request.eventType}
Capacity: ${request.capacity} people
Venue: ${request.venue || "Not specified"}
Special Requirements: ${request.specialRequirements || "None"}
${
  request.existingElements && request.existingElements.length > 0
    ? `Existing Elements: ${request.existingElements
        .map((e) => `${e.name} (${e.type})`)
        .join(", ")}`
    : ""
}

CANVAS SIZE: 2000 x 1500 pixels. All elements must fit within x: 20–1960, y: 20–1460.

EXACT ELEMENT SIZES TO USE (do not deviate):
- stage:        width 280, height 100
- table:        width 100, height 100
- chair:        width 36,  height 36
- booth:        width 120, height 100
- entrance:     width 80,  height 50
- exit:         width 80,  height 50
- restroom:     width 70,  height 70
- bar:          width 150, height 70
- registration: width 150, height 70

STRICT NO-OVERLAP RULES — you MUST follow these exactly:
1. No two elements may share any pixels. Every element's bounding box (x, y) to (x+width, y+height) must not touch or intersect any other element's bounding box.
2. Leave a minimum gap of 12px between every pair of elements.
3. Chairs must be placed BESIDE tables (not underneath them). A chair next to a table side should be offset by exactly (table_height/2 + chair_height/2 + 12) pixels from the table centre on that axis.
4. Place chairs in a row along the sides of each table. For a 100×100 table: chairs sit at y_table - 48 (top row) or y_table + 100 + 12 (bottom row), spaced 48px apart along the x axis.
5. Minimum aisle width between table rows: 80px (enough for two people to pass).
6. Tables in the same row: leave at least 20px horizontal gap between them.

LAYOUT GUIDELINES:
- Place the stage at the top-centre of the canvas.
- Group tables in organized rows below the stage.
- Place entrance/exit elements near the canvas edges.
- Restrooms and bar near the sides.
- Registration near the entrance.

Respond with ONLY a valid JSON object in this exact structure:
{
  "elements": [
    {
      "type": "stage|table|chair|booth|entrance|exit|restroom|bar|registration",
      "name": "descriptive name",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "rotation": 0,
      "properties": {}
    }
  ],
  "reasoning": "Brief explanation of the layout decisions",
  "alternatives": ["alternative suggestion 1", "alternative suggestion 2"]
}

CRITICAL: Output ONLY the raw JSON object. No markdown, no code fences, no extra text.`

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  })

  const result = await model.generateContent(prompt)
  const response = result.response
  const content = response.text()

  if (!content) {
    throw new Error("No response from Gemini")
  }

  return JSON.parse(content)
}
