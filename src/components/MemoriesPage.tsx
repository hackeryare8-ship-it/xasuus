import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Heart, 
  Trash2, 
  MapPin, 
  Users, 
  Calendar, 
  Tag, 
  Image as ImageIcon 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MemoriesPage: React.FC = () => {
  const { memories, addMemory, deleteMemory, toggleMemoryFavorite, openAddModal } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Xusuusahaada (Memories)</h2>
          <p className="text-[14px] text-[#718096] mt-0.5">
            Keydi waqtiyadaada qaaliga ah, safarradaada, iyo xusuusta asxaabtaada iyo qoyskaaga.
          </p>
        </div>

        <button
          onClick={() => openAddModal('memory')}
          className="px-4 py-2.5 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ku dar Xusuus Cusub</span>
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memories.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">Weli ma jiraan xusuuso keydsan</h4>
            <p className="text-[13px] text-[#718096] max-w-sm mx-auto">
              Ku dar sawirro, faahfaahin, iyo dadkii aad la joogtay si aad u dhisto xusuusahaaga.
            </p>
            <button
              onClick={() => openAddModal('memory')}
              className="px-4 py-2 rounded-full bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
            >
              Ku dar Xusuus
            </button>
          </div>
        ) : (
          memories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Photo Showcase */}
              {mem.photos && mem.photos.length > 0 && (
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <img
                    src={mem.photos[0]}
                    alt={mem.title}
                    onClick={() => setSelectedPhoto(mem.photos[0])}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                  {mem.photos.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg">
                      +{mem.photos.length - 1} Sawir
                    </span>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleMemoryFavorite(mem.id)}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 hover:text-rose-500 transition-colors shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${mem.isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Ma hubtaa inaad tirtirto "${mem.title}"?`)) {
                          deleteMemory(mem.id);
                        }
                      }}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-xs text-gray-700 hover:text-rose-600 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Memory Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-[#718096]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(mem.date).toLocaleDateString('so-SO', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  {mem.location && (
                    <div className="flex items-center gap-1 text-[12px] text-emerald-800 bg-[#def7ee] px-2 py-0.5 rounded-full font-semibold">
                      <MapPin className="w-3 h-3" />
                      <span>{mem.location}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-[18px] text-[#1a202c] leading-snug group-hover:text-[#0e382b] transition-colors">
                  {mem.title}
                </h3>

                <p className="text-[13.5px] text-[#4a5568] leading-relaxed">
                  {mem.description}
                </p>

                {mem.people && mem.people.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] text-[#4a5568] pt-1">
                    <Users className="w-3.5 h-3.5 text-[#718096]" />
                    <span className="font-medium">Dadka la joogay:</span>
                    <span className="text-[#0e382b] font-semibold">{mem.people.join(', ')}</span>
                  </div>
                )}

                {mem.tags && mem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {mem.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11.5px] text-[#718096] bg-[#fbf9f0] border border-[#ece9df] px-2.5 py-0.5 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Photo Preview */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 cursor-pointer animate-in fade-in duration-200"
        >
          <img 
            src={selectedPhoto} 
            alt="Xusuus Sawir" 
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
};
