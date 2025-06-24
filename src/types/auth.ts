export interface User {
  id: number;
  email: string;
  name: string;
  role: 'farmer' | 'customer';
  avatar?: string;
  phone?: string;
  location?: string;
  farmName?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'farmer' | 'customer';
  phone?: string;
  location?: string;
  farmName?: string;
}