import { API_URL } from '../../../config';

export const authService = {
  async signup(data) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(errorData.message || 'Signup failed');
    }
    return response.json();
  },

  async login(data) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Invalid credentials');
    }
    return response.json();
  },

  async forgotPassword(data) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
      throw new Error(errorData.message || 'Failed to send reset email');
    }
    return response.json();
  },

  async resetPassword(data) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reset password' }));
      throw new Error(errorData.message || 'Failed to reset password');
    }
    return response.json();
  }
};
