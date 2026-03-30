// ═══════════════════════════════════════════════════════════════════
// FILO — API Service Layer
// Handles all backend communication, JWT tokens, auth state
// ═══════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || 'https://filo-api-production.up.railway.app/api';

// ─── Token Management ────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('filo_token');
}

function getRefreshToken() {
  return localStorage.getItem('filo_refresh_token');
}

function setTokens(token, refreshToken) {
  localStorage.setItem('filo_token', token);
  if (refreshToken) localStorage.setItem('filo_refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('filo_token');
  localStorage.removeItem('filo_refresh_token');
  localStorage.removeItem('filo_user');
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('filo_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem('filo_user', JSON.stringify(user));
}

// ─── Core Fetch Helper ───────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If sending FormData (file upload), remove Content-Type so browser sets boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
    });
  } catch (networkErr) {
    throw new Error(`Network error: Could not reach server. Check your connection. (${networkErr.message})`);
  }

  // Handle 401 — try to refresh token once
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${getToken()}`;
      response = await fetch(url, {
        ...options,
        headers,
        body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined),
      });
    } else {
      // Refresh failed — force logout
      clearTokens();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(error.error || error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    setTokens(data.token);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

export const auth = {
  async register({ companyName, email, password, firstName, lastName, phone }) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: { companyName, email, password, firstName, lastName, phone },
    });
    setTokens(data.token, data.refreshToken);
    setStoredUser(data.user);
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setTokens(data.token, data.refreshToken);
    setStoredUser(data.user);
    return data;
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Logout even if API call fails
    }
    clearTokens();
  },

  getUser() {
    return getStoredUser();
  },

  isLoggedIn() {
    return !!getToken() && !!getStoredUser();
  },

  async invite({ email, firstName, lastName, role }) {
    return apiFetch('/auth/invite', {
      method: 'POST',
      body: { email, firstName, lastName, role },
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// COMPANY
// ═══════════════════════════════════════════════════════════════════

export const company = {
  async get() {
    return apiFetch('/company');
  },

  async update(fields) {
    return apiFetch('/company', { method: 'PUT', body: fields });
  },

  async completeOnboarding() {
    return apiFetch('/company/onboarding', { method: 'PUT' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════════════

export const clients = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/clients${query ? `?${query}` : ''}`);
  },

  async create(client) {
    return apiFetch('/clients', { method: 'POST', body: client });
  },

  async get(id) {
    return apiFetch(`/clients/${id}`);
  },

  async update(id, fields) {
    return apiFetch(`/clients/${id}`, { method: 'PUT', body: fields });
  },

  async delete(id) {
    return apiFetch(`/clients/${id}`, { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════

export const projects = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/projects${query ? `?${query}` : ''}`);
  },

  async create(project) {
    return apiFetch('/projects', { method: 'POST', body: project });
  },

  async get(id) {
    return apiFetch(`/projects/${id}`);
  },

  async update(id, fields) {
    return apiFetch(`/projects/${id}`, { method: 'PUT', body: fields });
  },

  async updateStatus(id, status) {
    return apiFetch(`/projects/${id}/status`, { method: 'PUT', body: { status } });
  },

  // Areas
  async getAreas(projectId) {
    return apiFetch(`/projects/${projectId}/areas`);
  },

  async createArea(projectId, area) {
    return apiFetch(`/projects/${projectId}/areas`, { method: 'POST', body: area });
  },

  // AI Design Generation
  async generateDesign(projectId) {
    return apiFetch(`/projects/${projectId}/designs/generate`, { method: 'POST' });
  },

  // Estimates
  async generateEstimate(projectId) {
    return apiFetch(`/projects/${projectId}/estimates/generate`, { method: 'POST' });
  },

  // Submittals
  async generateSubmittal(projectId) {
    return apiFetch(`/projects/${projectId}/submittals/generate`, { method: 'POST' });
  },

  // Revisions
  async getRevisions(projectId) {
    return apiFetch(`/projects/${projectId}/revisions`);
  },

  // Export all project files
  async exportAll(projectId) {
    return apiFetch(`/projects/${projectId}/export`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// PLANTS
// ═══════════════════════════════════════════════════════════════════

export const plants = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/plants${query ? `?${query}` : ''}`);
  },

  async create(plant) {
    return apiFetch('/plants', { method: 'POST', body: plant });
  },

  async importList(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/plants/import', { method: 'POST', body: formData });
  },
};

// ═══════════════════════════════════════════════════════════════════
// EXISTING PLANTS (detected in photos)
// ═══════════════════════════════════════════════════════════════════

