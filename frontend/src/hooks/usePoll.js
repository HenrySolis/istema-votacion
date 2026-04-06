import { useState, useEffect } from 'react';
import { pollService } from '../services/pollService.js';
import { getOrCreateToken } from '../utils/tokenVotante.js';

export function usePoll(slug) {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const token = getOrCreateToken();

    pollService.getPublic(slug, token)
      .then(setPoll)
      .catch((err) => setError(err.response?.data?.message || 'Error al cargar la encuesta'))
      .finally(() => setLoading(false));
  }, [slug]);

  return { poll, loading, error };
}
