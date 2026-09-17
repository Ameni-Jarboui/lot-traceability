const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
    return localStorage.getItem('zen_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch (networkErr) {
        throw new Error(
            "Impossible de joindre le serveur (backend hors ligne ou mauvaise URL dans VITE_API_URL)."
        );
    }

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text };
        }
    }

    if (!res.ok) {
        throw new Error(data ? .error || `Erreur ${res.status}`);
    }
    return data;
}

export const api = {
        // Auth
        login: (email, password) =>
            request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
        register: (payload) =>
            request('/auth/register', { method: 'POST', body: payload, auth: false }),

        // Lots
        getLots: (filters = {}) => {
                const params = new URLSearchParams(
                    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
                ).toString();
                return request(`/lots${params ? `?${params}` : ''}`);
  },
  getLot: (id) => request(`/lots/${id}`),
  createLot: (payload) => request('/lots', { method: 'POST', body: payload }),
  fractionnerLot: (id, fractions) =>
    request(`/lots/${id}/fractionner`, { method: 'POST', body: { fractions } }),
  getDescendants: (id) => request(`/lots/${id}/descendants`),
  recombinerLots: (lotIds) =>
    request('/lots/recombiner', { method: 'POST', body: { lotIds } }),

  // Contrôles
  creerControle: (lotId, payload) =>
    request(`/controles/${lotId}`, { method: 'POST', body: payload }),
  creerControleParCode: (code, payload) =>
    request(`/controles/by-code/${code}`, { method: 'POST', body: payload }),
  validerControle: (id) => request(`/controles/${id}/valider`, { method: 'PATCH' }),

  // Documents
  getDocuments: (lotId) => request(`/documents/${lotId}`),
  ajouterDocument: (lotId, payload) =>
    request(`/documents/${lotId}`, { method: 'POST', body: payload }),
  supprimerDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  // Rappels
  lancerRappel: (lotId, motif) =>
    request(`/rappels/${lotId}`, { method: 'POST', body: { motif } }),
  cloturerRappel: (id) => request(`/rappels/${id}/cloturer`, { method: 'PATCH' }),

  // Users
  getUsers: () => request('/users'),
  changerRole: (id, role) =>
    request(`/users/${id}/role`, { method: 'PATCH', body: { role } }),
};

export { API_URL };