export const existingPlants = {
  async list(areaId) {
    return apiFetch(`/areas/${areaId}/existing-plants`);
  },

  async mark(plantId, mark, comment) {
    return apiFetch(`/existing-plants/${plantId}/mark`, {
      method: 'PUT',
      body: { mark, comment },
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
// DESIGNS
// ═══════════════════════════════════════════════════════════════════

export const designs = {
  async get(id) {
    return apiFetch(`/designs/${id}`);
  },

  async chat(designId, message) {
    return apiFetch(`/designs/${designId}/chat`, {
      method: 'POST',
      body: { message },
    });
  },

  async addPlant(designId, plant) {
    return apiFetch(`/designs/${designId}/plants`, { method: 'POST', body: plant });
  },

  async movePlant(plantId, positionX, positionY) {
    return apiFetch(`/design-plants/${plantId}/position`, {
      method: 'PUT',
      body: { positionX, positionY },
    });
  },

  async removePlant(plantId) {
    return apiFetch(`/design-plants/${plantId}`, { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// ESTIMATES
// ═══════════════════════════════════════════════════════════════════

export const estimates = {
  async get(id) {
    return apiFetch(`/estimates/${id}`);
  },

  async updateLineItem(estimateId, lineItemId, fields) {
    return apiFetch(`/estimates/${estimateId}/line-items/${lineItemId}`, {
      method: 'PUT',
      body: fields,
    });
  },

  async approve(id) {
    return apiFetch(`/estimates/${id}/approve`, { method: 'PUT' });
  },

  async generatePDF(id, type = 'customer') {
    return apiFetch(`/estimates/${id}/pdf`, { method: 'POST', body: { type } });
  },

  async generateAllPDFs(id) {
    return apiFetch(`/estimates/${id}/pdf/all`, { method: 'POST' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// SUBMITTALS
// ═══════════════════════════════════════════════════════════════════

export const submittals = {
  async get(id) {
    return apiFetch(`/submittals/${id}`);
  },

  async generatePDF(id) {
    return apiFetch(`/submittals/${id}/pdf`, { method: 'POST' });
  },

  async pushToCRM(id) {
    return apiFetch(`/submittals/${id}/pdf-and-push`, { method: 'POST' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// FILE UPLOADS
// ═══════════════════════════════════════════════════════════════════

export const files = {
  async upload(file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    return apiFetch('/upload', { method: 'POST', body: formData });
  },

  async uploadPhotos(areaId, photos) {
    const formData = new FormData();
    for (const photo of photos) {
      formData.append('photos', photo);
    }
    return apiFetch(`/upload/photos/${areaId}`, { method: 'POST', body: formData });
  },

  async getPresignedUrl(fileName, fileType, contentType) {
    return apiFetch('/upload/presign', {
      method: 'POST',
      body: { fileName, fileType, contentType },
    });
  },

  async download(fileId) {
    return apiFetch(`/files/${fileId}/download`);
  },
};

// ═══════════════════════════════════════════════════════════════════
// CRM
// ═══════════════════════════════════════════════════════════════════

export const crm = {
  async status() {
    return apiFetch('/crm/status');
  },

  async connect(provider, credentials) {
    return apiFetch('/crm/connect', { method: 'POST', body: { provider, credentials } });
  },

  async disconnect() {
    return apiFetch('/crm/disconnect', { method: 'POST' });
  },

  async syncProject(projectId) {
    return apiFetch(`/crm/sync/full/${projectId}`, { method: 'POST' });
  },

  async providers() {
    return apiFetch('/crm/providers');
  },

  async syncLog() {
    return apiFetch('/crm/sync-log');
  },
};

// ═══════════════════════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════════════════════

export const team = {
  async list() {
    return apiFetch('/team');
  },

  async update(userId, fields) {
    return apiFetch(`/team/${userId}`, { method: 'PUT', body: fields });
  },

  async remove(userId) {
    return apiFetch(`/team/${userId}`, { method: 'DELETE' });
  },
};

// ═══════════════════════════════════════════════════════════════════
// BILLING
// ═══════════════════════════════════════════════════════════════════

export const billing = {
  async status() {
    return apiFetch('/billing/status');
  },

  async subscribe(paymentMethodId) {
    return apiFetch('/billing/subscribe', { method: 'POST', body: { paymentMethodId } });
  },

  async portal(returnUrl) {
    return apiFetch('/billing/portal', { method: 'POST', body: { returnUrl } });
  },

  async cancel(immediate = false) {
    return apiFetch('/billing/cancel', { method: 'POST', body: { immediate } });
  },

  async invoices() {
    return apiFetch('/billing/invoices');
  },
};

// ═══════════════════════════════════════════════════════════════════
// AI (direct proxy calls)
// ═══════════════════════════════════════════════════════════════════

export const ai = {
  async detectPlants(photoUrl, areaId) {
    return apiFetch('/ai/detect-plants', {
      method: 'POST',
      body: { photoUrl, areaId },
    });
  },

  async generateDesign(projectId, options) {
    return apiFetch(`/projects/${projectId}/designs/generate`, {
      method: 'POST',
      body: options,
    });
  },

  async chat(designId, message) {
    return apiFetch(`/designs/${designId}/chat`, {
      method: 'POST',
      body: { message },
    });
  },

  async health() {
    return apiFetch('/ai/health');
  },
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════════

const api = {
  auth,
  company,
  clients,
  projects,
  plants,
  existingPlants,
  designs,
  estimates,
  submittals,
  files,
  crm,
  team,
  billing,
  ai,
};

export default api;
