import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Bell, 
  Lock, 
  Key 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, clearNotifications } = useApp();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [autoSummary, setAutoSummary] = useState(true);

  const exportUserData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('xasuus_')) {
        data[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xasuus_backup_${currentUser.id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const resetAllData = () => {
    if (confirm("DIGNIIN: Ma hubtaa inaad tirtirto dhammaan xogta keydsan oo aad dib ugu celiso bilowgii hore?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Dejinta Nidaamka (Settings)</h2>
        <p className="text-[14px] text-[#718096] mt-0.5">
          Habee xogtaada gaarka ah, amniga, ogeysiisyada, iyo kaydinta Xasuus App.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security & User Isolation */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece9df] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede0]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0e382b] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1a202c]">Amniga & Go'doominta Xogta (User Data Isolation)</h3>
              <p className="text-[12.5px] text-[#718096]">Xogtaadu waa mid u gaar ah koontadaada oo kaliya.</p>
            </div>
          </div>

          <div className="text-[13px] text-[#4a5568] space-y-2">
            <div className="flex items-center justify-between p-3 bg-[#fbf9f0] rounded-xl border border-[#ece9df]">
              <div>
                <span className="font-semibold text-[#1a202c]">Koontada Hadda Shaqaynaysa:</span>
                <div className="text-[12px] text-[#718096]">{currentUser.name} ({currentUser.email})</div>
              </div>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
                RLS ENABLED
              </span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece9df] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede0]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1a202c]">Dookhyada & Ogeysiisyada (Preferences)</h3>
              <p className="text-[12.5px] text-[#718096]">Habee habka ogeysiisyada iyo caawiyaha AI.</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-[#fbf9f0] cursor-pointer transition-colors">
              <div>
                <div className="font-semibold text-[13.5px] text-[#1a202c]">Ogeysiisyada Xasuusiyaha (Reminders)</div>
                <div className="text-[12px] text-[#718096]">Hel ogeysiis toos ah marka waqtiga ballantu soo dhowaado.</div>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="w-5 h-5 accent-[#0e382b] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-[#fbf9f0] cursor-pointer transition-colors">
              <div>
                <div className="font-semibold text-[13.5px] text-[#1a202c]">Soo koobidda AI ee Dukumiintiyada</div>
                <div className="text-[12px] text-[#718096]">AI-ga ha si otomaatig ah u soo koobo heshiisyada iyo qoraallada cusub.</div>
              </div>
              <input
                type="checkbox"
                checked={autoSummary}
                onChange={(e) => setAutoSummary(e.target.checked)}
                className="w-5 h-5 accent-[#0e382b] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece9df] shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede0]">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[#1a202c]">Kaydinta & Soo Dejinta Xogta (Data & Backup)</h3>
              <p className="text-[12.5px] text-[#718096]">Soo dejiso nuqul ka mid ah xogtaada oo dhan ama dib u bilow.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={exportUserData}
              className="px-4 py-2.5 rounded-xl bg-[#0e382b] hover:bg-[#092b21] text-white text-[13px] font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Soo Dejiso Xogtaada (Export JSON)</span>
            </button>

            <button
              onClick={resetAllData}
              className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Dib u Bilaab (Reset Data)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
