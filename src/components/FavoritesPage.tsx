import React from 'react';
import { 
  Heart, 
  FileText, 
  AlignLeft, 
  Sparkles, 
  Mic, 
  ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FavoritesPage: React.FC = () => {
  const { 
    documents, 
    notes, 
    memories, 
    voiceNotes, 
    setActiveTab, 
    toggleDocumentFavorite,
    toggleNoteFavorite,
    toggleMemoryFavorite,
    toggleVoiceFavorite 
  } = useApp();

  const favDocs = documents.filter(d => d.isFavorite);
  const favNotes = notes.filter(n => n.isFavorite);
  const favMemories = memories.filter(m => m.isFavorite);
  const favVoice = voiceNotes.filter(v => v.isFavorite);

  const totalFavorites = favDocs.length + favNotes.length + favMemories.length + favVoice.length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Waxyaabaha aad jeceshahay (Favorites)</h2>
        </div>
        <p className="text-[14px] text-[#718096] mt-0.5">
          Dhammaan dukumiintiyadaada, qoraalladaada, xusuusahaaga iyo codadka aad ku calaamadeysay wadnaha.
        </p>
      </div>

      {totalFavorites === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-[#ece9df] text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-[17px] text-[#1a202c]">Weli ma jiraan waxyaabo aad jeceshahay</h4>
          <p className="text-[13.5px] text-[#718096] max-w-sm mx-auto">
            Guji calaamadda wadnaha (❤️) ee dukumiintiyada ama qoraallada si aad halkan ugu aragto.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Favorite Documents */}
          {favDocs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[16px] text-[#1a202c] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Dukumiintiyo ({favDocs.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('dukumiintiyo')}
                  className="text-[12.5px] font-semibold text-[#0e382b] hover:underline"
                >
                  Eeg dhammaan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favDocs.map(doc => (
                  <div 
                    key={doc.id}
                    className="bg-white rounded-2xl p-4 border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-[#1a202c]">{doc.title}</div>
                        <div className="text-[12px] text-[#718096]">{doc.category}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleDocumentFavorite(doc.id)}
                      className="text-rose-500 hover:text-gray-400 p-2"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Notes */}
          {favNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[16px] text-[#1a202c] flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-amber-600" />
                  <span>Qoraallo ({favNotes.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('qoraallo')}
                  className="text-[12.5px] font-semibold text-[#0e382b] hover:underline"
                >
                  Eeg dhammaan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favNotes.map(note => (
                  <div 
                    key={note.id}
                    className="bg-white rounded-2xl p-4 border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlignLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-[#1a202c]">{note.title}</div>
                        <div className="text-[12px] text-[#718096] line-clamp-1">{note.content}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNoteFavorite(note.id)}
                      className="text-rose-500 hover:text-gray-400 p-2"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Memories */}
          {favMemories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[16px] text-[#1a202c] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Xusuuso ({favMemories.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('xusuuso')}
                  className="text-[12.5px] font-semibold text-[#0e382b] hover:underline"
                >
                  Eeg dhammaan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favMemories.map(mem => (
                  <div 
                    key={mem.id}
                    className="bg-white rounded-2xl p-4 border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-[#1a202c]">{mem.title}</div>
                        <div className="text-[12px] text-[#718096]">{mem.location || mem.date}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMemoryFavorite(mem.id)}
                      className="text-rose-500 hover:text-gray-400 p-2"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Voice Notes */}
          {favVoice.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[16px] text-[#1a202c] flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-600" />
                  <span>Codad ({favVoice.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('codad')}
                  className="text-[12.5px] font-semibold text-[#0e382b] hover:underline"
                >
                  Eeg dhammaan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favVoice.map(voice => (
                  <div 
                    key={voice.id}
                    className="bg-white rounded-2xl p-4 border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-[#1a202c]">{voice.title}</div>
                        <div className="text-[12px] text-[#718096]">{voice.durationSeconds} ilbiriqsi</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleVoiceFavorite(voice.id)}
                      className="text-rose-500 hover:text-gray-400 p-2"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
