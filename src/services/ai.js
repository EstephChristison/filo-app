// ═══════════════════════════════════════════════════════════════════
// FILO — Browser-side AI Service (proxied through backend API)
// ═══════════════════════════════════════════════════════════════════
//
// All AI calls go through the FILO backend, which holds the OpenAI
// API key server-side. The browser NEVER sees the key.
//
// ═══════════════════════════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ─── Generic backend fetch helper ───────────────────────────────

async function apiCall(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
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

  // Ensure it is a proper data URL for the vision endpoint
  const imageUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  try {
    const result = await apiCall('/ai/detect-plants', {
      imageBase64: imageUrl,
      location,
      usdaZone,
    });

    return {
      success: result.success !== false,
      plants: result.plants || [],
    };
  } catch (err) {
    console.error('[FILO AI] detectPlants error:', err);
    return { success: false, plants: [], error: err.message };
  }
}

/**
 * generateDesign — Step 6: create a full plant placement plan
 * @param {object} params
 * @returns {{ success, data, error? }}
 */
export async function generateDesign(params) {
  const {
    photoBase64,
    sunExposure = 'full_sun',
    designStyle = 'naturalistic',
    specialRequests = '',
    availablePlants = [],
    existingPlantsKeep = [],
    existingPlantsRemove = [],
    location = {},
    lighting,
    hardscape,
  } = params;

  // Ensure photo is a proper data URL if provided
  let imageUrl = null;
  if (photoBase64) {
    imageUrl = photoBase64.startsWith('data:')
      ? photoBase64
      : `data:image/jpeg;base64,${photoBase64}`;
  }

  try {
    const result = await apiCall('/ai/generate-design', {
      photoBase64: imageUrl,
      sunExposure,
      designStyle,
      specialRequests,
      availablePlants: availablePlants.slice(0, 50).map((p) => ({
        id: p.id,
        common_name: p.name || p.common_name,
        category: p.type || p.category,
        container_size: p.size || p.container_size,
        sun_requirement: p.sun || p.sun_requirement,
        water_needs: p.water || p.water_needs,
        bloom_color: p.bloom || p.bloom_color,
        retail_price: p.price || p.retail_price,
      })),
      existingPlantsKeep,
      existingPlantsRemove,
      location,
      lighting,
      hardscape,
    });

    return {
      success: result.success !== false,
      data: result.data || result,
    };
  } catch (err) {
    console.error('[FILO AI] generateDesign error:', err);
    return { success: false, data: null, error: err.message };
  }
}

/**
 * chatDesignCommand — Step 7: process a natural-language design edit
 * @param {string} message - the user's chat message
 * @param {object} context - { currentPlants, availablePlants }
 * @returns {{ success, message, actions, warnings, error? }}
 */
export async function chatDesignCommand(message, context = {}) {
  const { currentPlants = [], availablePlants = [] } = context;

  try {
    const result = await apiCall('/ai/chat-command', {
      message,
      currentPlants: currentPlants.map((p) => ({
        id: p.id,
        name: p.name || p.common_name,
        quantity: p.quantity || 1,
        position_x: p.position_x ?? 50,
        position_y: p.position_y ?? 50,
        container_size: p.size || p.container_size,
      })),
      availablePlants: availablePlants.map((p) => ({
        id: p.id,
        name: p.name || p.common_name,
        category: p.type || p.category,
        sun_requirement: p.sun || p.sun_requirement,
        retail_price: p.price || p.retail_price,
        container_size: p.size || p.container_size,
      })),
    });

    return {
      success: result.success !== false,
      message: result.message || 'Design updated.',
      actions: result.actions || [],
      warnings: result.warnings || [],
    };
  } catch (err) {
    console.error('[FILO AI] chatDesignCommand error:', err);
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
 * @returns {{ success, text, closing, error? }}
 */
export async function generateNarrative(projectData) {
  const {
    companyName = "King's Garden Landscaping",
    clientName = '',
    address = '',
    designStyle = 'naturalistic',
    sunExposure = 'full sun',
    plants = [],
    lighting,
    hardscape,
    specialRequests,
  } = projectData;

  try {
    const result = await apiCall('/ai/narrative', {
      companyName,
      clientName,
      address,
      designStyle,
      sunExposure,
      plants,
      lighting,
      hardscape,
      specialRequests,
    });

    return {
      success: result.success !== false,
      text: result.text || result.narrative || '',
      closing: result.closing || '',
    };
  } catch (err) {
    console.error('[FILO AI] generateNarrative error:', err);
    // Graceful fallback
    return {
      success: true,
      text: `${companyName} is pleased to present this comprehensive landscape design proposal for the ${clientName} residence. The proposed design embraces a ${designStyle} aesthetic, integrating carefully selected species chosen for their compatibility with the property's ${sunExposure} exposure and the local climate.`,
      closing: 'We look forward to bringing this vision to life.',
      fallback: true,
    };
  }
}

/**
 * Check if the AI service is available (backend is reachable)
 */
export function isConfigured() {
  return Boolean(API_URL);
}
