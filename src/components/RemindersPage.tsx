import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Trash2, 
  AlertCircle, 
  Repeat 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RemindersPage: React.FC = () => {
  const { reminders, toggleReminderComplete, deleteReminder, openAddModal } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.isCompleted;
    if (filter === 'completed') return r.isCompleted;
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Xasuusiyayaasha (Reminders)</h2>
          <p className="text-[14px] text-[#718096] mt-0.5">
            Daji ballamahaaga, biilasha, iyo hawlaha muhiimka ah si aadan u iloobin.
          </p>
        </div>

        <button
          onClick={() => openAddModal('reminder')}
          className="px-4 py-2.5 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white text-[13.5px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ku dar Xasuusiye Cusub</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            filter === 'pending'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          Kuu Dhiman ({reminders.filter(r => !r.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            filter === 'completed'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          La Dhameystiray ({reminders.filter(r => r.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#0e382b] text-white shadow-xs'
              : 'bg-white text-[#4a5568] border border-[#ece9df] hover:bg-[#f7f6f0]'
          }`}
        >
          Dhammaan ({reminders.length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">
              {filter === 'completed' ? 'Weli wax xasuusiye ah lama dhameystirin' : 'Ma jiraan xasuusino kuu dhiman!'}
            </h4>
            <p className="text-[13px] text-[#718096] max-w-sm mx-auto">
              {filter === 'completed' ? 'Markii aad dhameystirto xasuusin halkan ayay ka muuqan doontaa.' : 'Ku dar xasuusin cusub si aad ula socoto hawlahaaga.'}
            </p>
            {filter !== 'completed' && (
              <button
                onClick={() => openAddModal('reminder')}
                className="px-4 py-2 rounded-full bg-[#0e382b] text-white text-[13px] font-semibold hover:bg-[#092b21]"
              >
                Ku dar Xasuusiye
              </button>
            )}
          </div>
        ) : (
          filteredReminders.map((r) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex items-center justify-between gap-4 ${
                r.isCompleted
                  ? 'border-[#ece9df] opacity-60 bg-[#faf9f5]'
                  : 'border-[#ece9df] shadow-2xs hover:shadow-md hover:border-emerald-600/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleReminderComplete(r.id)}
                  className="mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {r.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 hover:text-emerald-600" />
                  )}
                </button>

                <div className="space-y-1">
                  <h4 className={`font-bold text-[15.5px] text-[#1a202c] ${r.isCompleted ? 'line-through text-gray-400' : ''}`}>
                    {r.title}
                  </h4>

                  {r.description && (
                    <p className="text-[13px] text-[#4a5568] leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[12px] text-[#718096]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{r.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{r.time}</span>
                    </div>
                    {r.repeat !== 'none' && (
                      <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-medium">
                        <Repeat className="w-3 h-3" />
                        <span>{r.repeat}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  r.priority === 'sare'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : r.priority === 'dhexe'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {r.priority.toUpperCase()}
                </span>

                <button
                  onClick={() => {
                    if (confirm(`Ma hubtaa inaad tirtirto xasuusinta "${r.title}"?`)) {
                      deleteReminder(r.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Tirtir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
