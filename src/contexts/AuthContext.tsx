import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { customerService } from '../services/customerService';
import type { UserProfile } from '../lib/supabase';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Convert UserProfile to User type
const convertProfileToUser = (profile: UserProfile): User => {
  return {
    id: profile.id,
    email: profile.Email,
    name: profile.Name,
    role: profile.role,
    phone: profile.Phone,
    location: profile.Address,
    farmName: profile.role === 'farmer' ? `ฟาร์ม${profile.Name}` : undefined,
    isVerified: true, // Default to verified for now
    createdAt: new Date(profile.created_at),
    avatar: profile.role === 'farmer' 
      ? 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300'
      : 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300'
  };
};

// Initialize customer data if it doesn't exist
const initializeCustomerData = async (userId: number): Promise<void> => {
  try {
    const existingData = await customerService.getCustomerData(userId);
    
    if (!existingData) {
      // Create initial customer data with empty arrays
      await customerService.createCustomerData(userId, {
        favorites: [],
        following: []
      });
      console.log('Initialized customer data for user:', userId);
    }
  } catch (error) {
    console.error('Failed to initialize customer data:', error);
    // Don't throw error here as it shouldn't block login
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored auth data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('farm2hand_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Verify user still exists in database
        authService.getUserById(user.id)
          .then(async (profile) => {
            if (profile) {
              const updatedUser = convertProfileToUser(profile);
              
              // Initialize customer data if user is a customer
              if (updatedUser.role === 'customer') {
                await initializeCustomerData(updatedUser.id);
              }
              
              dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
            } else {
              localStorage.removeItem('farm2hand_user');
            }
          })
          .catch(() => {
            localStorage.removeItem('farm2hand_user');
          });
      } catch (error) {
        localStorage.removeItem('farm2hand_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const profile = await authService.login(credentials);
      const user = convertProfileToUser(profile);
      
      // Initialize customer data if user is a customer
      if (user.role === 'customer') {
        await initializeCustomerData(user.id);
      }
      
      // Store user data
      localStorage.setItem('farm2hand_user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      // Navigation will be handled by the AuthenticatedLanding component
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const profile = await authService.register(data);
      const user = convertProfileToUser(profile);

      // Initialize customer data if user is a customer
      if (user.role === 'customer') {
        await initializeCustomerData(user.id);
      }

      // Store user data
      localStorage.setItem('farm2hand_user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      // Navigation will be handled by the AuthenticatedLanding component
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('farm2hand_user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    if (!state.user) return;

    dispatch({ type: 'AUTH_START' });

    try {
      // Convert User updates to UserProfile format
      const profileUpdates: Partial<UserProfile> = {};
      if (data.name !== undefined) profileUpdates.Name = data.name;
      if (data.email !== undefined) profileUpdates.Email = data.email;
      if (data.role !== undefined) profileUpdates.role = data.role;
      if (data.phone !== undefined) profileUpdates.Phone = data.phone;
      if (data.location !== undefined) profileUpdates.Address = data.location;

      const updatedProfile = await authService.updateProfile(state.user.id, profileUpdates);
      const updatedUser = convertProfileToUser(updatedProfile);

      // Store updated user data
      localStorage.setItem('farm2hand_user', JSON.stringify(updatedUser));
      dispatch({ type: 'AUTH_SUCCESS', payload: updatedUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};