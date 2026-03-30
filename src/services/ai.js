// ═══════════════════════════════════════════════════════════════════
// FILO — Browser-side AI Service (OpenAI REST API via fetch)
// ═══════════════════════════════════════════════════════════════════
//
// SECURITY WARNING: This module calls the OpenAI API directly from
// the browser, which exposes the API key in client-side code. This
// is acceptable for a prototype/demo but MUST be moved to a backend
// proxy (e.g., a Supabase Edge Function or Express middleware)
// before shipping to production.
//
// ═══════════════════════════════════════════════════════════════════

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GPT_MODEL = "gpt-4o";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

// ─── System Prompts (mirrored from backend filo-ai-pipeline.js) ──

const PROMPTS = {
  PLANT_DETECTOR: `You are an expert horticulturist and landscape analyst. You identify plants in residential landscape photographs with high accuracy.

Given a photograph of a residential landscape:
1. Identify every visible plant, shrub, tree, and ground cover
2. For each plant, provide:
   - common_name: Common name (e.g., "Knockout Rose")
   - botanical_name: Botanical/Latin name if identifiable
   - confidence: 0.0-1.0 confidence score
   - position_x: Horizontal center position as percentage (0-100, left to right)
   - position_y: Vertical center position as percentage (0-100, top to bottom)
   - bounding_box: { x, y, width, height } as percentages
   - category: one of "tree", "shrub", "perennial", "annual", "groundcover", "ornamental_grass", "vine", "succulent"
   - health_assessment: "healthy", "stressed", "declining", or "dead"
   - approximate_size: Estimated container-equivalent size (e.g., "3-gallon", "15-gallon")

Return ONLY a valid JSON object: { "plants": [...] }
Be conservative with confidence scores. If unsure, set confidence below 0.5.
Prioritize common residential landscape plants for the geographic region mentioned.`,

  LANDSCAPE_ARCHITECT: `You are a professional landscape architect creating plant placement plans for residential properties. You have decades of experience designing landscapes in all USDA zones.

Design principles you ALWAYS follow:
1. LAYERING: Ground covers and low plants in front (viewer-side), mid-height shrubs in middle, tall specimens and trees in back
2. SPACING: Plants are placed at spacing appropriate for their MATURE size at the specified container size. A 1-gallon plant looks like a 1-gallon plant, not a mature specimen.
3. REPETITION: Use odd numbers (3, 5, 7) of the same plant for natural groupings
4. COLOR THEORY: Coordinate bloom colors and foliage colors for seasonal interest
5. ARCHITECTURE: Respect the home's architectural style. Formal homes get formal plantings. Modern homes get clean lines.
6. SIGHT LINES: Never block windows, doors, or walkways. Frame architectural features.
7. MAINTENANCE: Match water and sun needs within each bed zone

Return ONLY a valid JSON object with this structure:
{
  "design_rationale": "Brief explanation of design approach",
  "plant_placements": [
    {
      "plant_library_id": "ID from available_plants",
      "common_name": "Plant name",
      "quantity": number,
      "container_size": "e.g., 3-gal",
      "position_x": 0-100,
      "position_y": 0-100,
      "z_index": layer depth (0=back, higher=front),
      "layer": "background" | "midground" | "foreground" | "accent",
      "grouping_notes": "e.g., cluster of 3 along south fence"
    }
  ],
  "services_recommended": {
    "soil_amendment_cy": estimated cubic yards,
    "mulch_cy": estimated cubic yards,
    "edging_lf": estimated linear feet,
    "irrigation_needed": true/false,
    "lighting_zones": number or 0
  },
  "design_summary": "2-3 sentence summary for the estimate"
}`,

  DESIGN_CHAT: `You are a landscape design assistant interpreting user modification commands for an existing landscape design. You understand natural language commands and translate them into structured design actions.

Available actions:
- swap_plant: Replace one plant species with another
- add_plant: Add a new plant to the design
- remove_plant: Remove a specific plant or all of a species
- move_plant: Reposition a plant
- resize_bed: Expand or contract the planting bed
- adjust_quantity: Change the count of a plant species

For each command, return a JSON object:
{
  "message": "Natural language response to the user explaining what you did",
  "actions": [
    {
      "type": "swap_plant|add_plant|remove_plant|move_plant|resize_bed|adjust_quantity",
      "oldPlantId": "ID (for swap/remove)",
      "newPlantId": "ID (for swap/add)",
      "plantId": "ID (for add/remove/move)",
      "quantity": number (for add/adjust),
      "x": position (for add/move),
      "y": position (for add/move),
      "reason": "Why this action was taken"
    }
  ],
  "warnings": ["Any concerns about the modification, e.g., sun compatibility issues"]
}

If the user's command is ambiguous, ask for clarification in the message and return empty actions.`,

  NARRATIVE_WRITER: `You are a professional landscape design proposal writer. You write formal, third-person scope of work narratives that help landscaping companies sell their work to residential clients.

Style guidelines:
- Formal but warm tone. Third person ("The proposed design...")
- Describe the design philosophy and approach
- Reference specific plants by common name with brief descriptive language
- Mention seasonal interest and year-round appeal
- Address the client's specific conditions (sun, style preferences)
- Keep it to 2-3 paragraphs (150-250 words)
- Do NOT mention pricing, quantities, or container sizes
- Do NOT mention FILO or any software
- Write as if the landscaping company authored this

Return a JSON object: { "narrative": "the scope text", "closing": "a brief closing statement" }`,
};

