const TOKEN_KEY = 'voter_token';

/**
 * Devuelve el token del votante almacenado en localStorage.
 * Si no existe, genera uno con crypto.randomUUID() y lo guarda.
 */
export function getOrCreateToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
