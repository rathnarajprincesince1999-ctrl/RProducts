import { API_URL } from '../config';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token based on the endpoint
    let token = null;
    if (endpoint.startsWith('/admin/')) {
      token = localStorage.getItem('adminToken');
    } else if (endpoint.startsWith('/seller/')) {
      token = localStorage.getItem('sellerToken');
    } else {
      token = localStorage.getItem('token');
    }

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle unauthorized responses
      if (response.status === 401 || response.status === 403) {
        this.handleUnauthorized();
        throw new Error('Unauthorized access');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      if (error.message === 'Unauthorized access') {
        this.handleUnauthorized();
      }
      throw error;
    }
  }

  handleUnauthorized() {
    // Clear all tokens and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('seller');
    
    window.location.href = '/';
  }

  // HTTP methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;