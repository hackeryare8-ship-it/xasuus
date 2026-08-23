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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { AuthSession } from '../../services/authService';

type AuthView = 
  | 'choice'
  | 'login' 
  | 'register' 
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
    activateSession 
  } = useAuth();

  // The initial experience defaults to 'choice'
  const [view, setView] = useState<AuthView>('choice');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Authenticated User for Welcome Animations
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [pendingSession, setPendingSession] = useState<AuthSession | null>(null);

  // Verification Code (6 digits)
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
      }, 1200);
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
    setView(newView);
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

  // 2. Handle Public Sign Up (Supports all providers: Gmail, Outlook, Yahoo, iCloud, Proton, etc.)
  const handleRegister = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    const res = await register(cleanName, cleanEmail, password);
    setIsSubmitting(false);

    if (res.success && res.session && res.user) {
      setAuthenticatedUser(res.user);
      setPendingSession(res.session);
      setView('welcome-new-user');
    } else {
      setErrorMessage(res.error || 'Khalad ayaa dhacay. Fadlan mar kale isku day.');
    }
  };

  // 3. Handle Send Reset Code
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
      setView('verify-code');
      setSuccessMessage(`Haddii email-kan uu diiwaangashan yahay, waxaa loo soo diray code.`);
    } else {
      setErrorMessage(res.error || 'Account-kan lama helin. Fadlan hubi email-kaaga ama is diiwaangeli.');
    }
  };

  // 4. Digit Input Handlers
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

  // 5. Handle Verify Reset Code
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

  // 6. Handle Reset New Password
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
    const res = await resetPassword(email, codeDigits.join(''), password);
    setIsSubmitting(false);

    if (res.success) {
      setPassword('');
      setConfirmPassword('');
      setView('reset-success');
    } else {
      setErrorMessage(res.error || 'Password-ka lama cusbooneysiin karin.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf9f0] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Background Subtle Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#def7ee]/60 blur-3xl" />
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#ece9df] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] shadow-sm mb-3">
            <Zap className="w-6 h-6 fill-[#0e382b]" />
          </div>
          <h1 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Xasuus</h1>
          <p className="text-[12.5px] text-[#718096] font-medium">Digital Assistant & Memory Vault</p>
        </div>

        {/* Global Alert Banners */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 0: FIRST WELCOME CHOICE SCREEN (POLISHED & ELEGANT) */}
        {/* ======================================================== */}
        {view === 'choice' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center space-y-1.5">
              <h2 className="text-[20px] font-bold text-[#1a202c]">Ku soo dhawoow Xasuus</h2>
              <p className="text-[13.5px] text-[#718096] font-medium">
                Ma hore ayaad isku diiwaangelisay?
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Option 1: Existing User */}
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="w-full p-4 rounded-2xl border border-[#ece9df] bg-[#fbf9f0] hover:bg-white hover:border-[#0e382b]/30 hover:shadow-md transition-all duration-200 text-left flex items-center justify-between group cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e4e1d5] flex items-center justify-center text-[#0e382b] group-hover:bg-[#0e382b] group-hover:text-white transition-all shadow-xs">
                    <LogIn className="w-4.5 h-4.5" />
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
                <ArrowRight className="w-4 h-4 text-[#a0aec0] group-hover:text-[#0e382b] group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Option 2: New User */}
              <button
                type="button"
                onClick={() => navigateTo('register')}
                className="w-full p-4 rounded-2xl border border-[#ece9df] bg-[#fbf9f0] hover:bg-white hover:border-[#0e382b]/30 hover:shadow-md transition-all duration-200 text-left flex items-center justify-between group cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e4e1d5] flex items-center justify-center text-[#0e382b] group-hover:bg-[#0e382b] group-hover:text-white transition-all shadow-xs">
                    <UserPlus className="w-4.5 h-4.5" />
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
                <ArrowRight className="w-4 h-4 text-[#a0aec0] group-hover:text-[#0e382b] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 1: LOGIN (OPTION 1 — EXISTING USER) */}
        {/* ======================================================== */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => navigateTo('choice')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 transition-all font-medium"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Hubinta xogta...</span>
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
        {/* VIEW 2: REGISTER (OPTION 2 — NEW USER) */}
        {/* ======================================================== */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1">
              <button
                type="button"
                onClick={() => navigateTo('choice')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Abuurista koontada...</span>
              ) : (
                <>
                  <span>Samee Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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
        {/* VIEW 3: FORGOT PASSWORD */}
        {/* ======================================================== */}
        {view === 'forgot-password' && (
          <form onSubmit={handleSendResetCode} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-[19px] font-bold text-[#1a202c]">Password-ka dib u samee</h2>
              <p className="text-[13px] text-[#718096] mt-0.5">Geli email-kaaga si aan kuugu soo dirno code-ka xaqiijinta</p>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#2d3748] mb-1">Email</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#718096] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tusaale@outlook.com ama gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Diraya Code-ka...</span>
              ) : (
                <>
                  <span>U dir Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="text-[13px] font-semibold text-[#718096] hover:text-[#1a202c] cursor-pointer"
              >
                ← Ku noqo Login
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: VERIFY PASSWORD RESET CODE */}
        {/* ======================================================== */}
        {view === 'verify-code' && (
          <form onSubmit={handleVerifyResetCodeSubmit} className="space-y-4 animate-in fade-in duration-200">
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
                    className="w-12 h-14 text-center font-mono font-bold text-[20px] rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[#0e382b] outline-none focus:ring-2 focus:ring-[#0e382b]/40 transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
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
                onClick={() => navigateTo('login')}
                className="text-[12px] text-[#718096] hover:text-[#1a202c] mt-2 cursor-pointer"
              >
                ← Ku noqo Login
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: CREATE NEW PASSWORD */}
        {/* ======================================================== */}
        {view === 'new-password' && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto mb-2">
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#718096] hover:text-[#1a202c] cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[13.5px] text-[#1a202c] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Kaydinaya...</span>
              ) : (
                <>
                  <span>Kaydi Password-ka</span>
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
          <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0e382b] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-[20px] font-bold text-[#1a202c]">Password-kaaga si guul leh ayaa loo cusbooneysiiyay.</h2>
            <p className="text-[13.5px] text-[#718096] max-w-xs mx-auto leading-relaxed">
              Waxaad hadda ku geli kartaa email-kaaga iyo password-kaaga cusub.
            </p>

            <button
              onClick={() => navigateTo('login')}
              className="w-full py-3 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mt-4 cursor-pointer"
            >
              <span>Gal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 7: NEW USER WELCOME ANIMATION (ELEGANT & AUTOMATIC) */}
        {/* ======================================================== */}
        {view === 'welcome-new-user' && (
          <div className="text-center space-y-5 py-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-300/30 blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#def7ee] to-emerald-100 border border-emerald-300/60 text-[#0e382b] flex items-center justify-center shadow-lg relative z-10 animate-in zoom-in duration-300">
                <Sparkles className="w-9 h-9 text-[#0e382b] fill-[#0e382b]/20" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[22px] font-bold text-[#1a202c] tracking-tight">
                Ku soo dhawoow Xasuus
              </h2>
              <p className="text-[13.5px] text-[#718096] leading-relaxed max-w-xs mx-auto">
                Keydka xasuustaada meel ammaan ah.
              </p>
            </div>

            <button
              type="button"
              onClick={() => pendingSession && activateSession(pendingSession)}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full px-4 py-1.5 w-fit mx-auto mt-2 cursor-pointer transition-all"
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
          <div className="text-center space-y-5 py-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-300/30 blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#def7ee] to-emerald-100 border border-emerald-300/60 text-[#0e382b] flex items-center justify-center shadow-lg relative z-10 animate-in zoom-in duration-300">
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
              className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full px-4 py-1.5 w-fit mx-auto mt-2 cursor-pointer transition-all"
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
