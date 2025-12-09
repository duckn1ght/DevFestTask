import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type LoginDto, type RegisterDto, type User } from '../api/Auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch (error: any) {
          if (error.message !== 'Unauthorized') {
            console.error('Token verification failed:', error);
          }
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginDto) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      localStorage.setItem('token', response.accessToken);
      setToken(response.accessToken);
      // After login, we might want to fetch the full user profile if the login response doesn't contain everything,
      // but based on the interface I defined, it returns { accessToken, user }.
      // If the backend login response structure is different, we might need to adjust.
      // Assuming response.user is correct.
      if (response.user) {
          setUser(response.user);
      } else {
          // Fallback if user is not in login response
          const userData = await authApi.getMe(response.accessToken);
          setUser(userData);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      localStorage.setItem('token', response.accessToken);
      setToken(response.accessToken);
       if (response.user) {
          setUser(response.user);
      } else {
          const userData = await authApi.getMe(response.accessToken);
          setUser(userData);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
