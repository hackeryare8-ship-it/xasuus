import React from 'react';
import { 
  Home, 
  Search, 
  FileText, 
  AlignLeft, 
  Sparkles, 
  Bell, 
  Mic, 
  Heart, 
  Bot, 
  Settings, 
  User, 
  Zap 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsAIModalOpen, stats } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'hoyga', label: 'Hoyga', icon: Home },
    { id: 'raadi', label: 'Raadi', icon: Search },
    { id: 'dukumiintiyo', label: 'Dukumiintiyo', icon: FileText, badge: stats.totalDocs },
    { id: 'qoraallo', label: 'Qoraallo', icon: AlignLeft, badge: stats.totalNotes },
    { id: 'xusuuso', label: 'Xusuuso', icon: Sparkles, badge: stats.totalMemories },
    { id: 'xasuusiyayaal', label: 'Xasuusiyayaal', icon: Bell, badge: stats.pendingReminders },
    { id: 'codad', label: 'Codad', icon: Mic, badge: stats.totalVoice },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: stats.totalFavorites > 0 ? stats.totalFavorites : undefined },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#ece9df] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-20">
      {/* Top Section */}
      <div className="p-4 flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => setActiveTab('hoyga')}
          className="flex items-center gap-3 px-2 py-3 mb-4 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] transition-transform duration-200 group-hover:scale-105 shadow-sm">
            <Zap className="w-5 h-5 fill-[#0e382b]" />
          </div>
          <div>
            <h1 className="font-bold text-[17px] text-[#1a202c] leading-tight tracking-tight">Xasuus</h1>
            <p className="text-[12px] text-[#718096] font-medium">Digital Assistant</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#0e382b] text-white shadow-xs font-semibold translate-x-0.5'
                    : 'text-[#4a5568] hover:bg-[#f7f6f0] hover:text-[#1a202c] hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#718096] group-hover:text-[#0e382b]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && !isActive && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f0ede0] text-[#4a5568] font-semibold transition-colors group-hover:bg-[#e4e1d3]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* AI Assistant Button */}
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="w-full bg-[#0e382b] hover:bg-[#092b21] text-white flex items-center justify-center gap-2.5 py-3 px-4 rounded-full font-semibold text-[14px] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] group cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-300 group-hover:rotate-6 transition-transform duration-200" />
          </div>
          <span>AI Assistant</span>
        </button>

        <div className="border-t border-[#ece9df] my-2 pt-2 space-y-1">
          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 group cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#0e382b] text-white font-semibold translate-x-0.5'
                : 'text-[#4a5568] hover:bg-[#f7f6f0] hover:text-[#1a202c] hover:translate-x-0.5'
            }`}
          >
            <Settings className={`w-4 h-4 transition-transform duration-200 group-hover:rotate-45 ${activeTab === 'settings' ? 'text-white' : 'text-[#718096]'}`} />
            <span>Settings</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 group cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0e382b] text-white font-semibold translate-x-0.5'
                : 'text-[#4a5568] hover:bg-[#f7f6f0] hover:text-[#1a202c] hover:translate-x-0.5'
            }`}
          >
            <User className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${activeTab === 'profile' ? 'text-white' : 'text-[#718096]'}`} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
