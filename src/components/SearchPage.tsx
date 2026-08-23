import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  AlignLeft, 
  Sparkles, 
  Bell, 
  Mic, 
  Filter, 
  ArrowUpRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SearchPage: React.FC = () => {
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    documents, 
    notes, 
    memories, 
    reminders, 
    voiceNotes,
    setActiveTab 
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'documents' | 'notes' | 'memories' | 'reminders' | 'voice'>('all');

  const filteredResults = useMemo(() => {
    const q = globalSearchQuery.toLowerCase().trim();

    const matchedDocs = documents.filter(d => 
      !q || d.title.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q)) || d.category.toLowerCase().includes(q) || (d.summary && d.summary.toLowerCase().includes(q))
    ).map(item => ({ ...item, entityType: 'document' as const }));

    const matchedNotes = notes.filter(n => 
      !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q)) || n.category.toLowerCase().includes(q)
    ).map(item => ({ ...item, entityType: 'note' as const }));

    const matchedMemories = memories.filter(m => 
      !q || m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || (m.location && m.location.toLowerCase().includes(q)) || m.tags.some(t => t.toLowerCase().includes(q))
    ).map(item => ({ ...item, entityType: 'memory' as const }));

    const matchedReminders = reminders.filter(r => 
      !q || r.title.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
    ).map(item => ({ ...item, entityType: 'reminder' as const }));

    const matchedVoice = voiceNotes.filter(v => 
      !q || v.title.toLowerCase().includes(q) || (v.transcript && v.transcript.toLowerCase().includes(q))
    ).map(item => ({ ...item, entityType: 'voice' as const }));

    if (selectedFilter === 'documents') return matchedDocs;
    if (selectedFilter === 'notes') return matchedNotes;
    if (selectedFilter === 'memories') return matchedMemories;
    if (selectedFilter === 'reminders') return matchedReminders;
    if (selectedFilter === 'voice') return matchedVoice;

    return [...matchedDocs, ...matchedNotes, ...matchedMemories, ...matchedReminders, ...matchedVoice];
  }, [globalSearchQuery, documents, notes, memories, reminders, voiceNotes, selectedFilter]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Search Header */}
      <div>
        <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Raadi Xogtaada (Search)</h2>
        <p className="text-[14px] text-[#718096] mt-1">
          Ka dhex baaro dukumiintiyadaada, qoraalladaada, xusuusahaaga, xasuusiyeyaashaada iyo codadkaaga.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-[#718096] absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Qor ereyga aad raadinayso (tusaale: heshiis, shaqo, liido, biil)..."
          className="w-full bg-white border border-[#ece9df] text-[#1a202c] placeholder-[#718096] text-[15px] rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-[#0e382b]/30 shadow-xs"
        />
        {globalSearchQuery && (
          <button
            onClick={() => setGlobalSearchQuery('')}
            className="absolute right-4 text-xs font-semibold text-gray-500 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded-md"
          >
            Nadiifi
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
            selectedFilter === 'all'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          Dhammaan ({documents.length + notes.length + memories.length + reminders.length + voiceNotes.length})
        </button>

        <button
          onClick={() => setSelectedFilter('documents')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'documents'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dukumiintiyo ({documents.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('notes')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'notes'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Qoraallo ({notes.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('memories')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'memories'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Xusuuso ({memories.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('reminders')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'reminders'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Xasuusiyayaal ({reminders.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('voice')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            selectedFilter === 'voice'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Codad ({voiceNotes.length})</span>
        </button>
      </div>

      {/* Results Grid */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f0ede0] flex items-center justify-center text-[#718096] mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">Lama helin wax natiijo ah</h4>
            <p className="text-[13.5px] text-[#718096] max-w-md mx-auto">
              Wax natiijo ah oo ku habboon &ldquo;{globalSearchQuery}&rdquo; lagama helin xogtaada. Fadlan isku day erey kale ama hubi higgaadda.
            </p>
          </div>
        ) : (
          filteredResults.map((item: any) => {
            const isDoc = item.entityType === 'document';
            const isNote = item.entityType === 'note';
            const isMem = item.entityType === 'memory';
            const isRem = item.entityType === 'reminder';
            const isVoice = item.entityType === 'voice';

            return (
              <div
                key={`${item.entityType}_${item.id}`}
                onClick={() => {
                  if (isDoc) setActiveTab('dukumiintiyo');
                  if (isNote) setActiveTab('qoraallo');
                  if (isMem) setActiveTab('xusuuso');
                  if (isRem) setActiveTab('xasuusiyayaal');
                  if (isVoice) setActiveTab('codad');
                }}
                className="bg-white rounded-2xl p-4 border border-[#ece9df] shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isDoc ? 'bg-blue-50 text-blue-600' :
                    isNote ? 'bg-amber-50 text-amber-600' :
                    isMem ? 'bg-emerald-50 text-emerald-600' :
                    isRem ? 'bg-rose-50 text-rose-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {isDoc && <FileText className="w-5 h-5" />}
                    {isNote && <AlignLeft className="w-5 h-5" />}
                    {isMem && <Sparkles className="w-5 h-5" />}
                    {isRem && <Bell className="w-5 h-5" />}
                    {isVoice && <Mic className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14.5px] text-[#1a202c] group-hover:text-[#0e382b] transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#f0ede0] text-[#5a6578]">
                        {item.entityType}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#4a5568] line-clamp-2 leading-relaxed">
                      {isDoc && (item.summary || `File: ${item.fileName}`)}
                      {isNote && item.content}
                      {isMem && item.description}
                      {isRem && (item.description || `Waqtiga: ${item.date} ${item.time}`)}
                      {isVoice && (item.transcript || 'Duubitaan cod ah')}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {item.tags.map((t: string, idx: number) => (
                          <span key={idx} className="text-[11px] text-[#718096] bg-[#f7f6f0] px-2 py-0.5 rounded-md">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-gray-400 group-hover:text-emerald-700 transition-colors p-1">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
