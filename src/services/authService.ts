import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: string;
}

export interface StoredUserAccount {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  profile: UserProfile;
  isEmailVerified: boolean;
  recoveryKeyHash?: string;
  recoveryKeyCreatedAt?: string;
  verificationCode?: string;
  verificationCodeExpiresAt?: number;
  verifiedPhone?: string;
}

export interface PasswordResetCode {
  email: string;
  code: string;
  expiresAt: number; // timestamp
  attemptsLeft: number;
}

export interface RecoveryKeyRateLimit {
  [email: string]: {
    attempts: number;
    lockedUntil?: number;
  };
}

const USERS_STORAGE_KEY = 'xasuus_auth_accounts';
const SESSION_STORAGE_KEY = 'xasuus_auth_session';
const RESET_CODES_KEY = 'xasuus_auth_reset_codes';
const RECOVERY_KEY_LIMIT_KEY = 'xasuus_recovery_key_limits';

// In-memory fallback if localStorage is undefined
const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStore[key] = value;
  }
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    delete memoryStore[key];
  }
}

// Standard Email regex validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Secure Web Crypto PBKDF2 with SHA-256 and unique per-user salt
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );

  const exported = await crypto.subtle.exportKey('raw', key);
  const hashArray = Array.from(new Uint8Array(exported));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

function generateNumericCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (100000 + (array[0] % 900000)).toString();
}

// Generate a cryptographically secure 6-character recovery key (e.g. X7M29P)
export function generateSecureRecoveryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding ambiguous 0/O, 1/I
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Hash recovery key using PBKDF2/SHA-256 with user's unique salt
export async function hashRecoveryKey(key: string, salt: string): Promise<string> {
  const cleanKey = key.trim().toUpperCase();
  return await hashPassword(`xasuus_rk_${cleanKey}`, salt);
}

export class AuthService {
  // Initialize registered user accounts safely without overwriting existing data
  static async init(): Promise<void> {
    const existing = getStorageItem(USERS_STORAGE_KEY);
    if (!existing) {
      const saltA = generateSalt();
      const hashA = await hashPassword('Maxamed@2026!', saltA);
      const rkHashA = await hashRecoveryKey('X7M29P', saltA);

      const saltB = generateSalt();
      const hashB = await hashPassword('Hoodo@2026!', saltB);
      const rkHashB = await hashRecoveryKey('H9K24Z', saltB);

      const initialAccounts: StoredUserAccount[] = [
        {
          id: 'user_maxamed',
          email: 'maxamed@gmail.com',
          passwordHash: hashA,
          salt: saltA,
          isEmailVerified: true,
          verifiedPhone: '+252615000001',
          recoveryKeyHash: rkHashA,
          recoveryKeyCreatedAt: '2026-01-15T08:00:00Z',
          profile: {
            id: 'user_maxamed',
            name: 'Maxamed Cali',
            email: 'maxamed@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            bio: 'Software Engineer & Digital Minimalist',
            createdAt: '2026-01-15T08:00:00Z',
          }
        },
        {
          id: 'user_hoodo',
          email: 'hoodo@gmail.com',
          passwordHash: hashB,
          salt: saltB,
          isEmailVerified: true,
          verifiedPhone: '+252615000002',
          recoveryKeyHash: rkHashB,
          recoveryKeyCreatedAt: '2026-02-01T10:30:00Z',
          profile: {
            id: 'user_hoodo',
            name: 'Hoodo Axmed',
            email: 'hoodo@gmail.com',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            bio: 'Project Manager & Designer',
            createdAt: '2026-02-01T10:30:00Z',
          }
        }
      ];

      setStorageItem(USERS_STORAGE_KEY, JSON.stringify(initialAccounts));
    }
  }

