const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export async function fetchJson(path, { signal, method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body.error === 'string') message = body.error;
      if (body.details && typeof body.details === 'object') {
        const details = Object.entries(body.details)
          .map(([field, detail]) => `${field}: ${detail}`)
          .join(' ');
        if (details) message = `${message} ${details}`;
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function getErrorMessage(error) {
  if (error instanceof Error && error.name === 'AbortError') return '';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
