import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Edit3, 
  Check, 
  Plus, 
  ShieldCheck, 
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Key,
  Copy,
  ShieldAlert,
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

export const ProfilePage: React.FC = () => {
  const { currentUser, stats } = useApp();
  const { register, updateProfile, generateRecoveryKeyForUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');

  // Profile Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);

  // Recovery Key State in Profile
  const [newGeneratedKey, setNewGeneratedKey] = useState<string | null>(null);
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // New Account Creation (Admin/Dev section)
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const registeredAccounts = AuthService.getAccounts();
  const currentAccount = registeredAccounts.find(a => a.id === currentUser.id);
  const hasExistingKey = Boolean(currentAccount?.recoveryKeyHash);

  // Save Name & Bio
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      bio: bio.trim()
    });
    setIsEditing(false);
    setPhotoSuccess('Xogta profile-ka si guul leh ayaa loo cusboonaysiiyay.');
    setTimeout(() => setPhotoSuccess(null), 3000);
  };

  // Open file picker
  const handleTriggerFileInput = () => {
    setPhotoError(null);
    fileInputRef.current?.click();
  };

  // Handle Photo File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Fadlan soo geli sawir sax ah (JPG, PNG, ama WEBP).');
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Xajmiga sawirku waa inuu ka yaraadaa 5MB.');
      return;
    }

    // Read and open preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        setIsPhotoModalOpen(true);
        setPhotoError(null);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so user can re-select same file if needed
    e.target.value = '';
  };

  // Save selected photo to user profile
  const handleSavePhoto = () => {
    if (!previewImage) return;
    setIsPhotoSaving(true);

    try {
      updateProfile({ avatar: previewImage });
      setIsPhotoModalOpen(false);
      setPreviewImage(null);
      setPhotoSuccess('Sawirka waa la cusboonaysiiyay');
      setTimeout(() => setPhotoSuccess(null), 3500);
    } catch {
      setPhotoError('Khalad ayaa dhacay xilliga kaydinta sawirka.');
    } finally {
      setIsPhotoSaving(false);
    }
  };

  // Generate/Regenerate Recovery Key for authenticated user
  const handleGenerateRecoveryKey = async () => {
    setIsGeneratingKey(true);
    const res = await generateRecoveryKeyForUser(currentUser.id);
    setIsGeneratingKey(false);
    if (res.success && res.recoveryKey) {
      setNewGeneratedKey(res.recoveryKey);
      setPhotoSuccess('Recovery Key cusub ayaa si guul leh loo sameeyay.');
      setTimeout(() => setPhotoSuccess(null), 3000);
    } else {
      setPhotoError(res.error || 'Lama samayn karin Recovery Key.');
    }
  };

  const handleCopyGeneratedKey = () => {
    if (newGeneratedKey) {
      navigator.clipboard.writeText(newGeneratedKey);
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2500);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setCreateError('Fadlan buuxi dhammaan meelaha banaan.');
      return;
    }

    if (newUserPassword.length < 8) {
      setCreateError('Password-ku waa inuu ka koobnaadaa ugu yaraan 8 xaraf.');
      return;
    }

    const res = await register(newUserName, newUserEmail, newUserPassword);
    if (!res.success) {
      setCreateError(res.error || 'Khalad ayaa dhacay.');
    } else {
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8 page-enter">
      <div>
        <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Koontada & Profile-ka (Profile)</h2>
        <p className="text-[14px] text-[#718096] mt-0.5">
          Maamul xogtaada shakhsiyeed, sawirkaaga profile-ka, iyo gooni-ahaanshaha xogtaada.
        </p>
      </div>

      {/* Global Success Notification Toast */}
      {photoSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13.5px] font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-checkmark shrink-0" />
            <span>{photoSuccess}</span>
          </div>
          <button 
            onClick={() => setPhotoSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Error Toast */}
      {photoError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-[13.5px] font-semibold flex items-center justify-between shadow-sm animate-shake">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{photoError}</span>
          </div>
          <button 
            onClick={() => setPhotoError(null)}
            className="text-rose-700 hover:text-rose-900 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece9df] shadow-xs space-y-6 card-subtle">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#f0ede0]">
          <div className="flex items-center gap-5">
            {/* Avatar with Interactive Camera Action Overlay */}
            <div className="relative group cursor-pointer" onClick={handleTriggerFileInput}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-[#def7ee] shadow-sm bg-[#def7ee] flex items-center justify-center transition-all duration-300 group-hover:border-[#c7f1e2] relative">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`;
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <User className="w-10 h-10 text-[#0e382b]" />
                )}

                {/* Cinematic Hover Overlay */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col items-center justify-center text-white gap-1">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[10px] font-bold tracking-tight text-white">Bedel sawirka</span>
                </div>
              </div>

              {/* Camera Icon Trigger Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerFileInput();
                }}
                title="Bedel sawirka profile-ka"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white border-2 border-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>

              {/* Hidden File Input for Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-[20px] text-[#1a202c]">{currentUser.name}</h3>
              <div className="text-[13px] text-[#718096] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Xogtaadu waa mid gooni ah</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleTriggerFileInput}
              className="px-3.5 py-2 rounded-xl border border-[#ece9df] bg-[#fbf9f0] hover:bg-white text-[13px] font-semibold text-[#0e382b] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer btn-press"
            >
              <Camera className="w-4 h-4" />
              <span>Bedel sawirka</span>
            </button>

            {currentUser.avatar && (
              <button
                type="button"
                onClick={() => {
                  updateProfile({ avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name || 'User')}` });
                  setPhotoSuccess('Sawirka profile-ka waa la tirtiray.');
                  setTimeout(() => setPhotoSuccess(null), 3000);
                }}
                className="px-3 py-2 rounded-xl border border-[#ece9df] bg-white hover:bg-rose-50 text-[13px] font-semibold text-rose-600 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer btn-press"
                title="Ka saar sawirka gaarka ah"
              >
                <X className="w-3.5 h-3.5" />
                <span>Ka saar</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl border border-[#ece9df] bg-white hover:bg-[#f7f6f0] text-[13px] font-semibold text-[#1a202c] flex items-center gap-2 transition-all shadow-2xs cursor-pointer btn-press"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Ka Noqo' : 'Wax ka beddel'}</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Magaca Buuxa</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[14px] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">Faahfaahin Gaaban (Bio)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Wax ku saabsan shaqadaada ama xusuustaada..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] bg-[#fbf9f0] focus:bg-white text-[14px] outline-none focus:ring-2 focus:ring-[#0e382b]/30 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold cursor-pointer btn-press"
              >
                Jooji
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21] cursor-pointer shadow-md btn-press"
              >
                Kaydi Isbeddelka
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 pt-2">
            {currentUser.bio && (
              <div className="p-4 rounded-2xl bg-[#fbf9f0] border border-[#f0ede0] text-[13.5px] text-[#4a5568] leading-relaxed">
                {currentUser.bio}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#fbf9f0] border border-[#f0ede0] text-center card-subtle">
                <div className="text-[20px] font-bold text-[#0e382b]">{stats.totalDocs}</div>
                <div className="text-[12px] text-[#718096] font-medium mt-0.5">Dukumiintiyo</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbf9f0] border border-[#f0ede0] text-center card-subtle">
                <div className="text-[20px] font-bold text-[#0e382b]">{stats.totalNotes}</div>
                <div className="text-[12px] text-[#718096] font-medium mt-0.5">Qoraallo</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbf9f0] border border-[#f0ede0] text-center card-subtle">
                <div className="text-[20px] font-bold text-[#0e382b]">{stats.totalMemories}</div>
                <div className="text-[12px] text-[#718096] font-medium mt-0.5">Xusuuso</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbf9f0] border border-[#f0ede0] text-center card-subtle">
                <div className="text-[20px] font-bold text-[#0e382b]">{stats.totalReminders}</div>
                <div className="text-[12px] text-[#718096] font-medium mt-0.5">Xasuusiyayaal</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security & Recovery Key Section (Parts 18 & 19) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ece9df] shadow-xs space-y-4 card-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0ede0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0e382b] flex items-center justify-center shadow-2xs">
              <KeyRound className="w-5 h-5 text-[#0e382b]" />
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#1a202c]">Amniga & Recovery Key (Security)</h3>
              <p className="text-[13px] text-[#718096]">
                Furaha soo-kabashada wuxuu kaa caawinayaa inaad akoonkaaga hesho haddii aad password-ka illowdo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300/60">
              {hasExistingKey ? 'Recovery Key: Saved' : 'Recovery Key: Ma jiro'}
            </span>
            <button
              type="button"
              onClick={handleGenerateRecoveryKey}
              disabled={isGeneratingKey}
              className="px-4 py-2 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[12.5px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer btn-press"
            >
              {isGeneratingKey ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              <span>{hasExistingKey ? 'Dib u samee Key cusub' : 'Samee Recovery Key'}</span>
            </button>
          </div>
        </div>

        {/* Display New Generated Key only once in Profile */}
        {newGeneratedKey && (
          <div className="p-4 rounded-2xl bg-[#fbf9f0] border-2 border-emerald-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#0e382b] uppercase tracking-wide">
                Furahaaga Cusub (Hal mar ayaad arki kartaa)
              </span>
              <button
                type="button"
                onClick={handleCopyGeneratedKey}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-emerald-50 border border-emerald-600/30 text-emerald-800 text-xs font-semibold cursor-pointer shadow-2xs btn-press"
              >
                {isKeyCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>✓ La koobiyeeyay!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Koobiyeey</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[22px] font-mono font-bold tracking-[0.2em] text-[#0e382b] bg-white py-2.5 px-4 rounded-xl border border-[#ece9df] text-center select-all">
              {newGeneratedKey}
            </div>
            <p className="text-[11.5px] text-[#718096]">
              ⚠️ Furahan si ammaan ah u qoro ama u kaydi. Dib looma tusi doono.
            </p>
          </div>
        )}
      </div>

      {/* Real Registered Accounts in System */}
      <div className="bg-white rounded-3xl p-6 border border-[#ece9df] shadow-xs space-y-4 card-subtle">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ede0]">
          <div>
            <h3 className="font-bold text-[16px] text-[#1a202c]">Account-yada Ka Diiwaangashan Nidaamka</h3>
            <p className="text-[12.5px] text-[#718096]">
              Qof kasta xogtiisa waa u gaar mana geli karo User kale.
            </p>
          </div>
          <button
            onClick={() => setIsCreatingUser(!isCreatingUser)}
            className="px-3.5 py-1.5 rounded-full bg-[#def7ee] text-[#0e382b] hover:bg-[#c9f1e3] text-[12.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer btn-press"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Diiwaangeli Account Cusub</span>
          </button>
        </div>

        {/* Create User Form */}
        {isCreatingUser && (
          <form onSubmit={handleCreateUser} className="p-4 bg-[#fbf9f0] rounded-2xl border border-[#ece9df] space-y-3 animate-in fade-in duration-150">
            <h4 className="font-bold text-[14px] text-[#1a202c]">Diiwaangeli Account Cusub oo Real ah</h4>
            {createError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-shake">
                {createError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Magaca (tusaale: Farxaan Cali)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#ece9df] text-[13px] outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email (tusaale: farxaan@gmail.com)"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#ece9df] text-[13px] outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password (min 8 chars)"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#ece9df] text-[13px] outline-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingUser(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold cursor-pointer btn-press"
              >
                Jooji
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#0e382b] text-white text-xs font-semibold cursor-pointer shadow-sm btn-press"
              >
                Diiwaangeli
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {registeredAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 ${
                acc.id === currentUser.id
                  ? 'bg-emerald-50/70 border-emerald-500/40 shadow-xs'
                  : 'bg-white border-[#ece9df] hover:bg-[#fbf9f0]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <img 
                  src={acc.profile.avatar} 
                  alt={acc.profile.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(acc.profile.name)}`;
                  }}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-500/30" 
                />
                <div>
                  <div className="font-bold text-[14px] text-[#1a202c] flex items-center gap-2">
                    <span>{acc.profile.name}</span>
                    {acc.id === currentUser.id && (
                      <span className="text-[10px] uppercase bg-[#0e382b] text-white px-2 py-0.2 rounded-full font-bold">
                        Hadda Galay
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#718096]">{acc.email}</div>
                </div>
              </div>

              {acc.id === currentUser.id ? (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <span className="text-[11.5px] font-medium text-[#718096] bg-[#fbf9f0] px-2.5 py-1 rounded-lg border border-[#ece9df]">
                  Account Gaar ah
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Preview & Confirmation Modal */}
      {isPhotoModalOpen && previewImage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#ece9df] text-center space-y-5 modal-enter">
            <div className="space-y-1">
              <h3 className="font-bold text-[18px] text-[#1a202c]">Cusboonaysii Sawirka Profile-ka</h3>
              <p className="text-[13px] text-[#718096]">Ma hubtaa inaad sawirkan u doorato profile-kaaga?</p>
            </div>

            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-[#def7ee] shadow-md bg-[#def7ee]">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPhotoModalOpen(false);
                  setPreviewImage(null);
                }}
                disabled={isPhotoSaving}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer btn-press"
              >
                Jooji
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={isPhotoSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-50 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer btn-press"
              >
                {isPhotoSaving ? <span>Kaydinaya...</span> : <span>Kaydi Sawirka</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