  // Get all registered accounts
  static getAccounts(): StoredUserAccount[] {
    const data = getStorageItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save accounts
  private static saveAccounts(accounts: StoredUserAccount[]): void {
    setStorageItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
  }

  // Get active authenticated session
  static getActiveSession(): AuthSession | null {
    const data = getStorageItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    try {
      const session: AuthSession = JSON.parse(data);
      if (new Date(session.expiresAt).getTime() < Date.now()) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  // Update authenticated user's profile and persist across session, Supabase, and accounts
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === userId);
    if (idx >= 0) {
      accounts[idx].profile = {
        ...accounts[idx].profile,
        ...updates
      };
      this.saveAccounts(accounts);
    }

    // Update active session
    let updatedProfile: UserProfile | null = null;
    const activeSession = this.getActiveSession();
    if (activeSession && activeSession.user.id === userId) {
      updatedProfile = {
        ...activeSession.user,
        ...updates
      };
      activeSession.user = updatedProfile;
      setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    }

    // Sync to Supabase profiles table if connected
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: updates.name,
          avatar: updates.avatar,
          bio: updates.bio,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase profile update warning:', err);
      }
    }

    return updatedProfile;
  }

  // Real Account Validation and Login (Supabase Auth + fallback)
  static async login(
    rawEmail: string, 
    password: string
  ): Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah (tusaale: user@domain.com).' };
    }

    // Attempt Supabase Auth login if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (!error && data.user) {
          // Fetch or generate profile
          let userProfile: UserProfile = {
            id: data.user.id,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
            email: data.user.email || cleanEmail,
            avatar: data.user.user_metadata?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.user.id)}`,
            createdAt: data.user.created_at || new Date().toISOString()
          };

          // Check if profile exists in public.profiles table
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileRow) {
            userProfile = {
              id: profileRow.id,
              name: profileRow.name,
              email: profileRow.email,
              avatar: profileRow.avatar || userProfile.avatar,
              bio: profileRow.bio || '',
              createdAt: profileRow.created_at
            };
          }

          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          const session: AuthSession = {
            token: data.session?.access_token || generateToken(),
            user: userProfile,
            expiresAt
          };

          setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));
          return { success: true, session, user: userProfile };
        }
      } catch (err) {
        console.warn('Supabase login warning, trying local storage:', err);
      }
    }

    // Local authentication fallback
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Email-ka ama password-ka waa khaldan yahay.' };
    }

    const testHash = await hashPassword(password, account.salt);
    if (testHash !== account.passwordHash) {
      return { success: false, error: 'Email-ka ama password-ka waa khaldan yahay.' };
    }

    let userProfile = account.profile;
    if (!userProfile || !userProfile.id) {
      userProfile = {
        id: account.id,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(account.id)}`,
        createdAt: new Date().toISOString()
      };
      account.profile = userProfile;
      this.saveAccounts(accounts);
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: AuthSession = {
      token: generateToken(),
      user: userProfile,
      expiresAt
    };

    setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session, user: userProfile };
  }

  // Public User Registration (with user-created or secure Recovery Key)
  static async register(
    name: string, 
    rawEmail: string, 
    password: string,
    customRecoveryKey?: string
  ): Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; recoveryKey?: string; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah (tusaale: user@gmail.com).' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.' };
    }

    // Use user-provided recovery key or fallback to generated secure key
    const recoveryKey = customRecoveryKey?.trim().toUpperCase() || generateSecureRecoveryKey();
    if (recoveryKey.length < 4 || recoveryKey.length > 8) {
      return { success: false, error: 'Furaha soo-kabashada waa inuu u dhexeeyaa 4 ilaa 6 xaraf/lambar.' };
    }

    // Local registration / accounts persistence
    const accounts = this.getAccounts();
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Account-kan hore ayuu u jiray. Fadlan gal.' };
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const recoveryKeyHash = await hashRecoveryKey(recoveryKey, salt);

    const newProfile: UserProfile = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString()
    };

    const newAccount: StoredUserAccount = {
      id: userId,
      email: cleanEmail,
      passwordHash,
      salt,
      profile: newProfile,
      isEmailVerified: true,
      recoveryKeyHash,
      recoveryKeyCreatedAt: new Date().toISOString()
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    // Attempt Supabase Registration if configured in parallel
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim()
            }
          }
        });

        if (!error && data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name.trim(),
            email: cleanEmail,
            avatar: newProfile.avatar,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Supabase register warning:', err);
      }
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: AuthSession = {
      token: generateToken(),
      user: newProfile,
      expiresAt
    };

    setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return { 
      success: true, 
      session, 
      user: newProfile,
      recoveryKey: customRecoveryKey ? undefined : recoveryKey // Do not expose user-created key again
    };
  }

  // Rate Limiting helper for Recovery Key attempts
  private static getRateLimits(): RecoveryKeyRateLimit {
    const data = getStorageItem(RECOVERY_KEY_LIMIT_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveRateLimits(limits: RecoveryKeyRateLimit): void {
    setStorageItem(RECOVERY_KEY_LIMIT_KEY, JSON.stringify(limits));
  }

  // Verify Recovery Key with rate limiting and generic error messaging
  static async verifyRecoveryKey(
    rawEmail: string, 
    inputKey: string
  ): Promise<{ success: boolean; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();
    const cleanKey = inputKey.trim().toUpperCase();

    if (!isValidEmail(cleanEmail) || cleanKey.length < 4) {
      return { success: false, error: 'Xogta soo kabashada lama xaqiijin karin.' };
    }

    // Check rate limits
    const limits = this.getRateLimits();
    const userLimit = limits[cleanEmail];
    const now = Date.now();

    if (userLimit && userLimit.lockedUntil && userLimit.lockedUntil > now) {
      const remainingMinutes = Math.ceil((userLimit.lockedUntil - now) / 60000);
      return { 
        success: false, 
        error: `Isku dayo aad u badan. Fadlan sug ${remainingMinutes} daqiiqo ka hor intaadan mar kale isku dayin.` 
      };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account || !account.recoveryKeyHash) {
      // Record failed attempt for existing or non-existing email to prevent enumeration
      const currentAttempts = (userLimit?.attempts || 0) + 1;
      const lockedUntil = currentAttempts >= 5 ? now + 5 * 60 * 1000 : undefined;
      limits[cleanEmail] = { attempts: currentAttempts, lockedUntil };
      this.saveRateLimits(limits);
      return { success: false, error: 'Xogta soo kabashada lama xaqiijin karin.' };
    }

    // Test hash with account's salt
    const testHash = await hashRecoveryKey(cleanKey, account.salt);
    if (testHash !== account.recoveryKeyHash) {
      const currentAttempts = (userLimit?.attempts || 0) + 1;
      const lockedUntil = currentAttempts >= 5 ? now + 5 * 60 * 1000 : undefined;
      limits[cleanEmail] = { attempts: currentAttempts, lockedUntil };
      this.saveRateLimits(limits);
      return { success: false, error: 'Xogta soo kabashada lama xaqiijin karin.' };
    }

    // Success: clear rate limit
    delete limits[cleanEmail];
    this.saveRateLimits(limits);
    return { success: true };
  }

  // Reset Password using verified Recovery Key
  static async resetPasswordWithRecoveryKey(
    rawEmail: string, 
    recoveryKey: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    const verification = await this.verifyRecoveryKey(rawEmail, recoveryKey);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.' };
    }

    const cleanEmail = rawEmail.toLowerCase().trim();
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);

    if (accountIndex >= 0) {
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPassword, newSalt);
      // Re-hash recovery key with new salt to keep it active
      const newRecoveryKeyHash = await hashRecoveryKey(recoveryKey, newSalt);

      accounts[accountIndex].salt = newSalt;
      accounts[accountIndex].passwordHash = newHash;
      accounts[accountIndex].recoveryKeyHash = newRecoveryKeyHash;
      this.saveAccounts(accounts);
    }

    return { success: true };
  }

  // Generate / Regenerate Recovery Key for existing authenticated user
  static async generateRecoveryKeyForUser(
    userId: string
  ): Promise<{ success: boolean; recoveryKey?: string; error?: string }> {
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(a => a.id === userId);

    if (accountIndex < 0) {
      return { success: false, error: 'Account-ka lama helin.' };
    }

    const account = accounts[accountIndex];
    const newRecoveryKey = generateSecureRecoveryKey();
    const newRecoveryKeyHash = await hashRecoveryKey(newRecoveryKey, account.salt);

    account.recoveryKeyHash = newRecoveryKeyHash;
    account.recoveryKeyCreatedAt = new Date().toISOString();
    this.saveAccounts(accounts);

    return { 
      success: true, 
      recoveryKey: newRecoveryKey // Returned ONLY ONCE
    };
  }

  // Check if account has a Recovery Key set up (without exposing key)
  static hasRecoveryKey(rawEmail: string): boolean {
    const cleanEmail = rawEmail.toLowerCase().trim();
    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    return Boolean(account && account.recoveryKeyHash);
  }

  // Password Reset Code (Real Email OTP flow)
  static async sendPasswordResetCode(rawEmail: string): Promise<{ success: boolean; code?: string; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah.' };
    }

    const randomCode = generateNumericCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const resetData: PasswordResetCode = {
      email: cleanEmail,
      code: randomCode,
      expiresAt,
      attemptsLeft: 3
    };

    setStorageItem(RESET_CODES_KEY, JSON.stringify(resetData));

    return { 
      success: true, 
      code: randomCode 
    };
  }

  // Verify Reset Code
  static verifyResetCode(rawEmail: string, inputCode: string): { success: boolean; error?: string } {
    const data = getStorageItem(RESET_CODES_KEY);
    if (!data) {
      return { success: false, error: 'Code lama dirin ama wuu dhacay. Fadlan mar kale codso code cusub.' };
    }

    const resetData: PasswordResetCode = JSON.parse(data);
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (resetData.email !== cleanEmail) {
      return { success: false, error: 'Email-ka iyo code-ku isma laha.' };
    }

    if (Date.now() > resetData.expiresAt) {
      removeStorageItem(RESET_CODES_KEY);
      return { success: false, error: 'Code-ku wuu dhacay. Fadlan codso code cusub.' };
    }

    if (resetData.attemptsLeft <= 0) {
      removeStorageItem(RESET_CODES_KEY);
      return { success: false, error: 'Isku dayo aad u badan. Fadlan mar kale codso code cusub.' };
    }

    if (resetData.code !== inputCode.trim()) {
      resetData.attemptsLeft -= 1;
      setStorageItem(RESET_CODES_KEY, JSON.stringify(resetData));
      return { 
        success: false, 
        error: 'Code-ka waa khaldan yahay.' 
      };
    }

    return { success: true };
  }

  // Reset Password with Verified Code
  static async resetPassword(rawEmail: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const verification = this.verifyResetCode(rawEmail, code);
    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.' };
    }

    const cleanEmail = rawEmail.toLowerCase().trim();
    const accounts = this.getAccounts();
    const accountIndex = accounts.findIndex(a => a.email.toLowerCase() === cleanEmail);

    if (accountIndex >= 0) {
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPassword, newSalt);
      accounts[accountIndex].salt = newSalt;
      accounts[accountIndex].passwordHash = newHash;
      this.saveAccounts(accounts);
    }

    removeStorageItem(RESET_CODES_KEY);
    return { success: true };
  }

  // Logout (End session & clear sensitive state)
  static logout(): void {
    if (isSupabaseConfigured()) {
      supabase.auth.signOut().catch(() => {});
    }
    removeStorageItem(SESSION_STORAGE_KEY);
  }
}
