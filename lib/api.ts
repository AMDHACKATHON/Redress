import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Since we are using NextAuth, cookies are automatically sent with requests 
// to the same origin. We don't need to manually attach Bearer tokens 
// unless we are calling an external API.

export default api;
