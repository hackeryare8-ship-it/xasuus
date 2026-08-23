import React from 'react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { SearchPage } from './components/SearchPage';
import { DocumentsPage } from './components/DocumentsPage';
import { NotesPage } from './components/NotesPage';
import { MemoriesPage } from './components/MemoriesPage';
import { RemindersPage } from './components/RemindersPage';
import { VoiceNotesPage } from './components/VoiceNotesPage';
import { FavoritesPage } from './components/FavoritesPage';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AddModal } from './components/Modals/AddModal';
import { Zap } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeTab } = useApp();

  // Loading State while verifying authenticated session
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#fbf9f0] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] shadow-sm animate-pulse">
          <Zap className="w-7 h-7 fill-[#0e382b]" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-bold text-[18px] text-[#1a202c]">Xasuus</h2>
          <p className="text-[13px] text-[#718096]">Hubinta amniga iyo session-ka...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Users: Show Auth Page (Login / Sign Up / Forgot Password)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated Users: Render Protected Xasuus Workspace
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fbf9f0] select-text">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Bar */}
        <Header />

        {/* Dynamic Page Views with Smooth Page Transition Keying */}
        <main className="flex-1 overflow-y-auto bg-[#fbf9f0]">
          <div key={activeTab} className="page-enter">
            {activeTab === 'hoyga' && <HomeDashboard />}
            {activeTab === 'raadi' && <SearchPage />}
            {activeTab === 'dukumiintiyo' && <DocumentsPage />}
            {activeTab === 'qoraallo' && <NotesPage />}
            {activeTab === 'xusuuso' && <MemoriesPage />}
            {activeTab === 'xasuusiyayaal' && <RemindersPage />}
            {activeTab === 'codad' && <VoiceNotesPage />}
            {activeTab === 'favorites' && <FavoritesPage />}
            {activeTab === 'settings' && <SettingsPage />}
            {activeTab === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>

      {/* Global AI Assistant Drawer/Modal */}
      <AIAssistantModal />

      {/* Global Add Item Modal */}
      <AddModal />
    </div>
  );
};

export default App;
