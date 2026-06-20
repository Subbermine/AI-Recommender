import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Fetch and set CSRF token on initialization
const setCsrfToken = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/auth/csrf-token', { withCredentials: true });
    API.defaults.headers.common['X-CSRFToken'] = data.csrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token', err);
  }
};
setCsrfToken();

// Request interceptor to automatically attach authorization tokens if present
API.interceptors.request.use(
  (config) => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        if (userInfo && userInfo.token) {
          config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
      } catch (err) {
        console.error('Error parsing userInfo from localStorage', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
