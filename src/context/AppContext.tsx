import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  NavTab, 
  UserProfile, 
  DocumentItem, 
  NoteItem, 
  MemoryItem, 
  ReminderItem, 
  VoiceNoteItem, 
  NotificationItem,
  AIChatMessage 
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentUser: UserProfile;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  documents: DocumentItem[];
  notes: NoteItem[];
  memories: MemoryItem[];
  reminders: ReminderItem[];
  voiceNotes: VoiceNoteItem[];
  notifications: NotificationItem[];
  aiChatHistory: AIChatMessage[];
  
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;
  
  isAddModalOpen: boolean;
  addModalType: 'all' | 'document' | 'note' | 'memory' | 'reminder' | 'voice';
  openAddModal: (type?: 'all' | 'document' | 'note' | 'memory' | 'reminder' | 'voice') => void;
  closeAddModal: () => void;
  
  // Entity actions strictly bound to authenticated user
  addDocument: (doc: Omit<DocumentItem, 'id' | 'userId' | 'uploadedAt'>) => void;
  deleteDocument: (id: string) => void;
  toggleDocumentFavorite: (id: string) => void;
  
  addNote: (note: Omit<NoteItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  toggleNoteFavorite: (id: string) => void;
  
  addMemory: (memory: Omit<MemoryItem, 'id' | 'userId' | 'createdAt'>) => void;
  updateMemory: (id: string, memory: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;
  toggleMemoryFavorite: (id: string) => void;
  
  addReminder: (reminder: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => void;
  updateReminder: (id: string, reminder: Partial<ReminderItem>) => void;
  deleteReminder: (id: string) => void;
  toggleReminderComplete: (id: string) => void;
  
  addVoiceNote: (voice: Omit<VoiceNoteItem, 'id' | 'userId' | 'createdAt'>) => void;
  deleteVoiceNote: (id: string) => void;
  toggleVoiceFavorite: (id: string) => void;
  
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  addAIMessage: (msg: AIChatMessage) => void;
  clearAIChat: () => void;

  stats: {
    totalDocs: number;
    totalNotes: number;
    totalMemories: number;
    totalReminders: number;
    pendingReminders: number;
    totalVoice: number;
    totalFavorites: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const currentUser: UserProfile = user || {
    id: 'anonymous',
    name: 'Qof Aan La Aqoon',
    email: 'guest@xasuus.app',
    avatar: '',
    createdAt: new Date().toISOString()
  };

  const [activeTab, setActiveTab] = useState<NavTab>('hoyga');
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNoteItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [aiChatHistory, setAiChatHistory] = useState<AIChatMessage[]>([]);
  
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'all' | 'document' | 'note' | 'memory' | 'reminder' | 'voice'>('all');

  // Load user-specific isolated data on auth change & trigger cloud sync
  useEffect(() => {
    if (user && user.id) {
      // Instant local cache load
      setDocuments(StorageService.getDocuments(user.id));
      setNotes(StorageService.getNotes(user.id));
      setMemories(StorageService.getMemories(user.id));
      setReminders(StorageService.getReminders(user.id));
      setVoiceNotes(StorageService.getVoiceNotes(user.id));
      setNotifications(StorageService.getNotifications(user.id));
      setAiChatHistory(StorageService.getAIChatHistory(user.id, user.name));

      // Asynchronous Supabase Cloud Sync
      StorageService.fetchDocumentsRemote(user.id).then(d => setDocuments(d));
      StorageService.fetchNotesRemote(user.id).then(n => setNotes(n));
      StorageService.fetchMemoriesRemote(user.id).then(m => setMemories(m));
      StorageService.fetchRemindersRemote(user.id).then(r => setReminders(r));
    } else {
      // Clear all state when logged out
      setDocuments([]);
      setNotes([]);
      setMemories([]);
      setReminders([]);
      setVoiceNotes([]);
      setNotifications([]);
      setAiChatHistory([]);
    }
  }, [user?.id]);

  // Modal helpers
  const openAddModal = (type: 'all' | 'document' | 'note' | 'memory' | 'reminder' | 'voice' = 'all') => {
    setAddModalType(type);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Documents (Strictly bound to currentUser.id)
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'userId' | 'uploadedAt'>) => {
    if (!user) return;
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc_${Date.now()}`,
      userId: user.id,
      uploadedAt: new Date().toISOString()
    };
    StorageService.saveDocument(user.id, newDoc);
    setDocuments(StorageService.getDocuments(user.id));
  };

  const deleteDocument = (id: string) => {
    if (!user) return;
    StorageService.deleteDocument(user.id, id);
    setDocuments(StorageService.getDocuments(user.id));
  };

  const toggleDocumentFavorite = (id: string) => {
    if (!user) return;
    const doc = documents.find(d => d.id === id);
    if (doc) {
      const updated = { ...doc, isFavorite: !doc.isFavorite };
      StorageService.saveDocument(user.id, updated);
      setDocuments(StorageService.getDocuments(user.id));
    }
  };

  // Notes
  const addNote = (note: Omit<NoteItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...note,
      id: `note_${Date.now()}`,
      userId: user.id,
      createdAt: now,
      updatedAt: now
    };
    StorageService.saveNote(user.id, newNote);
    setNotes(StorageService.getNotes(user.id));
  };

  const updateNote = (id: string, note: Partial<NoteItem>) => {
    if (!user) return;
    const current = notes.find(n => n.id === id);
    if (current) {
      const updated: NoteItem = {
        ...current,
        ...note,
        updatedAt: new Date().toISOString()
      };
      StorageService.saveNote(user.id, updated);
      setNotes(StorageService.getNotes(user.id));
    }
  };

  const deleteNote = (id: string) => {
    if (!user) return;
    StorageService.deleteNote(user.id, id);
    setNotes(StorageService.getNotes(user.id));
  };

  const toggleNoteFavorite = (id: string) => {
    if (!user) return;
    const note = notes.find(n => n.id === id);
    if (note) {
      const updated = { ...note, isFavorite: !note.isFavorite };
      StorageService.saveNote(user.id, updated);
      setNotes(StorageService.getNotes(user.id));
    }
  };

  // Memories
  const addMemory = (memory: Omit<MemoryItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newMem: MemoryItem = {
      ...memory,
      id: `mem_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    StorageService.saveMemory(user.id, newMem);
    setMemories(StorageService.getMemories(user.id));
  };

  const updateMemory = (id: string, memory: Partial<MemoryItem>) => {
    if (!user) return;
    const current = memories.find(m => m.id === id);
    if (current) {
      const updated = { ...current, ...memory };
      StorageService.saveMemory(user.id, updated);
      setMemories(StorageService.getMemories(user.id));
    }
  };

  const deleteMemory = (id: string) => {
    if (!user) return;
    StorageService.deleteMemory(user.id, id);
    setMemories(StorageService.getMemories(user.id));
  };

  const toggleMemoryFavorite = (id: string) => {
    if (!user) return;
    const mem = memories.find(m => m.id === id);
    if (mem) {
      const updated = { ...mem, isFavorite: !mem.isFavorite };
      StorageService.saveMemory(user.id, updated);
      setMemories(StorageService.getMemories(user.id));
    }
  };

  // Reminders
  const addReminder = (reminder: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'isCompleted'>) => {
    if (!user) return;
    const newRem: ReminderItem = {
      ...reminder,
      id: `rem_${Date.now()}`,
      userId: user.id,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    StorageService.saveReminder(user.id, newRem);
    setReminders(StorageService.getReminders(user.id));
  };

  const updateReminder = (id: string, reminder: Partial<ReminderItem>) => {
    if (!user) return;
    const current = reminders.find(r => r.id === id);
    if (current) {
      const updated = { ...current, ...reminder };
      StorageService.saveReminder(user.id, updated);
      setReminders(StorageService.getReminders(user.id));
    }
  };

  const deleteReminder = (id: string) => {
    if (!user) return;
    StorageService.deleteReminder(user.id, id);
    setReminders(StorageService.getReminders(user.id));
  };

  const toggleReminderComplete = (id: string) => {
    if (!user) return;
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      const updated = { ...rem, isCompleted: !rem.isCompleted };
      StorageService.saveReminder(user.id, updated);
      setReminders(StorageService.getReminders(user.id));
    }
  };

  // Voice Notes
  const addVoiceNote = (voice: Omit<VoiceNoteItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newVoice: VoiceNoteItem = {
      ...voice,
      id: `voice_${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    StorageService.saveVoiceNote(user.id, newVoice);
    setVoiceNotes(StorageService.getVoiceNotes(user.id));
  };

  const deleteVoiceNote = (id: string) => {
    if (!user) return;
    StorageService.deleteVoiceNote(user.id, id);
    setVoiceNotes(StorageService.getVoiceNotes(user.id));
  };

  const toggleVoiceFavorite = (id: string) => {
    if (!user) return;
    const voice = voiceNotes.find(v => v.id === id);
    if (voice) {
      const updated = { ...voice, isFavorite: !voice.isFavorite };
      StorageService.saveVoiceNote(user.id, updated);
      setVoiceNotes(StorageService.getVoiceNotes(user.id));
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    if (!user) return;
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    StorageService.saveNotifications(user.id, updated);
    setNotifications(updated);
  };

  const clearNotifications = () => {
    if (!user) return;
    StorageService.saveNotifications(user.id, []);
    setNotifications([]);
  };

  // AI Chat
  const addAIMessage = (msg: AIChatMessage) => {
    if (!user) return;
    StorageService.saveAIChatMessage(user.id, msg);
    setAiChatHistory(StorageService.getAIChatHistory(user.id, user.name));
  };

  const clearAIChat = () => {
    if (!user) return;
    StorageService.clearAIChatHistory(user.id);
    setAiChatHistory([]);
  };

  // Aggregated live statistics
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalNotes = notes.length;
    const totalMemories = memories.length;
    const totalReminders = reminders.length;
    const pendingReminders = reminders.filter(r => !r.isCompleted).length;
    const totalVoice = voiceNotes.length;
    
    const favDocs = documents.filter(d => d.isFavorite).length;
    const favNotes = notes.filter(n => n.isFavorite).length;
    const favMem = memories.filter(m => m.isFavorite).length;
    const favVoice = voiceNotes.filter(v => v.isFavorite).length;
    const totalFavorites = favDocs + favNotes + favMem + favVoice;

    return {
      totalDocs,
      totalNotes,
      totalMemories,
      totalReminders,
      pendingReminders,
      totalVoice,
      totalFavorites
    };
  }, [documents, notes, memories, reminders, voiceNotes]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeTab,
        setActiveTab,
        documents,
        notes,
        memories,
        reminders,
        voiceNotes,
        notifications,
        aiChatHistory,
        globalSearchQuery,
        setGlobalSearchQuery,
        isAIModalOpen,
        setIsAIModalOpen,
        isAddModalOpen,
        addModalType,
        openAddModal,
        closeAddModal,
        addDocument,
        deleteDocument,
        toggleDocumentFavorite,
        addNote,
        updateNote,
        deleteNote,
        toggleNoteFavorite,
        addMemory,
        updateMemory,
        deleteMemory,
        toggleMemoryFavorite,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleReminderComplete,
        addVoiceNote,
        deleteVoiceNote,
        toggleVoiceFavorite,
        markNotificationAsRead,
        clearNotifications,
        addAIMessage,
        clearAIChat,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
