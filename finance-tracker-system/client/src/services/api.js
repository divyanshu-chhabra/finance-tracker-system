const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },
  login: async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },
  getMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },
  updateProfile: async (data) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};

// Assets API
export const assetsAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/assets`, { headers: getHeaders() });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/assets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/assets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/assets/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

// Liabilities API
export const liabilitiesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/liabilities`, { headers: getHeaders() });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/liabilities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/liabilities/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/liabilities/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

// Expenses API
export const expensesAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/expenses?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getBudgets: async (month, year) => {
    const res = await fetch(`${API_URL}/expenses/budgets?month=${month}&year=${year}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  setBudget: async (data) => {
    const res = await fetch(`${API_URL}/expenses/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};

// AI API
export const aiAPI = {
  analyze: async () => {
    const res = await fetch(`${API_URL}/ai/analyze`, { headers: getHeaders() });
    return handleResponse(res);
  },
  chat: async (message) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse(res);
  },
  getDashboard: async () => {
    const res = await fetch(`${API_URL}/ai/dashboard`, { headers: getHeaders() });
    return handleResponse(res);
  }
};

// Recurring Expenses API
export const recurringExpensesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/recurring-expenses`, { headers: getHeaders() });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/recurring-expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/recurring-expenses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/recurring-expenses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  toggle: async (id) => {
    const res = await fetch(`${API_URL}/recurring-expenses/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  generate: async () => {
    const res = await fetch(`${API_URL}/recurring-expenses/generate`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

// Income API
export const incomeAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/income?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  create: async (data) => {
    const res = await fetch(`${API_URL}/income`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/income/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  delete: async (id) => {
    const res = await fetch(`${API_URL}/income/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  getSummary: async () => {
    const res = await fetch(`${API_URL}/income/summary`, { headers: getHeaders() });
    return handleResponse(res);
  }
};

// Budget Alerts API
export const budgetAlertsAPI = {
  getAlerts: async (month, year) => {
    const res = await fetch(`${API_URL}/expenses/budget-alerts?month=${month}&year=${year}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};

