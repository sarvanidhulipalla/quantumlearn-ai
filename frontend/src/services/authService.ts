import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const authService = {
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async checkHealth(): Promise<{ status: string; app_name: string; database: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};
