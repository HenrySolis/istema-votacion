import api from './api.js';

export const pollService = {
  // ─── Admin: Encuestas ────────────────────────────────────────────────────────
  async getAll() {
    const { data } = await api.get('/admin/encuestas');
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/admin/encuestas/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await api.post('/admin/encuestas', payload);
    return data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/admin/encuestas/${id}`, payload);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/admin/encuestas/${id}`);
    return data;
  },

  async updateEstado(id, estado) {
    const { data } = await api.patch(`/admin/encuestas/${id}/estado`, { estado });
    return data;
  },

  async getResultados(id) {
    const { data } = await api.get(`/admin/encuestas/${id}/resultados`);
    return data;
  },

  async getResumen(id) {
    const { data } = await api.get(`/admin/encuestas/${id}/resumen`);
    return data;
  },

  // ─── Admin: Candidatos ───────────────────────────────────────────────────────
  async createCandidato(encuestaId, formData) {
    const { data } = await api.post(`/admin/encuestas/${encuestaId}/candidatos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async updateCandidato(id, formData) {
    const { data } = await api.put(`/admin/candidatos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async deleteCandidato(id) {
    const { data } = await api.delete(`/admin/candidatos/${id}`);
    return data;
  },

  // ─── Público ─────────────────────────────────────────────────────────────────
  async getPublic(slug, tokenVotante) {
    const { data } = await api.get(`/public/encuestas/${slug}`, {
      headers: tokenVotante ? { 'x-voter-token': tokenVotante } : {}
    });
    return data;
  },

  async votar(slug, candidatoId, tokenVotante) {
    const { data } = await api.post(`/public/encuestas/${slug}/votar`, {
      candidato_id: candidatoId,
      token_votante: tokenVotante
    });
    return data;
  }
};
