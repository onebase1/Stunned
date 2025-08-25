'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  authManager, 
  User, 
  AuthSession, 
  LoginCredentials, 
  AuthResult, 
  Permission,
  AuthContextType 
} from '@/lib/auth/auth-manager';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for existing session in localStorage
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        
        // Verify token
        const tokenVerification = authManager.verifyToken(sessionData.token);
        if (tokenVerification.valid) {
          // Get fresh user data
          const userData = authManager.getUserById(sessionData.user.id);
          if (userData) {
            setUser(userData);
            setSession(sessionData);
          } else {
            // User not found, clear session
            localStorage.removeItem('auth_session');
          }
        } else {
          // Token invalid, clear session
          localStorage.removeItem('auth_session');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('auth_session');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      const result = await authManager.login(credentials);
      
      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        
        // Store session in localStorage
        localStorage.setItem('auth_session', JSON.stringify({
          sessionId: result.session.sessionId,
          token: result.session.token,
          user: result.user
        }));
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      if (session) {
        await authManager.logout(session.sessionId);
      }
      
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_session');
      
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_session');
      router.push('/login');
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return authManager.hasPermission(user, permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return authManager.hasAnyPermission(user, permissions);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return authManager.hasAllPermissions(user, permissions);
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Higher-order component for route protection
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  permissions = [], 
  roles = [], 
  fallback 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Check role requirements
  if (roles.length > 0 && !roles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = permissions.every(permission => 
      user.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Hook for permission-based UI rendering
 */
export function usePermissions() {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead: (resource: string) => hasPermission(`${resource}.read` as Permission),
    canWrite: (resource: string) => hasPermission(`${resource}.write` as Permission),
    canDelete: (resource: string) => hasPermission(`${resource}.delete` as Permission),
    isAdmin: () => user?.role === 'admin',
    isManager: () => user?.role === 'manager' || user?.role === 'admin',
    isAgent: () => ['agent', 'manager', 'admin'].includes(user?.role || ''),
  };
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
}

export function PermissionGate({ 
  children, 
  permissions = [], 
  roles = [], 
  fallback = null,
  requireAll = true 
}: PermissionGateProps) {
  const { user, hasAnyPermission, hasAllPermissions } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * User profile component
 */
export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
      </div>
      <div className="hidden md:block">
        <div className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </div>
        <div className="text-xs text-gray-600 capitalize">{user.role}</div>
      </div>
      <button
        onClick={logout}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        Logout
      </button>
    </div>
  );
}