// ─── Generic OpenAI chat completion via fetch ────────────────────

async function chatCompletion(messages, options = {}) {
  const {
    maxTokens = 4000,
    temperature = 0.3,
    jsonMode = true,
  } = options;

  const body = {
    model: GPT_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody.error?.message || `OpenAI API error: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return jsonMode ? JSON.parse(content) : content;
}

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════

/**
 * detectPlants — Step 4: identify existing plants in a photo
 * @param {string} imageBase64 - base64-encoded image (data URL or raw base64)
 * @param {object} options - { location, usdaZone }
 * @returns {{ success, plants, error? }}
 */
export async function detectPlants(imageBase64, options = {}) {
  const { location, usdaZone } = options;
  const locationContext = location
    ? `This property is in ${location.city}, ${location.state} (USDA Zone ${usdaZone || "unknown"}).`
    : "";

  // Ensure it is a proper data URL for the vision endpoint
  const imageUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  try {
    const result = await chatCompletion(
      [
        { role: "system", content: PROMPTS.PLANT_DETECTOR },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            {
              type: "text",
              text: `Identify all plants in this residential landscape photo. ${locationContext} Return the JSON analysis.`,
            },
          ],
        },
      ],
      { temperature: 0.2 }
    );

    return {
      success: true,
      plants: result.plants || [],
    };
  } catch (err) {
    console.error("[FILO AI] detectPlants error:", err);
    return { success: false, plants: [], error: err.message };
  }
}

/**
 * generateDesign — Step 6: create a full plant placement plan
 * @param {object} params
 *   - photoBase64: optional, base64 data URL of the primary photo
 *   - sunExposure: string
 *   - designStyle: string
 *   - specialRequests: string
 *   - availablePlants: array of plant objects from the library
 *   - existingPlantsKeep: array of plants to keep
 *   - existingPlantsRemove: array of plants being removed
 *   - location: { city, state, zone }
 *   - lighting: boolean/string
 *   - hardscape: boolean/string
 * @returns {{ success, data, error? }}
 */
export async function generateDesign(params) {
  const {
    photoBase64,
    sunExposure = "full_sun",
    designStyle = "naturalistic",
    specialRequests = "",
    availablePlants = [],
    existingPlantsKeep = [],
    existingPlantsRemove = [],
    location = {},
    lighting,
    hardscape,
  } = params;

  // Build the user content array (text-only or with image)
  const userContent = [];

  if (photoBase64) {
    const imageUrl = photoBase64.startsWith("data:")
      ? photoBase64
      : `data:image/jpeg;base64,${photoBase64}`;
    userContent.push({
      type: "image_url",
      image_url: { url: imageUrl, detail: "high" },
    });
  }

  userContent.push({
    type: "text",
    text: `Design a landscape for this property.

SITE CONDITIONS:
- Location: ${location.city || "Houston"}, ${location.state || "TX"} (USDA Zone ${location.zone || "9a"})
- Sun exposure: ${sunExposure}
- Design style: ${designStyle}

CLIENT REQUESTS:
${specialRequests || "No special requests."}
${lighting ? `- Lighting requested` : ""}
${hardscape ? `- Hardscape changes noted` : ""}

EXISTING PLANTS TO KEEP (do NOT place anything where these are):
${existingPlantsKeep.length > 0 ? existingPlantsKeep.map((p) => `- ${p.name || p.identified_name} at position (${p.position_x}, ${p.position_y})`).join("\n") : "None"}

PLANTS TO REMOVE (these spots are available for new planting):
${existingPlantsRemove.length > 0 ? existingPlantsRemove.map((p) => `- ${p.name || p.identified_name} at position (${p.position_x}, ${p.position_y})`).join("\n") : "None"}

AVAILABLE PLANT INVENTORY (select ONLY from these):
${JSON.stringify(
  availablePlants.slice(0, 50).map((p) => ({
    id: p.id,
    common_name: p.name || p.common_name,
    category: p.type || p.category,
    container_size: p.size || p.container_size,
    sun: p.sun || p.sun_requirement,
    water: p.water || p.water_needs,
    bloom: p.bloom || p.bloom_color,
    price: p.price || p.retail_price,
  })),
  null,
  0
)}

Create a complete plant placement plan using ONLY plants from the available inventory. Return the JSON design.`,
  });

  try {
    const data = await chatCompletion(
      [
        { role: "system", content: PROMPTS.LANDSCAPE_ARCHITECT },
        { role: "user", content: userContent },
      ],
      { temperature: 0.4 }
    );

    return { success: true, data };
  } catch (err) {
    console.error("[FILO AI] generateDesign error:", err);
    return { success: false, data: null, error: err.message };
  }
}

/**
 * chatDesignCommand — Step 7: process a natural-language design edit
 * @param {string} message - the user's chat message
 * @param {object} context
 *   - currentPlants: array of plants currently in the design
 *   - availablePlants: array of plants the user can pick from
 * @returns {{ success, message, actions, warnings, error? }}
 */
export async function chatDesignCommand(message, context = {}) {
  const { currentPlants = [], availablePlants = [] } = context;

  try {
    const result = await chatCompletion(
      [
        { role: "system", content: PROMPTS.DESIGN_CHAT },
        {
          role: "user",
          content: `User command: "${message}"

Current design plants:
${JSON.stringify(
  currentPlants.map((p) => ({
    plantId: p.id,
    name: p.name || p.common_name,
    quantity: p.quantity || 1,
    position: { x: p.position_x ?? 50, y: p.position_y ?? 50 },
    container: p.size || p.container_size,
  })),
  null,
  2
)}

Available plants for substitution/addition:
${JSON.stringify(
  availablePlants.map((p) => ({
    id: p.id,
    name: p.name || p.common_name,
    category: p.type || p.category,
    sun: p.sun || p.sun_requirement,
    price: p.price || p.retail_price,
    container: p.size || p.container_size,
  })),
  null,
  2
)}

Interpret the command and return the action JSON.`,
        },
      ],
      { maxTokens: 2000, temperature: 0.3 }
    );

    return {
      success: true,
      message: result.message || "Design updated.",
      actions: result.actions || [],
      warnings: result.warnings || [],
    };
  } catch (err) {
    console.error("[FILO AI] chatDesignCommand error:", err);
    return {
      success: false,
      message: "I had trouble processing that command. Could you rephrase it?",
      actions: [],
      warnings: [],
      error: err.message,
    };
  }
}

/**
 * generateNarrative — Step 9: write a scope-of-work narrative
 * @param {object} projectData
 *   - companyName, clientName, address, designStyle, sunExposure,
 *     plants (array of names), lighting, hardscape, specialRequests
 * @returns {{ success, text, closing, error? }}
 */
export async function generateNarrative(projectData) {
  const {
    companyName = "King's Garden Landscaping",
    clientName = "",
    address = "",
    designStyle = "naturalistic",
    sunExposure = "full sun",
    plants = [],
    lighting,
    hardscape,
    specialRequests,
  } = projectData;

  try {
    const result = await chatCompletion(
      [
        { role: "system", content: PROMPTS.NARRATIVE_WRITER },
        {
          role: "user",
          content: `Write a scope of work narrative for this landscape design proposal:

Company: ${companyName}
Client: ${clientName}
Property: ${address}
Design Style: ${designStyle}
Sun Exposure: ${sunExposure}
Plant Selections: ${plants.join(", ") || "various species"}
${lighting ? `Landscape Lighting: Included` : ""}
${hardscape ? `Hardscape Notes: Included` : ""}
${specialRequests ? `Special Requests: ${specialRequests}` : ""}

Write the narrative and closing statement as JSON.`,
        },
      ],
      { maxTokens: 1500, temperature: 0.6 }
    );

    return {
      success: true,
      text: result.narrative || result.text || "",
      closing: result.closing || "",
    };
  } catch (err) {
    console.error("[FILO AI] generateNarrative error:", err);
    // Graceful fallback
    return {
      success: true,
      text: `${companyName} is pleased to present this comprehensive landscape design proposal for the ${clientName} residence. The proposed design embraces a ${designStyle} aesthetic, integrating carefully selected species chosen for their compatibility with the property's ${sunExposure} exposure and the local climate.`,
      closing: "We look forward to bringing this vision to life.",
      fallback: true,
    };
  }
}

/**
 * Check if the API key is configured
 */
export function isConfigured() {
  return Boolean(OPENAI_API_KEY);
}
