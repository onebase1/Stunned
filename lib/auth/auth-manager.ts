/**
 * Authentication and Security Manager for Heritage100 CRM
 * Implements role-based access control, user authentication, and security best practices
 */

import { createHash, randomBytes, pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  passwordHash?: string;
  salt?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  loginAttempts: number;
  lockedUntil?: string;
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

export type Permission = 
  | 'clients.read' | 'clients.write' | 'clients.delete'
  | 'properties.read' | 'properties.write' | 'properties.delete'
  | 'contracts.read' | 'contracts.write' | 'contracts.delete'
  | 'payments.read' | 'payments.write' | 'payments.delete'
  | 'analytics.read' | 'analytics.write'
  | 'settings.read' | 'settings.write'
  | 'users.read' | 'users.write' | 'users.delete'
  | 'integrations.read' | 'integrations.write'
  | 'construction.read' | 'construction.write';

export interface AuthSession {
  userId: string;
  sessionId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  requiresTwoFactor?: boolean;
}

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'clients.read', 'clients.write', 'clients.delete',
    'properties.read', 'properties.write', 'properties.delete',
    'contracts.read', 'contracts.write', 'contracts.delete',
    'payments.read', 'payments.write', 'payments.delete',
    'analytics.read', 'analytics.write',
    'settings.read', 'settings.write',
    'users.read', 'users.write', 'users.delete',
    'integrations.read', 'integrations.write',
    'construction.read', 'construction.write'
  ],
  manager: [
    'clients.read', 'clients.write',
    'properties.read', 'properties.write',
    'contracts.read', 'contracts.write',
    'payments.read', 'payments.write',
    'analytics.read', 'analytics.write',
    'settings.read',
    'users.read',
    'integrations.read',
    'construction.read', 'construction.write'
  ],
  agent: [
    'clients.read', 'clients.write',
    'properties.read',
    'contracts.read', 'contracts.write',
    'payments.read',
    'analytics.read',
    'construction.read'
  ],
  viewer: [
    'clients.read',
    'properties.read',
    'contracts.read',
    'payments.read',
    'analytics.read',
    'construction.read'
  ]
};

/**
 * Authentication Manager Class
 */
