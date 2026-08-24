import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, HelpCircle, User, Check, X, LogOut, FileText, AlignLeft, Sparkles, Mic, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    setActiveTab, 
    openAddModal,
    notifications,
    markNotificationAsRead,
    clearNotifications
  } = useApp();

  const { logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setIsAddMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setActiveTab('raadi');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setIsProfileOpen(false);
    setTimeout(() => {
      logout();
      setIsLoggingOut(false);
    }, 250);
  };

  return (
    <header className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-[#ece9df] bg-white sticky top-0 z-10 select-none">
      {/* Search Bar matching design */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#718096] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Raadi dukumiinti, xusuus..."
            className="w-full bg-[#e8eef8] text-[#1a202c] placeholder-[#718096] text-[13.5px] rounded-full pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0e382b]/30 transition-all duration-200 font-normal hover:bg-[#dfe8f5]"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 ml-4 sm:ml-6">
        {/* + Add New Button */}
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full border border-[#1a202c] bg-white text-[#1a202c] hover:bg-[#f7f6f0] text-[13.5px] font-semibold transition-all duration-200 active:scale-95 shadow-2xs cursor-pointer btn-press"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New</span>
          </button>

          {/* Add Menu Dropdown */}
          {isAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#ece9df] py-2 z-50 dropdown-enter">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                Ku dar shay cusub
              </div>
              <button
                onClick={() => { openAddModal('document'); setIsAddMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#2d3748] hover:bg-[#f7f6f0] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Dukumiinti (Document)</span>
              </button>
              <button
                onClick={() => { openAddModal('note'); setIsAddMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#2d3748] hover:bg-[#f7f6f0] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <span>Qoraal (Note)</span>
              </button>
              <button
                onClick={() => { openAddModal('memory'); setIsAddMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#2d3748] hover:bg-[#f7f6f0] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Xusuus (Memory)</span>
              </button>
              <button
                onClick={() => { openAddModal('reminder'); setIsAddMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#2d3748] hover:bg-[#f7f6f0] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Xasuusiye (Reminder)</span>
              </button>
              <button
                onClick={() => { openAddModal('voice'); setIsAddMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-[13px] text-[#2d3748] hover:bg-[#f7f6f0] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <span>Cod (Voice Note)</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full text-[#4a5568] hover:bg-[#f7f6f0] transition-colors relative cursor-pointer btn-press"
            title="Ogeysiisyada"
          >
            <Bell className="w-5 h-5 text-[#4a5568]" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#ece9df] py-3 z-50 dropdown-enter">
              <div className="px-4 py-1.5 flex items-center justify-between border-b border-[#ece9df] pb-2">
                <span className="font-bold text-[14px] text-[#1a202c]">Ogeysiisyada ({unreadNotifs.length})</span>
                {unreadNotifs.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    Dhammaan tirtir
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#f7f6f0]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-[13px] text-[#718096]">
                    Wax ogeysiis ah ma jiraan
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-[12.5px] cursor-pointer transition-colors ${n.isRead ? 'opacity-60 bg-white' : 'bg-emerald-50/40 hover:bg-emerald-50/70'}`}
                    >
                      <div className="font-semibold text-[#1a202c]">{n.title}</div>
                      <div className="text-[#718096] text-[12px]">{n.message}</div>
                      <div className="text-[10px] text-[#a0aec0] mt-1">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button 
          onClick={() => setIsHelpOpen(true)}
          className="p-2 rounded-full text-[#4a5568] hover:bg-[#f7f6f0] transition-colors cursor-pointer btn-press"
          title="Caawinaad"
        >
          <HelpCircle className="w-5 h-5 text-[#4a5568]" />
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/30 hover:border-emerald-600 focus:outline-none transition-all shadow-xs flex items-center justify-center bg-[#def7ee] cursor-pointer hover:scale-105 btn-press"
          >
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`;
                }}
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-5 h-5 text-[#0e382b]" />
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#ece9df] p-3 z-50 dropdown-enter">
              <div className="flex items-center gap-3 p-2.5 bg-[#fbf9f0] rounded-xl mb-3">
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.name || 'User')}`;
                  }}
                  className="w-11 h-11 rounded-full object-cover border border-emerald-600/30" 
                />
                <div className="overflow-hidden">
                  <div className="font-bold text-[14px] text-[#1a202c] truncate">{currentUser.name}</div>
                  <div className="text-[11.5px] text-[#718096] truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded mt-1 w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Koonto Amni Ah</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#ece9df] mt-1 pt-1 space-y-1">
                <button
                  onClick={() => { setActiveTab('profile'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#4a5568] hover:bg-[#f7f6f0] cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Maamul Profile-ka</span>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{isLoggingOut ? 'Ka baxaya...' : 'Ka bax (Sign out)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#ece9df] modal-enter">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede0]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0e382b]" />
                <h3 className="font-bold text-[17px] text-[#1a202c]">Tilmaamaha Xasuus App</h3>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-[13.5px] text-[#4a5568] leading-relaxed">
              <p>• <strong>Dukumiintiyo:</strong> Ku keydi PDF-yadaada, sawirradaada, iyo faylashaada muhiimka ah.</p>
              <p>• <strong>Qoraallo:</strong> Qor fikradahaaga, qorshayaashaada, iyo qoraallada degdegga ah.</p>
              <p>• <strong>Xusuuso:</strong> Dhig xusuusaha gaarka ah iyo taariikhaha xusidda mudan.</p>
              <p>• <strong>AI Assistant:</strong> Weydii su&apos;aalo, soo koob dukumiintiyadaada ama raadi macluumaad kasta.</p>
              <p>• <strong>Profile Photo:</strong> Tag Profile si aad u soo geliso sawirkaaga gaarka ah.</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21] cursor-pointer shadow-sm btn-press"
              >
                Fahmay
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
