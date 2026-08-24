import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  LogIn,
  UserPlus,
  ArrowLeft,
  Sparkles,
  Check,
  ShieldAlert,
  Key,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { AuthSession } from '../../services/authService';

type AuthView =
  | 'choice'
  | 'login'
  | 'register'
  | 'create-recovery-key'
  | 'forgot-password'
  | 'verify-code'
  | 'new-password'
  | 'reset-success'
  | 'welcome-new-user'
  | 'welcome-back';

export const AuthPage: React.FC = () => {
  const {
    login,
    register,
    sendResetCode,
    verifyResetCode,
    resetPassword,
    verifyRecoveryKey,
    resetPasswordWithRecoveryKey,
    activateSession
  } = useAuth();

  // The initial experience defaults to 'choice'
  const [view, setView] = useState<AuthView>('choice');
  const [choiceSelection, setChoiceSelection] = useState<'existing' | 'new' | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // User-Created Recovery Key State (Parts 2-4)
  const [userRecoveryKey, setUserRecoveryKey] = useState('');
  const [confirmUserRecoveryKey, setConfirmUserRecoveryKey] = useState('');

  // Password Recovery Fields
  const [inputRecoveryKey, setInputRecoveryKey] = useState('');
  const [recoveryMethod, setRecoveryMethod] = useState<'key' | 'email'>('key'); // Default primary is Recovery Key (Part 1 & 7)
  const [isRecoveryKeyVerified, setIsRecoveryKeyVerified] = useState(false);

  // Authenticated User for Welcome Animations
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [pendingSession, setPendingSession] = useState<AuthSession | null>(null);

  // Verification Code (6 digits for Email recovery)
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);

  // Feedback & Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Automatic transition after Welcome moments (1.2 seconds)
  useEffect(() => {
    if ((view === 'welcome-back' || view === 'welcome-new-user') && pendingSession) {
      const timer = setTimeout(() => {
        activateSession(pendingSession);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, [view, pendingSession, activateSession]);

  const clearErrors = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Switch Views cleanly
  const navigateTo = (newView: AuthView) => {
    clearErrors();
    setChoiceSelection(null);
    setView(newView);
  };

  // Handle Choice Selection with small animated welcome message (Part 15)
  const handleChoiceClick = (choice: 'existing' | 'new') => {
    setChoiceSelection(choice);
    clearErrors();
    setTimeout(() => {
      if (choice === 'existing') {
        setView('login');
      } else {
        setView('register');
      }
      setChoiceSelection(null);
    }, 400);
  };

  // 1. Handle Login (Real Public Authentication)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Fadlan buuxi dhammaan meelaha banaan.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success && res.session && res.user) {
      setAuthenticatedUser(res.user);
      setPendingSession(res.session);
      setView('welcome-back');
    } else {
      setErrorMessage('Email-ka ama password-ka waa khaldan yahay.');
    }
  };

  // 2. Step 1 of Public Sign Up: Validate basic info, then transition to Recovery Key step (Part 2)
  const handleRegisterStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password.trim()) {
      setErrorMessage('Fadlan buuxi dhammaan meelaha banaan.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password-ka iyo xaqiijintiisu isma laha.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.');
      return;
    }

    // Transition to dedicated Recovery Key Creation Step
    setUserRecoveryKey('');
    setConfirmUserRecoveryKey('');
    setView('create-recovery-key');
  };

  // 3. Step 2 of Public Sign Up: Save User-Created Recovery Key & Register (Parts 3-5)
  const handleSaveUserRecoveryKey = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const cleanKey = userRecoveryKey.trim().toUpperCase();
    const cleanConfirm = confirmUserRecoveryKey.trim().toUpperCase();

    if (cleanKey.length < 4 || cleanKey.length > 6) {
      setErrorMessage('Furaha soo-kabashada waa inuu ka koobnaadaa 4 ilaa 6 xaraf ama lambar.');
      return;
    }

    if (cleanKey !== cleanConfirm) {
      setErrorMessage('Furayaasha waa inay isku mid noqdaan.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, cleanKey);
    setIsSubmitting(false);

    if (res.success && res.session && res.user) {
      setAuthenticatedUser(res.user);
      setPendingSession(res.session);
      // Clean up sensitive plaintext key from state
      setUserRecoveryKey('');
      setConfirmUserRecoveryKey('');
      setView('welcome-new-user');
    } else {
      setErrorMessage(res.error || 'Khalad ayaa dhacay. Fadlan mar kale isku day.');
    }
  };

  // Key Strength Calculator (Part 3)
  const getKeyStrength = (key: string): { label: string; color: string; bg: string; width: string } => {
    const clean = key.trim();
    if (clean.length === 0) return { label: '', color: '', bg: '', width: '0%' };
    if (clean.length < 4) return { label: 'Daciif', color: 'text-rose-600', bg: 'bg-rose-500', width: '33%' };

    const hasLetters = /[A-Za-z]/.test(clean);
    const hasNumbers = /[0-9]/.test(clean);

    if (clean.length >= 5 && hasLetters && hasNumbers) {
      return { label: 'Xooggan', color: 'text-emerald-700', bg: 'bg-emerald-500', width: '100%' };
    }
    return { label: 'Dhexdhexaad', color: 'text-amber-700', bg: 'bg-amber-500', width: '66%' };
  };

  const keyStrength = getKeyStrength(userRecoveryKey);

  // 4. Handle Send Reset Code (Email Recovery Flow)
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Fadlan geli email-kaaga.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendResetCode(cleanEmail);
    setIsSubmitting(false);

    if (res.success) {
      setCooldown(60);
      setCodeDigits(['', '', '', '', '', '']);
      setIsRecoveryKeyVerified(false);
      setView('verify-code');
      setSuccessMessage(`Haddii email-kan uu diiwaangashan yahay, waxaa loo soo diray code.`);
    } else {
      setErrorMessage(res.error || 'Account-kan lama helin. Fadlan hubi email-kaaga ama is diiwaangeli.');
    }
  };

  // 5. Handle Recovery Key Verification (Parts 7-9)
  const handleVerifyRecoveryKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const cleanEmail = email.trim();
    const cleanKey = inputRecoveryKey.trim().toUpperCase();

    if (!cleanEmail || !cleanKey) {
      setErrorMessage('Fadlan geli email-kaaga iyo Recovery Key-gaaga.');
      return;
    }

    setIsSubmitting(true);
    const res = await verifyRecoveryKey(cleanEmail, cleanKey);
    setIsSubmitting(false);

    if (res.success) {
      setIsRecoveryKeyVerified(true);
      setSuccessMessage('Xogta waa la xaqiijiyay.');
      setTimeout(() => {
        setView('new-password');
      }, 450);
    } else {
      setErrorMessage(res.error || 'Xogta soo kabashada lama xaqiijin karin.');
    }
  };

  // 6. Digit Input Handlers for Email OTP
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // 7. Handle Verify Email Reset Code
  const handleVerifyResetCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    const enteredCode = codeDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage('Fadlan geli dhammaan 6-da lambar ee code-ka.');
      return;
    }

    const res = verifyResetCode(email, enteredCode);
    if (res.success) {
      setIsRecoveryKeyVerified(false);
      setView('new-password');
    } else {
      setErrorMessage(res.error || 'Code-ka waa khaldan yahay.');
    }
  };

  // Resend Reset Code
  const handleResendResetCode = async () => {
    if (cooldown > 0) return;
    clearErrors();
    setIsSubmitting(true);
    const res = await sendResetCode(email);
    setIsSubmitting(false);
    if (res.success) {
      setCooldown(60);
      setSuccessMessage('Code cusub ayaa email-kaaga loo soo diray.');
    } else {
      setErrorMessage(res.error || 'Khalad ayaa dhacay.');
    }
  };

  // 8. Handle Save New Password (Part 10)
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (password.length < 8) {
      setErrorMessage('Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Labada password isma laha. Fadlan hubi.');
      return;
    }

    setIsSubmitting(true);
    let res: { success: boolean; error?: string };

    if (isRecoveryKeyVerified) {
      res = await resetPasswordWithRecoveryKey(email, inputRecoveryKey.trim().toUpperCase(), password);
    } else {
      res = await resetPassword(email, codeDigits.join(''), password);
    }
    setIsSubmitting(false);

    if (res.success) {
      setPassword('');
      setConfirmPassword('');
      setInputRecoveryKey('');
      setView('reset-success');
    } else {
      setErrorMessage(res.error || 'Password-ka lama cusbooneysiin karin.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf9f0] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Background Subtle Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl animate-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#def7ee]/70 blur-3xl" />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#ece9df] relative z-10 animate-fade-scale">
        {/* Brand Logo Header (Sequence 1) */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#def7ee] to-[#c7f1e2] flex items-center justify-center text-[#0e382b] shadow-sm mb-3.5 animate-fade-scale">
            <Zap className="w-6.5 h-6.5 fill-[#0e382b] text-[#0e382b]" />
          </div>
          <h1 className="text-[25px] font-bold text-[#1a202c] tracking-tight animate-stagger-1">Xasuus</h1>
          <p className="text-[13px] text-[#718096] font-medium mt-0.5 animate-stagger-2">Digital Assistant & Personal Vault</p>
        </div>

        {/* Global Alert Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 animate-checkmark" />
            <span className="leading-snug font-medium">{successMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 0: FIRST WELCOME CHOICE SCREEN (PARTS 13-15) */}
        {/* ======================================================== */}
        {view === 'choice' && (
          <div className="space-y-6 view-enter">
            <div className="text-center space-y-1.5 animate-stagger-2">
              <h2 className="text-[20px] font-bold text-[#1a202c]">Soo dhowow Xasuus</h2>
              <p className="text-[13.5px] text-[#718096] font-medium">
                Ma hore ayaad isku diiwaangelisay mise waa markii kuugu horreysay?
              </p>
            </div>

            {/* Selection Response Notification Card (Part 15) */}
            {choiceSelection && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0e382b] text-[13.5px] font-semibold text-center animate-in fade-in zoom-in-95 duration-200 shadow-2xs">
                {choiceSelection === 'existing' ? 'Ku soo dhowow mar kale.' : 'Ku soo dhowow Xasuus.'}
              </div>
            )}

            <div className="space-y-3.5 pt-1">
              {/* Option 1: Existing User */}
              <button
                type="button"
                onClick={() => handleChoiceClick('existing')}
                className="w-full p-4 rounded-2xl border border-[#ece9df] bg-[#fbf9f0] auth-choice-card text-left flex items-center justify-between group cursor-pointer animate-stagger-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e4e1d5] flex items-center justify-center text-[#0e382b] group-hover:bg-[#0e382b] group-hover:text-white transition-all duration-200 shadow-2xs">
                    <LogIn className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold text-[#1a202c] uppercase tracking-wide">
                      Hore ayaan isku diiwaangeliyay
                    </div>
                    <div className="text-[12px] text-[#718096] mt-0.5">
                      Waxaan hore u lahaa akoon Xasuus.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#a0aec0] group-hover:text-[#0e382b] group-hover:translate-x-1 transition-all duration-200" />
              </button>

              {/* Option 2: New User */}
              <button
                type="button"
                onClick={() => handleChoiceClick('new')}
                className="w-full p-4 rounded-2xl border border-[#ece9df] bg-[#fbf9f0] auth-choice-card text-left flex items-center justify-between group cursor-pointer animate-stagger-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e4e1d5] flex items-center justify-center text-[#0e382b] group-hover:bg-[#0e382b] group-hover:text-white transition-all duration-200 shadow-2xs">
                    <UserPlus className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold text-[#1a202c] uppercase tracking-wide">
                      Markii ugu horreysay ayaan ahay
                    </div>
                    <div className="text-[12px] text-[#718096] mt-0.5">
                      Waxaan rabaa inaan sameysto akoon cusub.
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#a0aec0] group-hover:text-[#0e382b] group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: LOGIN (OPTION 1 — EXISTING USER) */}
        {/* ======================================================== */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 view-enter">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => navigateTo('choice')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer group transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Ku noqo</span>
              </button>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-[19px] font-bold text-[#1a202c]">Gal Koontadaada</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">Geli email-kaaga iyo password-kaaga si aad u gasho</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="magacaaga@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-[#2d3748]">Password</label>
                <button
                  type="button"
                  onClick={() => navigateTo('forgot-password')}
                  className="text-[12px] font-semibold text-[#0e382b] hover:underline cursor-pointer"
                >
                  Password-ka ma illoowday?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Hubinta xogta...</span>
                </div>
              ) : (
                <>
                  <span>Gal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-3">
              <span className="text-[13px] text-[#718096]">Markii ugu horreysay ma tahay? </span>
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="text-[13px] font-bold text-[#0e382b] hover:underline cursor-pointer"
              >
                Samee Account
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: REGISTER STEP 1 (NEW USER BASIC INFO) */}
        {/* ======================================================== */}
        {view === 'register' && (
          <form onSubmit={handleRegisterStepOne} className="space-y-4 view-enter">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => navigateTo('choice')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer group transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Ku noqo</span>
              </button>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-[19px] font-bold text-[#1a202c]">Samee Account Cusub</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">Ku biir Xasuus si aad u bilowdo nidaaminta xogtaada</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Magacaaga Buuxa</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tusaale: Axmed Yuusuf"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gmail.com ama user@outlook.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Password (ugu yaraan 8 xaraf)</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Xaqiiji Password-ka</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press mt-2 cursor-pointer"
            >
              <span>Sii wad (Samee Recovery Key)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <span className="text-[13px] text-[#718096]">Hore ma u lahayd koonto? </span>
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="text-[13px] font-bold text-[#0e382b] hover:underline cursor-pointer"
              >
                Gal
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 2.5: USER CREATES THEIR OWN RECOVERY KEY (PARTS 2-4) */}
        {/* ======================================================== */}
        {view === 'create-recovery-key' && (
          <form onSubmit={handleSaveUserRecoveryKey} className="space-y-4 view-enter">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => setView('register')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer group transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Dib ugu noqo xogtaada</span>
              </button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <Key className="w-6 h-6 text-[#0e382b]" />
              </div>
              <h2 className="text-[19px] font-bold text-[#1a202c]">Samee Furaha Soo-kabashada</h2>
              <p className="text-[13px] text-[#718096] mt-1 leading-relaxed">
                Furahan ayaa kaa caawinaya inaad dib ugu soo laabato Xasuus haddii aad illowdo password-kaaga.
              </p>
            </div>

            {/* Input 1: Recovery Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-[#2d3748]">
                  Recovery Key (4–6 xaraf ama lambar)
                </label>
                {keyStrength.label && (
                  <span className={`text-[11px] font-bold ${keyStrength.color}`}>
                    {keyStrength.label}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Key className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={userRecoveryKey}
                  onChange={(e) => setUserRecoveryKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="Tusaale: X7K4 ama 82F91"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[15px] font-mono font-bold tracking-widest uppercase text-[#0e382b] outline-none input-premium"
                  required
                />
              </div>
              {/* Subtle Strength Bar Indicator (Part 3) */}
              {userRecoveryKey.length > 0 && (
                <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${keyStrength.bg}`} style={{ width: keyStrength.width }} />
                </div>
              )}
            </div>

            {/* Input 2: Confirm Recovery Key (Part 4) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-semibold text-[#2d3748]">
                  Xaqiiji Recovery Key
                </label>
                {confirmUserRecoveryKey.length >= 4 && userRecoveryKey === confirmUserRecoveryKey && (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Isku mid
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Shield className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={confirmUserRecoveryKey}
                  onChange={(e) => setConfirmUserRecoveryKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="Ku celi furahaaga"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[15px] font-mono font-bold tracking-widest uppercase text-[#0e382b] outline-none input-premium"
                  required
                />
              </div>
            </div>

            {/* Security Notice (Part 5) */}
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11.5px] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">
                Furahan waa sirtada gaarka ah. Meel ammaan ah ku qoro. Dib looma arki karo haddii la kaydiyo.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || userRecoveryKey.length < 4 || confirmUserRecoveryKey.length < 4}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Kaydinaya furaha & samaynaya akoonka...</span>
                </div>
              ) : (
                <>
                  <span>Kaydi Furaha & Dhammee</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: FORGOT PASSWORD — SINGLE RECOVERY (GMAIL + RECOVERY KEY) */}
        {/* ======================================================== */}
        {view === 'forgot-password' && (
          <div className="space-y-5 view-enter">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer group transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Ku noqo Login</span>
              </button>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <KeyRound className="w-6 h-6 text-[#0e382b]" />
              </div>
              <h2 className="text-[20px] font-bold text-[#1a202c]">Xogtaada xaqiiji</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">
                Geli Gmail-kaaga iyo Recovery Key-gaaga si aad u hesho akoonkaaga
              </p>
            </div>

            {/* Single Streamlined Recovery Form: Gmail + Recovery Key */}
            <form onSubmit={handleVerifyRecoveryKeySubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Gmail / Email</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="magacaaga@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">
                  Recovery Key (4–6 xaraf ama lambar)
                </label>
                <div className="relative flex items-center">
                  <Key className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={inputRecoveryKey}
                    onChange={(e) => setInputRecoveryKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="Tusaale: X7K4 ama 82F91"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[15px] font-mono font-bold tracking-widest uppercase text-[#0e382b] outline-none input-premium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Xaqiijinaya xogta...</span>
                  </div>
                ) : (
                  <>
                    <span>Xaqiiji</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}

        {/* ======================================================== */}
        {/* VIEW 4: VERIFY EMAIL PASSWORD RESET CODE */}
        {/* ======================================================== */}
        {view === 'verify-code' && (
          <form onSubmit={handleVerifyResetCodeSubmit} className="space-y-4 view-enter">
            <div className="text-center mb-4">
              <h2 className="text-[19px] font-bold text-[#1a202c]">Xaqiiji Code-ka</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">
                Waxaa email-kaaga <strong className="text-[#1a202c]">{email}</strong> laguugu diray code xaqiijin ah.
              </p>
            </div>

            {/* 6 Individual Digit Inputs */}
            <div>
              <label className="block text-[13px] font-semibold text-center text-[#2d3748] mb-3">
                Fadlan geli 6-da lambar.
              </label>
              <div className="flex justify-between gap-2">
                {codeDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (digitInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-12 h-14 text-center font-mono font-bold text-[20px] rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[#0e382b] outline-none input-premium transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press mt-2 cursor-pointer"
            >
              <span>Xaqiiji</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 flex flex-col gap-1 items-center">
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleResendResetCode}
                className="text-[12.5px] font-semibold text-[#0e382b] disabled:text-[#a0aec0] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {cooldown > 0 ? `Mar kale dir Code-ka (${cooldown}s)` : 'Mar kale dir Code-ka'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                className="text-[12px] text-[#718096] hover:text-[#1a202c] mt-2 cursor-pointer transition-colors"
              >
                ← Ku noqo Soo-kabashada
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CREATE NEW PASSWORD (PART 10) */}
        {/* ======================================================== */}
        {view === 'new-password' && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4 view-enter">
            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-[19px] font-bold text-[#1a202c]">Samee Password Cusub</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">Fadlan qor password cusub oo adag</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Password cusub</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ugu yaraan 8 xaraf"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Xaqiiji Password-ka</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ku celi password-ka"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] text-[13.5px] text-[#1a202c] outline-none input-premium font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Kaydinaya...</span>
                </div>
              ) : (
                <>
                  <span>Samee Password Cusub</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 6: RESET SUCCESS */}
        {/* ======================================================== */}
        {view === 'reset-success' && (
          <div className="text-center space-y-4 py-4 view-enter">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto shadow-sm animate-fade-scale">
              <CheckCircle2 className="w-8 h-8 text-emerald-700 animate-checkmark" />
            </div>

            <h2 className="text-[20px] font-bold text-[#1a202c]">Password-ka waa la cusboonaysiiyay.</h2>
            <p className="text-[13.5px] text-[#718096] max-w-xs mx-auto leading-relaxed">
              Waxaad hadda ku geli kartaa email-kaaga iyo password-kaaga cusub.
            </p>

            <button
              onClick={() => navigateTo('login')}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all btn-press mt-4 cursor-pointer"
            >
              <span>Ku noqo Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: NEW USER SUCCESS & ONBOARDING (PART 6) */}
        {/* ======================================================== */}
        {view === 'welcome-new-user' && (
          <div className="text-center space-y-5 py-6 view-enter">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-300/40 blur-xl animate-glow" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#def7ee] to-emerald-100 border border-emerald-300/60 text-[#0e382b] flex items-center justify-center shadow-lg relative z-10 animate-fade-scale">
                <Sparkles className="w-9 h-9 text-[#0e382b] fill-[#0e382b]/20" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[22px] font-bold text-[#1a202c] tracking-tight">
                Ku soo dhowow Xasuus
              </h2>
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-checkmark" />
                <span>Furaha soo-kabashada waa la kaydiyay.</span>
              </div>
              <p className="text-[13px] text-[#718096] leading-relaxed max-w-xs mx-auto pt-1">
                Xasuustaada waa diyaar. Keydkaaga gaarka ah hadda ayaa la furayaa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => pendingSession && activateSession(pendingSession)}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full px-4 py-1.5 w-fit mx-auto mt-2 cursor-pointer transition-all btn-press"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Furaya dashboard-kaaga...</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 8: WELCOME BACK ANIMATION (PERSONALIZED & ELEGANT) */}
        {/* ======================================================== */}
        {view === 'welcome-back' && (
          <div className="text-center space-y-5 py-6 view-enter">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-300/40 blur-xl animate-glow" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#def7ee] to-emerald-100 border border-emerald-300/60 text-[#0e382b] flex items-center justify-center shadow-lg relative z-10 animate-fade-scale">
                <Sparkles className="w-9 h-9 text-[#0e382b] fill-[#0e382b]/20" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[22px] font-bold text-[#1a202c] tracking-tight">
                Soo laabo, {authenticatedUser?.name || 'Saaxiib'}
              </h2>
              <p className="text-[13.5px] text-[#718096] leading-relaxed max-w-xs mx-auto">
                Xasuustaadu way ku sugaysaa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => pendingSession && activateSession(pendingSession)}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full px-4 py-1.5 w-fit mx-auto mt-2 cursor-pointer transition-all btn-press"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Furaya dashboard-kaaga...</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
