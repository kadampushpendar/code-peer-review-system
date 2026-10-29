// All calls to the Spring Boot backend live here.
const KEY = 'peer-review-auth';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const getAuth = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
};
export const setAuth = (value) =>
  value ? sessionStorage.setItem(KEY, JSON.stringify(value)) : sessionStorage.removeItem(KEY);

const basicToken = (email, password) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(`${email}:${password}`)));

async function request(method, path, body, token) {
  const auth = token || getAuth()?.token;
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: 'Basic ' + auth } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot connect to backend server. Please verify Spring Boot is running on port 8080.');
  }

  const data = await res.json().catch(() => null);
  if (res.status === 401 && !token && getAuth()) {
    setAuth(null);
    window.location.assign('/login');
  }

  if (!res.ok) {
    if (res.status === 500 && !data?.message) {
      throw new Error('Backend server is offline or connection refused on port 8080. Please ensure Spring Boot is running.');
    }
    if (res.status === 401) {
      throw new Error('Invalid email or password. Please check your credentials or create an account.');
    }
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  async login(email, password) {
    const token = basicToken(email.trim(), password);
    const user = await request('POST', '/auth/login', null, token);
    setAuth({ token, user });
    return user;
  },
  currentUser: () => request('GET', '/auth/me'),
  register: (body) => request('POST', '/auth/register', body),
  submissions: () => request('GET', '/submissions'),
  createSubmission: (body) => request('POST', '/submissions', body),
  reviews: () => request('GET', '/reviews'),
  review: (id) => request('GET', `/reviews/${id}`),
  addComment: (id, body) => request('POST', `/reviews/${id}/comments`, body),
  submitReview: (id, body) => request('PATCH', `/reviews/${id}/submit`, body),
  notifications: () => request('GET', '/notifications'),
  markAllRead: () => request('PATCH', '/notifications/read-all'),
  report: () => request('GET', '/teacher/reports'),
};
