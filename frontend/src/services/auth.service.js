import ApiService from './api.service';
import { API_ENDPOINTS } from '../config/api';

class AuthService {
  async login(email, password) {
    const response = await ApiService.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async signup(userData) {
    const response = await ApiService.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();