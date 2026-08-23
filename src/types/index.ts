export type NavTab = 
  | 'hoyga' 
  | 'raadi' 
  | 'dukumiintiyo' 
  | 'qoraallo' 
  | 'xusuuso' 
  | 'xasuusiyayaal' 
  | 'codad' 
  | 'favorites' 
  | 'settings' 
  | 'profile';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  fileUrl?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  summary?: string;
  uploadedAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  photos: string[];
  people?: string[];
  tags: string[];
  voiceNoteId?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'sare' | 'dhexe' | 'hoose'; // high, medium, low
  isCompleted: boolean;
  createdAt: string;
}

export interface VoiceNoteItem {
  id: string;
  userId: string;
  title: string;
  audioBlobUrl: string;
  durationSeconds: number;
  transcript?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: () => void }[];
  sources?: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'document' | 'memory' | 'system';
  isRead: boolean;
  timestamp: string;
}
