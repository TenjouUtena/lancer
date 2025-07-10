const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Download file (for endpoints that return files)
  async download(endpoint) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      method: 'GET',
      headers: {},
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Return the blob for file downloads
      return await response.blob();
    } catch (error) {
      console.error('API download failed:', error);
      throw error;
    }
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const token = this.getAuthToken();
    const config = {
      method: 'POST',
      body: formData,
    };

    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, config);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

// Export specific API functions
export const api = {
  // Auth
  auth: {
    googleLogin: (idToken) => apiClient.post('/api/auth/google', { idToken }),
    getCurrentUser: () => apiClient.get('/api/auth/me'),
    logout: () => apiClient.post('/api/auth/logout', {}),
  },

  // Artists
  artists: {
    getAll: () => apiClient.get('/api/artists'),
    getTop5: () => apiClient.get('/api/artists/top_5'),
    getById: (id) => apiClient.get(`/api/artists/${id}`),
    create: (artist) => apiClient.post('/api/artists', artist),
    update: (id, artist) => apiClient.put(`/api/artists/${id}`, artist),
    delete: (id) => apiClient.delete(`/api/artists/${id}`),
  },

  // Customers
  customers: {
    getAll: () => apiClient.get('/api/customers'),
    getById: (id) => apiClient.get(`/api/customers/${id}`),
    create: (customer) => apiClient.post('/api/customers', customer),
    update: (id, customer) => apiClient.put(`/api/customers/${id}`, customer),
    delete: (id) => apiClient.delete(`/api/customers/${id}`),
  },

  // Products
  products: {
    getAll: () => apiClient.get('/api/products'),
    getById: (id) => apiClient.get(`/api/products/${id}`),
    getByArtist: (artistId) => apiClient.get(`/api/products/artist/${artistId}`),
    getAvailable: () => apiClient.get('/api/products/available'),
    create: (product) => apiClient.post('/api/products', product),
    update: (id, product) => apiClient.put(`/api/products/${id}`, product),
    delete: (id) => apiClient.delete(`/api/products/${id}`),
  },

  // Orders
  orders: {
    getAll: () => apiClient.get('/api/orders'),
    getById: (id) => apiClient.get(`/api/orders/${id}`),
    getTop5: () => apiClient.get('/api/orders/top_5'),
    getByCustomer: (customerId) => apiClient.get(`/api/orders/customer/${customerId}`),
    getByStatus: (status) => apiClient.get(`/api/orders/status/${status}`),
    create: (order) => apiClient.post('/api/orders', order),
    update: (id, order) => apiClient.put(`/api/orders/${id}`, order),
    delete: (id) => apiClient.delete(`/api/orders/${id}`),
  },

  // Artist Bases
  artistBases: {
    getAll: () => apiClient.get('/api/artist-bases'),
    getById: (id) => apiClient.get(`/api/artist-bases/${id}`),
    getByArtist: (artistId) => apiClient.get(`/api/artist-bases/by-artist/${artistId}`),
    search: (params) => {
      const queryParams = new URLSearchParams();
      if (params.name) queryParams.append('name', params.name);
      if (params.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
      if (params.minPrice !== undefined && params.minPrice !== null) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined && params.maxPrice !== null) queryParams.append('maxPrice', params.maxPrice.toString());
      return apiClient.get(`/api/artist-bases/search?${queryParams.toString()}`);
    },
    create: (artistBase) => apiClient.post('/api/artist-bases', artistBase),
    createWithImage: (formData) => apiClient.postFormData('/api/artist-bases/upload', formData),
    update: (id, artistBase) => apiClient.put(`/api/artist-bases/${id}`, artistBase),
    updateWithImage: (id, formData) => apiClient.postFormData(`/api/artist-bases/${id}/upload`, formData),
    delete: (id) => apiClient.delete(`/api/artist-bases/${id}`),
  },

  // Tags
  tags: {
    getAll: () => apiClient.get('/api/tags'),
    getById: (id) => apiClient.get(`/api/tags/${id}`),
    create: (tag) => apiClient.post('/api/tags', tag),
    update: (id, tag) => apiClient.put(`/api/tags/${id}`, tag),
    delete: (id) => apiClient.delete(`/api/tags/${id}`),
  },

  // Commissions
  commissions: {
    getAll: () => apiClient.get('/api/commissions'),
    getById: (id) => apiClient.get(`/api/commissions/${id}`),
    create: (commission) => apiClient.post('/api/commissions', commission),
    update: (id, commission) => apiClient.put(`/api/commissions/${id}`, commission),
    delete: (id) => apiClient.delete(`/api/commissions/${id}`),
  },

  // Export
  export: {
    download: () => apiClient.download('/api/export'),
  },
};

export default apiClient;
