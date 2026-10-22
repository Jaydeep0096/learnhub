const listeners = new Set();
export const onRequestLog = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export async function request(path, options = {}) {
  const started = performance.now();
  const entry = { method: options.method || 'GET', url: `/api${path}`, status: 0, ms: 0, contentType: '' };
  let aborted = false;
  try {
    const res = await fetch(entry.url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    entry.status = res.status;
    entry.contentType = res.headers.get('content-type') || '';
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
      throw Object.assign(new Error(body?.error?.message || `HTTP ${res.status}`), {
        status: res.status,
        details: body?.error?.details,
      });
    }
    return body;
  } catch (err) {
    if (err.name === 'AbortError') { aborted = true; throw err; }
    if (err instanceof TypeError) throw new Error('Network error: cannot reach the API');
    throw err;
  } finally {
    entry.ms = Math.round(performance.now() - started);
    if (!aborted) listeners.forEach((fn) => fn({ ...entry }));
  }
}