export class AuthManager {
  private static instance: AuthManager;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'heritage100-secret-key';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  constructor() {
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default users for development
   */
  private initializeDefaultUsers() {
    const defaultUsers: Omit<User, 'passwordHash' | 'salt'>[] = [
      {
        id: '1',
        email: 'admin@heritage100.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ROLE_PERMISSIONS.admin,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        twoFactorEnabled: false,
        loginAttempts: 0
      },
      {
        id: '2',
        email: 'manager@heritage100.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        permissions: ROLE_PERMISSIONS.manager,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        twoFactorEnabled: false,
        loginAttempts: 0
      },
      {
        id: '3',
        email: 'agent@heritage100.com',
        firstName: 'Agent',
        lastName: 'User',
        role: 'agent',
        permissions: ROLE_PERMISSIONS.agent,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        twoFactorEnabled: false,
        loginAttempts: 0
      }
    ];

    defaultUsers.forEach(userData => {
      const { passwordHash, salt } = this.hashPassword('password123');
      const user: User = {
        ...userData,
        passwordHash,
        salt
      };
      this.users.set(user.id, user);
    });
  }

  /**
   * Hash password with salt
   */
  private hashPassword(password: string, salt?: string): { passwordHash: string; salt: string } {
    const passwordSalt = salt || randomBytes(32).toString('hex');
    const passwordHash = pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
    return { passwordHash, salt: passwordSalt };
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User, expiresIn: string = '24h'): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      this.JWT_SECRET,
      { expiresIn }
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET);
      return { valid: true, payload };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid token' 
      };
    }
  }

  /**
   * Check if user is locked out
   */
  private isUserLockedOut(user: User): boolean {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  /**
   * Lock user account
   */
  private lockUserAccount(user: User): void {
    user.lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION).toISOString();
    user.loginAttempts = this.MAX_LOGIN_ATTEMPTS;
    this.users.set(user.id, user);
  }

  /**
   * Reset login attempts
   */
  private resetLoginAttempts(user: User): void {
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    this.users.set(user.id, user);
  }

  /**
   * Authenticate user
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, twoFactorCode, rememberMe } = credentials;

    // Find user by email
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check if user is locked out
    if (this.isUserLockedOut(user)) {
      return { success: false, error: 'Account is temporarily locked. Please try again later.' };
    }

    // Check if user is active
    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active' };
    }

    // Verify password
    if (!user.passwordHash || !user.salt || !this.verifyPassword(password, user.passwordHash, user.salt)) {
      user.loginAttempts++;
      if (user.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
        this.lockUserAccount(user);
        return { success: false, error: 'Account has been locked due to too many failed attempts' };
      }
      this.users.set(user.id, user);
      return { success: false, error: 'Invalid credentials' };
    }

    // Check two-factor authentication
    if (user.twoFactorEnabled && !twoFactorCode) {
      return { success: false, requiresTwoFactor: true };
    }

    if (user.twoFactorEnabled && twoFactorCode) {
      // In a real implementation, verify the 2FA code here
      // For now, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(twoFactorCode)) {
        return { success: false, error: 'Invalid two-factor authentication code' };
      }
    }

    // Reset login attempts on successful login
    this.resetLoginAttempts(user);

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.users.set(user.id, user);

    // Create session
    const sessionId = randomBytes(32).toString('hex');
    const token = this.generateToken(user, rememberMe ? '30d' : '24h');
    const refreshToken = this.generateRefreshToken();
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString();

    const session: AuthSession = {
      userId: user.id,
      sessionId,
      token,
      refreshToken,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    this.sessions.set(sessionId, session);

    // Remove sensitive data from user object
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    delete safeUser.salt;
    delete safeUser.twoFactorSecret;

    return { success: true, user: safeUser, session };
  }

  /**
   * Logout user
   */
  async logout(sessionId: string): Promise<{ success: boolean }> {
    this.sessions.delete(sessionId);
    return { success: true };
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    const user = this.users.get(userId);
    if (user) {
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      delete safeUser.salt;
      delete safeUser.twoFactorSecret;
      return safeUser;
    }
    return undefined;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): AuthSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && new Date(session.expiresAt) > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(sessionId);
    }
    return undefined;
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(user: User, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if user has all permissions
   */
  hasAllPermissions(user: User, permissions: Permission[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission));
  }

  /**
   * Get all users (admin only)
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      delete safeUser.salt;
      delete safeUser.twoFactorSecret;
      return safeUser;
    });
  }

  /**
   * Create new user
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginAttempts' | 'permissions'> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Check if email already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const { password, ...userInfo } = userData;
    const { passwordHash, salt } = this.hashPassword(password);

    const newUser: User = {
      ...userInfo,
      id: randomBytes(16).toString('hex'),
      permissions: ROLE_PERMISSIONS[userData.role],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginAttempts: 0,
      passwordHash,
      salt
    };

    this.users.set(newUser.id, newUser);

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;
    delete safeUser.salt;
    delete safeUser.twoFactorSecret;

    return { success: true, user: safeUser };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update permissions if role changed
    if (updates.role && updates.role !== user.role) {
      updatedUser.permissions = ROLE_PERMISSIONS[updates.role];
    }

    this.users.set(userId, updatedUser);

    const safeUser = { ...updatedUser };
    delete safeUser.passwordHash;
    delete safeUser.salt;
    delete safeUser.twoFactorSecret;

    return { success: true, user: safeUser };
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.users.has(userId)) {
      return { success: false, error: 'User not found' };
    }

    this.users.delete(userId);
    
    // Remove all sessions for this user
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }

    return { success: true };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.users.get(userId);
    if (!user || !user.passwordHash || !user.salt) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    if (!this.verifyPassword(currentPassword, user.passwordHash, user.salt)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const { passwordHash, salt } = this.hashPassword(newPassword);
    
    user.passwordHash = passwordHash;
    user.salt = salt;
    user.updatedAt = new Date().toISOString();
    
    this.users.set(userId, user);

    return { success: true };
  }
}

/**
 * Authentication Context and Hooks
 */
export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

/**
 * Permission-based route protection
 */
export function requirePermissions(permissions: Permission[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // In a real implementation, this would check the current user's permissions
      // For now, we'll just log the required permissions
      console.log(`Route ${propertyName} requires permissions:`, permissions);
      return method.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Role-based route protection
 */
export function requireRole(role: UserRole) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // In a real implementation, this would check the current user's role
      console.log(`Route ${propertyName} requires role:`, role);
      return method.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Security utilities
 */
export class SecurityUtils {
  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Password should contain uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Password should contain numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Password should contain special characters');

    return {
      score,
      feedback,
      isStrong: score >= 4
    };
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    // In a real implementation, this would use Redis or a database
    // For now, we'll use a simple in-memory store
    const attempts = this.rateLimitStore.get(identifier) || { count: 0, resetTime: Date.now() + windowMs };

    if (Date.now() > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = Date.now() + windowMs;
    }

    if (attempts.count >= maxAttempts) {
      return false;
    }

    attempts.count++;
    this.rateLimitStore.set(identifier, attempts);
    return true;
  }

  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();
}

// Export singleton instance
export const authManager = AuthManager.getInstance();
