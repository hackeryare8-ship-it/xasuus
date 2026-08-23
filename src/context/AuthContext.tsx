import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { AuthService, AuthSession } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: AuthSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; error?: string }>;
  sendResetCode: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  verifyResetCode: (email: string, code: string) => { success: boolean; error?: string };
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  activateSession: (session: AuthSession) => void;
  updateProfile: (updates: Partial<UserProfile>) => UserProfile | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial active session on application boot
    AuthService.init().then(() => {
      const currentSession = AuthService.getActiveSession();
      if (currentSession) {
        setSession(currentSession);
      }
      setIsLoading(false);
    });
  }, []);

  const activateSession = useCallback((newSession: AuthSession) => {
    setSession(newSession);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!session || !session.user) return null;
    const updated = AuthService.updateUserProfile(session.user.id, updates);
    if (updated) {
      setSession({
        ...session,
        user: updated
      });
    }
    return updated;
  }, [session]);

  const login = async (email: string, password: string) => {
    const result = await AuthService.login(email, password);
    if (result.success && result.session) {
      return { 
        success: true, 
        session: result.session, 
        user: result.user || result.session.user 
      };
    }
    return { 
      success: false, 
      error: result.error 
    };
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await AuthService.register(name, email, password);
    if (result.success && result.session) {
      return { 
        success: true, 
        session: result.session, 
        user: result.user || result.session.user 
      };
    }
    return { 
      success: false, 
      error: result.error 
    };
  };

  const sendResetCode = async (email: string) => {
    return await AuthService.sendPasswordResetCode(email);
  };

  const verifyResetCode = (email: string, code: string) => {
    return AuthService.verifyResetCode(email, code);
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    return await AuthService.resetPassword(email, code, newPassword);
  };

  const logout = useCallback(() => {
    AuthService.logout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user: session ? session.user : null,
        session,
        isLoading,
        login,
        register,
        sendResetCode,
        verifyResetCode,
        resetPassword,
        activateSession,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
