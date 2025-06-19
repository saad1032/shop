import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthData: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app start
    const initAuth = async () => {
      try {
        console.log('=== INITIALIZING AUTH ===');
        setLoading(true);
        
        // Clear any existing auth data for testing
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        console.log('Cleared existing auth data for testing');
        
        // Check auth status
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        
        console.log('Stored token:', token);
        console.log('Stored userData:', userData);
        
        if (token && userData) {
          console.log('User is authenticated, setting state...');
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          console.log('No stored authentication data found');
          setIsAuthenticated(false);
          setUser(null);
        }
        
        console.log('Setting loading to false');
        setLoading(false);
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== LOGIN FUNCTION CALLED ===');
      console.log('Email:', email);
      console.log('Password:', password);
      
      setLoading(true);
      
      // Simple validation
      if (!email || !password) {
        console.log('Login failed - missing credentials');
        return false;
      }

      console.log('Creating mock user for login...');
      const mockUser = {
        id: 1,
        email,
        name: email.split('@')[0],
        avatar: null,
      };

      console.log('Mock user created:', mockUser);

      // Store authentication data
      await AsyncStorage.setItem('authToken', 'mock-jwt-token');
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      console.log('Authentication data stored');
      
      setUser(mockUser);
      setIsAuthenticated(true);
      console.log('User state updated, returning true');
      return true;
      
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    console.log('=== SIGNUP FUNCTION CALLED ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('FullName:', fullName);
    
    try {
      setLoading(true);
      
      // Simple validation
      if (!email || !password || !fullName) {
        console.log('Signup failed - missing required fields');
        return false;
      }

      console.log('Creating mock user...');
      const mockUser = {
        id: Date.now(), // Generate unique ID
        email,
        name: fullName,
        avatar: null,
      };

      console.log('Mock user created:', mockUser);

      // Store authentication data
      await AsyncStorage.setItem('authToken', 'mock-jwt-token-signup');
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      
      console.log('Authentication data stored');
      
      setUser(mockUser);
      setIsAuthenticated(true);
      console.log('User state updated, returning true');
      return true;
      
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Clear stored authentication data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Clear stored authentication data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Clear auth data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    clearAuthData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 