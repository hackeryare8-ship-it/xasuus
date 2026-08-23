import React, { useState } from 'react';
import { 
  Bot, 
  ArrowRight, 
  FileText, 
  AlignLeft, 
  Sparkles, 
  Bell, 
  Mic, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Tag, 
  FolderOpen 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HomeDashboard: React.FC = () => {
  const { 
    currentUser, 
    stats, 
    reminders, 
    documents, 
    notes, 
    memories, 
    voiceNotes, 
    setActiveTab, 
    openAddModal, 
    setIsAIModalOpen,
    toggleReminderComplete,
    addAIMessage
  } = useApp();

  const [aiPromptInput, setAiPromptInput] = useState('');

  // Dynamic Somali greeting based on time of day
  const getSomaliGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Subax wanaagsan';
    if (hour >= 12 && hour < 17) return 'Galab wanaagsan';
    return 'Habeen wanaagsan';
  };

  const firstName = currentUser.name.split(' ')[0] || 'Maxamed';

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;

    // Send to AI chat and open assistant modal
    addAIMessage({
      id: `user_${Date.now()}`,
      sender: 'user',
      text: aiPromptInput,
      timestamp: new Date().toISOString()
    });

    setIsAIModalOpen(true);
    setAiPromptInput('');
  };

  const quickActionCards = [
    {
      id: 'dukumiinti',
      label: 'Dukumiinti',
      icon: FileText,
      tab: 'dukumiintiyo',
      modalType: 'document' as const,
      count: stats.totalDocs
    },
    {
      id: 'qoraal',
      label: 'Qoraal',
      icon: AlignLeft,
      tab: 'qoraallo',
      modalType: 'note' as const,
      count: stats.totalNotes
    },
    {
      id: 'xusuus',
      label: 'Xusuus',
      icon: Sparkles,
      tab: 'xusuuso',
      modalType: 'memory' as const,
      count: stats.totalMemories
    },
    {
      id: 'xasuusiye',
      label: 'Xasuusiye',
      icon: Bell,
      tab: 'xasuusiyayaal',
      modalType: 'reminder' as const,
      count: stats.pendingReminders
    },
    {
      id: 'cod',
      label: 'Cod',
      icon: Mic,
      tab: 'codad',
      modalType: 'voice' as const,
      count: stats.totalVoice
    },
  ];

  // Upcoming non-completed reminders
  const pendingRemindersList = reminders.filter(r => !r.isCompleted).slice(0, 3);
  const recentDocs = documents.slice(0, 3);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Greeting Section */}
      <div className="space-y-1">
        <h2 className="text-[26px] font-bold text-[#1a202c] tracking-tight">
          {getSomaliGreeting()}, {firstName} 👋
        </h2>
        <p className="text-[15px] text-[#4a5568] font-normal leading-relaxed">
          Wax walba waa nidaamsan yihiin. Halkan waxaa ah dulmar guud oo ku saabsan xogtaada maanta.
        </p>
      </div>

      {/* Main Search / AI Assistant Prompt Card - Pixel-Perfect replica */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#ece9df] transition-all hover:shadow-md">
        <form onSubmit={handleAISubmit} className="flex items-center gap-4">
          {/* Circular Dark Green Robot Badge */}
          <div className="w-14 h-14 rounded-full bg-[#0e382b] flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-7 h-7 text-emerald-300" />
          </div>

          {/* Prompt Input Box with Arrow Button inside */}
          <div className="relative flex-1 flex items-center border border-[#1a202c] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0e382b]/30 transition-all bg-white">
            <input
              type="text"
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="Maxaad rabtaa inaad raadiso ama xasuusato?"
              className="w-full px-5 py-3.5 text-[15px] text-[#1a202c] placeholder-[#718096] outline-none font-normal"
            />
            <button
              type="submit"
              className="mr-2 w-9 h-9 rounded-full bg-[#0e382b] hover:bg-[#092b21] flex items-center justify-center text-white transition-transform active:scale-90 shrink-0 cursor-pointer shadow-sm"
              title="Weydii AI ama Raadi"
            >
              <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>

      {/* Quick Actions (Tallaabooyin Degdeg ah) - Pixel Perfect 5 Card Grid */}
      <div className="space-y-3.5">
        <h3 className="text-[15px] font-semibold text-[#1a202c]">
          Tallaabooyin Degdeg ah
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {quickActionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => openAddModal(card.modalType)}
                className="bg-white border border-[#ece9df] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-700/40 group text-center"
              >
                {/* Circular Icon Holder */}
                <div className="w-12 h-12 rounded-full bg-[#e8eef8] group-hover:bg-[#def7ee] flex items-center justify-center text-[#2d3748] group-hover:text-[#0e382b] transition-colors mb-3.5">
                  <Icon className="w-5 h-5" />
                </div>

                <span className="font-semibold text-[14.5px] text-[#1a202c] group-hover:text-[#0e382b] transition-colors">
                  {card.label}
                </span>

                <span className="text-[11.5px] text-[#718096] mt-1 font-medium">
                  {card.count} keydsan
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Data Overview Section: Upcoming Reminders & Recent Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Reminders Widget */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece9df] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0e382b]" />
              <h4 className="font-bold text-[16px] text-[#1a202c]">Xasuusiyeyaasha Dhow</h4>
            </div>
            <button
              onClick={() => setActiveTab('xasuusiyayaal')}
              className="text-[12.5px] font-semibold text-[#0e382b] hover:underline flex items-center gap-1"
            >
              <span>Dhammaan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingRemindersList.length === 0 ? (
              <div className="py-6 text-center text-[#718096] text-[13.5px]">
                🎉 Ma jiraan xasuusino kuu dhiman!
              </div>
            ) : (
              pendingRemindersList.map((r) => (
                <div 
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#fbf9f0] border border-[#f0ede0] hover:border-emerald-600/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleReminderComplete(r.id)}
                      className="text-[#a0aec0] hover:text-emerald-600 transition-colors"
                      title="U calaamadee in la dhameystiray"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="font-semibold text-[13.5px] text-[#1a202c]">{r.title}</div>
                      <div className="text-[11.5px] text-[#718096] flex items-center gap-2 mt-0.5">
                        <span>{r.date}</span>
                        <span>•</span>
                        <span>{r.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    r.priority === 'sare' 
                      ? 'bg-rose-100 text-rose-700' 
                      : r.priority === 'dhexe' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {r.priority.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Documents Widget */}
        <div className="bg-white rounded-2xl p-6 border border-[#ece9df] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#0e382b]" />
              <h4 className="font-bold text-[16px] text-[#1a202c]">Dukumiintiyadii u Dambeeyay</h4>
            </div>
            <button
              onClick={() => setActiveTab('dukumiintiyo')}
              className="text-[12.5px] font-semibold text-[#0e382b] hover:underline flex items-center gap-1"
            >
              <span>Dhammaan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentDocs.length === 0 ? (
              <div className="py-6 text-center text-[#718096] text-[13.5px]">
                Weli wax dukumiinti ah ma lihid.
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => setActiveTab('dukumiintiyo')}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#fbf9f0] border border-[#f0ede0] hover:border-emerald-600/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-[13.5px] text-[#1a202c] truncate max-w-[200px]">
                        {doc.title}
                      </div>
                      <div className="text-[11.5px] text-[#718096]">{doc.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#a0aec0] font-medium">
                    {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
