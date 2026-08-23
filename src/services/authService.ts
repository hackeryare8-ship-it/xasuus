import { UserProfile } from '../types';

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

const USERS_STORAGE_KEY = 'xasuus_auth_accounts';
const SESSION_STORAGE_KEY = 'xasuus_auth_session';
const RESET_CODES_KEY = 'xasuus_auth_reset_codes';

// In-memory fallback if localStorage is undefined (e.g. during Node testing)
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

// Standard Email regex validation (supports all providers: Gmail, Outlook, Yahoo, iCloud, Proton, etc.)
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

export class AuthService {
  // Initialize registered user accounts safely without overwriting existing data
  static async init(): Promise<void> {
    const existing = getStorageItem(USERS_STORAGE_KEY);
    if (!existing) {
      const saltA = generateSalt();
      const hashA = await hashPassword('Maxamed@2026!', saltA);

      const saltB = generateSalt();
      const hashB = await hashPassword('Hoodo@2026!', saltB);

      const initialAccounts: StoredUserAccount[] = [
        {
          id: 'user_maxamed',
          email: 'maxamed@gmail.com',
          passwordHash: hashA,
          salt: saltA,
          isEmailVerified: true,
          verifiedPhone: '+252615000001',
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

  // Update authenticated user's profile and persist across session and accounts
  static updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile | null {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex(a => a.id === userId);
    if (idx === -1) return null;

    const updatedProfile: UserProfile = {
      ...accounts[idx].profile,
      ...updates
    };

    accounts[idx].profile = updatedProfile;
    this.saveAccounts(accounts);

    // Update active session if this is the active user
    const activeSession = this.getActiveSession();
    if (activeSession && activeSession.user.id === userId) {
      activeSession.user = updatedProfile;
      setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(activeSession));
    }

    return updatedProfile;
  }

  // Real Account Validation and Login
  static async login(
    rawEmail: string, 
    password: string
  ): Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah (tusaale: user@domain.com).' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    // If account does not exist -> Reject explicitly
    if (!account) {
      return { success: false, error: 'Email-ka ama password-ka waa khaldan yahay.' };
    }

    // Verify password securely with salt and PBKDF2 hash
    const testHash = await hashPassword(password, account.salt);
    if (testHash !== account.passwordHash) {
      return { success: false, error: 'Email-ka ama password-ka waa khaldan yahay.' };
    }

    // Ensure profile exists for the user
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

    // Create session (valid for 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const session: AuthSession = {
      token: generateToken(),
      user: userProfile,
      expiresAt
    };

    setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return { success: true, session, user: userProfile };
  }

  // Public User Registration: creates real authentication account, profile, and active session
  static async register(
    name: string, 
    rawEmail: string, 
    password: string
  ): Promise<{ success: boolean; session?: AuthSession; user?: UserProfile; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah (tusaale: user@outlook.com, user@gmail.com, iwm).' };
    }

    const accounts = this.getAccounts();

    // Check for duplicate account
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Account-kan hore ayuu u jiray. Fadlan gal.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.' };
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

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
      isEmailVerified: true
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    // Create session (valid for 7 days)
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
      user: newProfile 
    };
  }

  // Send Password Reset Code (Real Account Existence Verification)
  static async sendPasswordResetCode(rawEmail: string): Promise<{ success: boolean; code?: string; error?: string }> {
    await this.init();
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!isValidEmail(cleanEmail)) {
      return { success: false, error: 'Fadlan geli email sax ah.' };
    }

    const accounts = this.getAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { success: false, error: 'Account-kan lama helin. Fadlan hubi email-kaaga ama is diiwaangeli.' };
    }

    // Generate cryptographically secure random 6-digit code
    const randomCode = generateNumericCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

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

    if (accountIndex === -1) {
      return { success: false, error: 'Account-kan lama helin.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);

    accounts[accountIndex].salt = newSalt;
    accounts[accountIndex].passwordHash = newHash;

    this.saveAccounts(accounts);
    removeStorageItem(RESET_CODES_KEY);

    return { success: true };
  }

  // Logout (End session & clear sensitive state)
  static logout(): void {
    removeStorageItem(SESSION_STORAGE_KEY);
  }
}
