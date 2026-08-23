import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  AlignLeft, 
  Sparkles, 
  Bell, 
  Mic, 
  Upload, 
  Check 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AddModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    closeAddModal, 
    addModalType, 
    addDocument, 
    addNote, 
    addMemory, 
    addReminder, 
    addVoiceNote 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'document' | 'note' | 'memory' | 'reminder' | 'voice'>(
    addModalType === 'all' ? 'document' : addModalType
  );

  // Document form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Heshiisyo');
  const [docTags, setDocTags] = useState('');
  const [docSummary, setDocSummary] = useState('');

  // Note form
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Shaqo');
  const [noteColor, setNoteColor] = useState('#FFFFFF');

  // Memory form
  const [memTitle, setMemTitle] = useState('');
  const [memDesc, setMemDesc] = useState('');
  const [memDate, setMemDate] = useState(new Date().toISOString().slice(0, 10));
  const [memLocation, setMemLocation] = useState('');
  const [memPeople, setMemPeople] = useState('');
  const [memPhotos, setMemPhotos] = useState('');

  // Reminder form
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remDate, setRemDate] = useState(new Date().toISOString().slice(0, 10));
  const [remTime, setRemTime] = useState('12:00');
  const [remPriority, setRemPriority] = useState<'sare' | 'dhexe' | 'hoose'>('dhexe');
  const [remRepeat, setRemRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Voice form
  const [voiceTitle, setVoiceTitle] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  if (!isAddModalOpen) return null;

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    addDocument({
      title: docTitle,
      fileName: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: 1024 * 1024 * (Math.floor(Math.random() * 4) + 1),
      fileType: 'application/pdf',
      category: docCategory,
      tags: docTags.split(',').map(t => t.trim()).filter(Boolean),
      isFavorite: false,
      summary: docSummary || 'Dukumiinti cusub oo lagu daray Xasuus.'
    });
    closeAddModal();
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    addNote({
      title: noteTitle,
      content: noteContent,
      category: noteCategory,
      tags: ['Qoraal'],
      isFavorite: false,
      color: noteColor
    });
    closeAddModal();
  };

  const handleMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim()) return;
    const photosArray = memPhotos ? memPhotos.split(',').map(p => p.trim()).filter(Boolean) : [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ];
    addMemory({
      title: memTitle,
      description: memDesc,
      date: memDate,
      location: memLocation || undefined,
      photos: photosArray,
      people: memPeople ? memPeople.split(',').map(p => p.trim()).filter(Boolean) : [],
      tags: ['Xusuus'],
      isFavorite: false
    });
    closeAddModal();
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    addReminder({
      title: remTitle,
      description: remDesc,
      date: remDate,
      time: remTime,
      priority: remPriority,
      repeat: remRepeat
    });
    closeAddModal();
  };

  const handleVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceTitle.trim()) return;
    addVoiceNote({
      title: voiceTitle,
      audioBlobUrl: '',
      durationSeconds: 30,
      transcript: voiceTranscript || 'Duubitaan cod ah oo cusub.',
      isFavorite: false
    });
    closeAddModal();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#ece9df] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-5 px-6 border-b border-[#ece9df] flex items-center justify-between bg-[#fcfaf2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0e382b] flex items-center justify-center text-white">
              <span className="font-bold text-sm">+</span>
            </div>
            <h3 className="font-bold text-[18px] text-[#1a202c]">Ku dar Shay Cusub</h3>
          </div>
          <button
            onClick={closeAddModal}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#ece9df] bg-white px-6 overflow-x-auto">
          {[
            { id: 'document', label: 'Dukumiinti', icon: FileText },
            { id: 'note', label: 'Qoraal', icon: AlignLeft },
            { id: 'memory', label: 'Xusuus', icon: Sparkles },
            { id: 'reminder', label: 'Xasuusiye', icon: Bell },
            { id: 'voice', label: 'Cod', icon: Mic },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-semibold text-[13px] flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#0e382b] text-[#0e382b]'
                    : 'border-transparent text-[#718096] hover:text-[#1a202c]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Document Form */}
          {activeTab === 'document' && (
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Magaca Dukumiintiga *</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Tusaale: Heshiiska Kirada Guriga"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Qeybta (Category)</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  >
                    <option value="Heshiisyo">Heshiisyo</option>
                    <option value="Waxbarasho">Waxbarasho</option>
                    <option value="Caafimaad">Caafimaad</option>
                    <option value="Shakhsi">Shakhsi</option>
                    <option value="Maaliyadda">Maaliyadda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Tags (kala saar faasilo)</label>
                  <input
                    type="text"
                    value={docTags}
                    onChange={(e) => setDocTags(e.target.value)}
                    placeholder="guri, kirro, muqdisho"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Dulmar Guud (Summary)</label>
                <textarea
                  value={docSummary}
                  onChange={(e) => setDocSummary(e.target.value)}
                  rows={3}
                  placeholder="Faahfaahin kooban oo ku saabsan dukumiintiga..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
                >
                  Kaydi Dukumiintiga
                </button>
              </div>
            </form>
          )}

          {/* Note Form */}
          {activeTab === 'note' && (
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Cinwaanka Qoraalka *</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Tusaale: Qorshaha Maanta"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Qeybta (Category)</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  >
                    <option value="Shaqo">Shaqo</option>
                    <option value="Shakhsi">Shakhsi</option>
                    <option value="Waxbarasho">Waxbarasho</option>
                    <option value="Fikrado">Fikrado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Midabka Kaarka</label>
                  <select
                    value={noteColor}
                    onChange={(e) => setNoteColor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  >
                    <option value="#FFFFFF">Caddaan (Default)</option>
                    <option value="#F0FDF4">Cagaar khafiif ah</option>
                    <option value="#FEFCE8">Jaalle khafiif ah</option>
                    <option value="#EFF6FF">Buluug khafiif ah</option>
                    <option value="#FAF5FF">Guduud khafiif ah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Nuxurka Qoraalka *</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={5}
                  placeholder="Qor qoraalkaaga halkan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
                >
                  Kaydi Qoraalka
                </button>
              </div>
            </form>
          )}

          {/* Memory Form */}
          {activeTab === 'memory' && (
            <form onSubmit={handleMemorySubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Cinwaanka Xusuusta *</label>
                <input
                  type="text"
                  value={memTitle}
                  onChange={(e) => setMemTitle(e.target.value)}
                  placeholder="Tusaale: Safarkii Xeebta Liido"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Taariikhda</label>
                  <input
                    type="date"
                    value={memDate}
                    onChange={(e) => setMemDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Goobta (Location)</label>
                  <input
                    type="text"
                    value={memLocation}
                    onChange={(e) => setMemLocation(e.target.value)}
                    placeholder="Muqdisho, Soomaaliya"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Dadka kula joogay (Faasilo ku kala saar)</label>
                <input
                  type="text"
                  value={memPeople}
                  onChange={(e) => setMemPeople(e.target.value)}
                  placeholder="Cumar, Khaalid, Farxaan"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Sawir URL (ama faasilo u dhaxaysii)</label>
                <input
                  type="text"
                  value={memPhotos}
                  onChange={(e) => setMemPhotos(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Sheekada Xusuusta *</label>
                <textarea
                  value={memDesc}
                  onChange={(e) => setMemDesc(e.target.value)}
                  rows={4}
                  placeholder="Maxaa dhacay maalintaas? Maxaad xasuusataa?"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
                >
                  Kaydi Xusuusta
                </button>
              </div>
            </form>
          )}

          {/* Reminder Form */}
          {activeTab === 'reminder' && (
            <form onSubmit={handleReminderSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Maxaa la xasuusinayaa? *</label>
                <input
                  type="text"
                  value={remTitle}
                  onChange={(e) => setRemTitle(e.target.value)}
                  placeholder="Tusaale: Bixi Biilka Korontada"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Maalinta</label>
                  <input
                    type="date"
                    value={remDate}
                    onChange={(e) => setRemDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Waqtiga</label>
                  <input
                    type="time"
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Ahmiyadda (Priority)</label>
                  <select
                    value={remPriority}
                    onChange={(e) => setRemPriority(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  >
                    <option value="sare">Sare (High)</option>
                    <option value="dhexe">Dhexe (Medium)</option>
                    <option value="hoose">Hoose (Low)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Soo Noqnoqoshada</label>
                  <select
                    value={remRepeat}
                    onChange={(e) => setRemRepeat(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                  >
                    <option value="none">Ma laha (Keliya mar)</option>
                    <option value="daily">Maalin kasta</option>
                    <option value="weekly">Toddobaad kasta</option>
                    <option value="monthly">Bil kasta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Faahfaahin Dheeraad ah</label>
                <textarea
                  value={remDesc}
                  onChange={(e) => setRemDesc(e.target.value)}
                  rows={2}
                  placeholder="Xog dheeraad ah..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
                >
                  Kaydi Xasuusiyaha
                </button>
              </div>
            </form>
          )}

          {/* Voice Form */}
          {activeTab === 'voice' && (
            <form onSubmit={handleVoiceSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Magaca Codka *</label>
                <input
                  type="text"
                  value={voiceTitle}
                  onChange={(e) => setVoiceTitle(e.target.value)}
                  placeholder="Tusaale: Fikrad ku saabsan mashruuca cusub"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Qoraalka Codka (Transcript)</label>
                <textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  rows={4}
                  placeholder="Qor waxa ku jira codka..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ece9df] text-[13.5px] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-semibold"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
                >
                  Kaydi Codka
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
