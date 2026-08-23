import React, { useState } from 'react';
import { 
  AlignLeft, 
  Plus, 
  Search, 
  Heart, 
  Trash2, 
  Edit3, 
  Tag, 
  Calendar 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NoteItem } from '../types';

export const NotesPage: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, toggleNoteFavorite, openAddModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);

  const categories = ['all', 'Shaqo', 'Shakhsi', 'Waxbarasho', 'Fikrado'];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Qoraalladaada (Notes)</h2>
          <p className="text-[14px] text-[#718096] mt-0.5">
            Qor fikradahaaga, qorshayaashaada shaqada, iyo wax kasta oo aad rabto inaad xasuusnaato.
          </p>
        </div>

        <button
          onClick={() => openAddModal('note')}
          className="px-4 py-2.5 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Qor Qoraal Cusub</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0e382b] text-white shadow-xs'
                  : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
              }`}
            >
              {cat === 'all' ? 'Dhammaan' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Raadi qoraal..."
            className="w-full bg-white border border-[#ece9df] rounded-full pl-10 pr-4 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f0ede0] flex items-center justify-center text-[#718096] mx-auto">
              <AlignLeft className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">Weli ma jiraan qoraallo</h4>
            <p className="text-[13px] text-[#718096] max-w-sm mx-auto">
              Bilow inaad qorto qoraalkaagii ugu horreeyay si aad u habayso fikirradaada.
            </p>
            <button
              onClick={() => openAddModal('note')}
              className="px-4 py-2 rounded-full bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
            >
              Qor Qoraal
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{ backgroundColor: note.color || '#FFFFFF' }}
              className="rounded-2xl p-5 border border-[#ece9df] shadow-2xs hover:shadow-md hover:border-emerald-600/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-[#ece9df] text-[#5a6578]">
                    {note.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleNoteFavorite(note.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.isFavorite ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-white'
                      }`}
                      title={note.isFavorite ? 'Ka saar favorites' : 'Ku dar favorites'}
                    >
                      <Heart className={`w-4 h-4 ${note.isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Ma hubtaa inaad tirtirto "${note.title}"?`)) {
                          deleteNote(note.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Tirtir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-[16px] text-[#1a202c] mt-3 group-hover:text-[#0e382b] transition-colors">
                  {note.title}
                </h4>

                <p className="text-[13px] text-[#4a5568] mt-2 whitespace-pre-line leading-relaxed line-clamp-4">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {note.tags.map((t, idx) => (
                      <span key={idx} className="text-[11px] text-[#718096] bg-white/80 border border-[#ece9df] px-2 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between text-[11.5px] text-[#718096]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(note.updatedAt || note.createdAt).toLocaleDateString('so-SO')}</span>
                </div>
                <button
                  onClick={() => openAddModal('note')}
                  className="text-[#0e382b] font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Beddel</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
