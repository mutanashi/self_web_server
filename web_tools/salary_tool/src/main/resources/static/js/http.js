// Lightweight HTTP helpers with JWT handling
(function () {
  const getJwt = () => localStorage.getItem('jwt') || '';

  async function request(path, options = {}) {
    const headers = options.headers || {};
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    const jwt = getJwt();
    if (jwt) headers['Authorization'] = 'Bearer ' + jwt;

    const res = await fetch(path, { ...options, headers });
    let bodyText = await res.text();
    let body;
    try { body = bodyText ? JSON.parse(bodyText) : null; } catch { body = bodyText; }
    return { ok: res.ok, status: res.status, body };
  }

  async function get(path) {
    return request(path, { method: 'GET' });
  }

  async function post(path, data) {
    return request(path, { method: 'POST', body: JSON.stringify(data || {}) });
  }

  if (!window.Http) window.Http = {};
  window.Http.get = get;
  window.Http.post = post;
  window.Http.request = request;
})();




