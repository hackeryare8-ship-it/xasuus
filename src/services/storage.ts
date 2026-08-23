import { 
  UserProfile, 
  DocumentItem, 
  NoteItem, 
  MemoryItem, 
  ReminderItem, 
  VoiceNoteItem, 
  NotificationItem,
  AIChatMessage 
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// In-memory fallback if localStorage is undefined
const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStore[key] = value;
  }
}

// Initial default seed data for User A (Maxamed)
const USER_A_DOCS: DocumentItem[] = [
  {
    id: 'doc_a_1',
    userId: 'user_maxamed',
    title: 'Heshiiska Kirada Guriga 2026',
    fileName: 'Heshiiska_Kirada_2026.pdf',
    fileSize: 2450000,
    fileType: 'application/pdf',
    category: 'Heshiisyo',
    tags: ['Guri', 'Kirro', 'Heshiis', 'Muqdisho'],
    isFavorite: true,
    summary: 'Heshiis qoraal ah oo ku saabsan kirada guriga degmada Hodan muddo 12 bilood ah.',
    uploadedAt: '2026-02-10T11:20:00Z',
  },
  {
    id: 'doc_a_2',
    userId: 'user_maxamed',
    title: 'Shahaadada Jaamacadda',
    fileName: 'Degree_Certificate_Final.pdf',
    fileSize: 1820000,
    fileType: 'application/pdf',
    category: 'Waxbarasho',
    tags: ['Jaamacad', 'Shahaado', 'Computer Science'],
    isFavorite: true,
    summary: 'Shahaadada qalin-jabinta Bachelor of Computer Science.',
    uploadedAt: '2026-01-20T09:15:00Z',
  },
  {
    id: 'doc_a_3',
    userId: 'user_maxamed',
    title: 'Warbixinta Caafimaadka Guud',
    fileName: 'Medical_Report_Jan2026.pdf',
    fileSize: 980000,
    fileType: 'application/pdf',
    category: 'Caafimaad',
    tags: ['Caafimaad', 'Isbitaal', 'Checkup'],
    isFavorite: false,
    summary: 'Baaritaanka dhiigga iyo caafimaadka guud ee sanadlaha ah.',
    uploadedAt: '2026-01-28T14:45:00Z',
  }
];

const USER_A_NOTES: NoteItem[] = [
  {
    id: 'note_a_1',
    userId: 'user_maxamed',
    title: 'Qorshaha Horumarinta Shaqada',
    content: `## Hadafyada Sanadkan 2026\n1. Dhameystirka mashruuca Xasuus AI App.\n2. Barashada PostgreSQL RLS iyo Next.js 15.\n3. Akhrinta 12 buug oo ku saabsan hoggaanka iyo tignoolajiyada.\n4. Jimicsi joogto ah 4 maalmood toddobaadkii.`,
    category: 'Shaqo',
    tags: ['Qorshe', 'Hadaf', '2026'],
    isFavorite: true,
    color: '#F0FDF4',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-18T10:30:00Z',
  },
  {
    id: 'note_a_2',
    userId: 'user_maxamed',
    title: 'Liiska Alaabta Guriga loo iibinayo',
    content: `- Miiska waxbarashada (Office Desk)\n- Nalalka smart LED\n- Buugaagta programming-ka\n- Kuraasta casriga ah`,
    category: 'Shakhsi',
    tags: ['Iib', 'Guri'],
    isFavorite: false,
    color: '#FEFCE8',
    createdAt: '2026-02-12T16:20:00Z',
    updatedAt: '2026-02-12T16:20:00Z',
  }
];

const USER_A_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_a_1',
    userId: 'user_maxamed',
    title: 'Xafladda Qalin-jabinta Jaamacadda',
    description: 'Maalin taariikhi ah oo aan ku qalin-jabinay Computer Science aniga iyo asxaabteyda. Waxaa goob-joog ahaa waalidkay iyo qoyska oo dhan.',
    date: '2025-11-20',
    location: 'Muqdisho, Soomaaliya',
    photos: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80'
    ],
    people: ['Aabe Cali', 'Hooyo Xawo', 'Axmed'],
    tags: ['Jaamacad', 'Qalin-jabin', 'Qoys', 'Farxad'],
    isFavorite: true,
    createdAt: '2025-11-20T12:00:00Z'
  },
  {
    id: 'mem_a_2',
    userId: 'user_maxamed',
    title: 'Dalxiiskii Xeebta Liido & Qorrax Dhaca',
    description: 'Galab cajiib ah oo aan ku qaadanay xeebta Liido. Dabeysha badda iyo daawashada qorrax dhaca waxay ahaayeen kuwo xusuus mudan.',
    date: '2026-01-05',
    location: 'Xeebta Liido, Muqdisho',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    people: ['Jaamac', 'Guuleed'],
    tags: ['Dalxiis', 'Liido', 'Badda', 'Nasasho'],
    isFavorite: true,
    createdAt: '2026-01-05T17:30:00Z'
  }
];

const USER_A_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_a_1',
    userId: 'user_maxamed',
    title: 'Bixi Lacagta Korontada & Internet-ka',
    description: 'Bixi biilasha bishan ka hor 25-ka bisha si aan adeeggu u go&apos;in.',
    date: '2026-08-25',
    time: '10:00',
    repeat: 'monthly',
    priority: 'sare',
    isCompleted: false,
    createdAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'rem_a_2',
    userId: 'user_maxamed',
    title: 'Kulan Kooxda Mashruuca Xasuus',
    description: 'Dib u eegista naqshadda iyo tijaabinta codadka iyo AI assistant-ka.',
    date: '2026-08-24',
    time: '15:30',
    repeat: 'weekly',
    priority: 'sare',
    isCompleted: false,
    createdAt: '2026-08-21T09:00:00Z'
  }
];

const USER_A_VOICE: VoiceNoteItem[] = [
  {
    id: 'voice_a_1',
    userId: 'user_maxamed',
    title: 'Fikir ku saabsan Abka Xasuus',
    audioBlobUrl: '',
    durationSeconds: 42,
    transcript: 'Fikrad aad u muhiim ah: Waa inaan ku darnaa codka AI oo ku hadlaya af-soomaali dabiici ah oo dadka waayeelka ah u sahla in ay xusuustooda duubaan.',
    isFavorite: true,
    createdAt: '2026-02-18T16:45:00Z'
  }
];

// Initial default seed data for User B (Hoodo)
const USER_B_DOCS: DocumentItem[] = [
  {
    id: 'doc_b_1',
    userId: 'user_hoodo',
    title: 'Heshiiska Shaqada & Qandaraaska',
    fileName: 'Employment_Contract_Hoodo.pdf',
    fileSize: 3100000,
    fileType: 'application/pdf',
    category: 'Heshiisyo',
    tags: ['Shaqo', 'Qandaraas', 'Design'],
    isFavorite: true,
    summary: 'Qandaraaska shaqada Senior Product Designer muddo 2 sano ah.',
    uploadedAt: '2026-02-01T08:30:00Z',
  }
];

const USER_B_NOTES: NoteItem[] = [
  {
    id: 'note_b_1',
    userId: 'user_hoodo',
    title: 'Liiska Qalabka Xafiiska & Naqshadda',
    content: `1. Shaashad 4K Dell UltraSharp 27"\n2. Kuraasta ergonomiga ah\n3. Wacom Drawing Tablet Pro\n4. Buugaagta UI/UX Design Systems`,
    category: 'Shaqo',
    tags: ['Design', 'Qalab'],
    isFavorite: true,
    color: '#EFF6FF',
    createdAt: '2026-02-02T10:00:00Z',
    updatedAt: '2026-02-02T10:00:00Z',
  }
];

const USER_B_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_b_1',
    userId: 'user_hoodo',
    title: 'Safar Shaqo - Nairobi Tech Summit',
    description: 'Ka qaybgalka shirka weyn ee tignoolajiyada Afrika. La kulanka naqshadeeyayaal caalami ah iyo aqoon-kororsi heer sare ah.',
    date: '2026-01-18',
    location: 'Nairobi, Kenya',
    photos: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
    ],
    people: ['Aamina', 'Khadra', 'Dr. Yuusuf'],
    tags: ['Safar', 'Nairobi', 'Conference', 'Tech'],
    isFavorite: true,
    createdAt: '2026-01-18T18:00:00Z'
  }
];

const USER_B_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_b_1',
    userId: 'user_hoodo',
    title: 'Soo gudbi Warbixinta Maaliyadda',
    description: 'U dir warbixinta bishaan maamulaha guud ka hor 28-ka bisha.',
    date: '2026-08-28',
    time: '14:00',
    repeat: 'monthly',
    priority: 'sare',
    isCompleted: false,
    createdAt: '2026-08-15T09:00:00Z'
  }
];

const USER_B_VOICE: VoiceNoteItem[] = [
  {
    id: 'voice_b_1',
    userId: 'user_hoodo',
    title: 'Qorshaha Naqshadda Xasuus UI',
    audioBlobUrl: '',
    durationSeconds: 35,
    transcript: 'Midabada ugu habboon waa cagaarka madow ee pine green iyo cream background si indhaha aysan u daalin.',
    isFavorite: true,
    createdAt: '2026-02-10T14:30:00Z'
  }
];

export class StorageService {
  private static getKey(userId: string, entity: string): string {
    return `xasuus_app_${userId}_${entity}`;
  }

  // --------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------
  static getDocuments(userId: string): DocumentItem[] {
    const key = this.getKey(userId, 'documents');
    const data = getStorageItem(key);
    if (!data) {
      if (userId === 'user_maxamed') {
        setStorageItem(key, JSON.stringify(USER_A_DOCS));
        return USER_A_DOCS;
      }
      if (userId === 'user_hoodo') {
        setStorageItem(key, JSON.stringify(USER_B_DOCS));
        return USER_B_DOCS;
      }
      return [];
    }
    return JSON.parse(data);
  }

  static async fetchDocumentsRemote(userId: string): Promise<DocumentItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (!error && data) {
          const mapped: DocumentItem[] = data.map(d => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            fileName: d.file_name,
            fileSize: Number(d.file_size || 0),
            fileType: d.file_type,
            category: d.category,
            tags: d.tags || [],
            isFavorite: d.is_favorite,
            summary: d.summary,
            uploadedAt: d.uploaded_at
          }));
          setStorageItem(this.getKey(userId, 'documents'), JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchDocuments error, using local storage:', err);
      }
    }
    return this.getDocuments(userId);
  }

  static async saveDocument(userId: string, doc: DocumentItem): Promise<void> {
    const docs = this.getDocuments(userId);
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = { ...doc, userId };
    } else {
      docs.unshift({ ...doc, userId });
    }
    setStorageItem(this.getKey(userId, 'documents'), JSON.stringify(docs));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('documents').upsert({
          id: doc.id,
          user_id: userId,
          title: doc.title,
          file_name: doc.fileName,
          file_size: doc.fileSize,
          file_type: doc.fileType,
          category: doc.category,
          tags: doc.tags,
          is_favorite: doc.isFavorite,
          summary: doc.summary,
          uploaded_at: doc.uploadedAt
        });
      } catch (err) {
        console.warn('Supabase saveDocument error:', err);
      }
    }
  }

  static async deleteDocument(userId: string, docId: string): Promise<void> {
    const docs = this.getDocuments(userId).filter(d => d.id !== docId);
    setStorageItem(this.getKey(userId, 'documents'), JSON.stringify(docs));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('documents').delete().eq('id', docId);
      } catch (err) {
        console.warn('Supabase deleteDocument error:', err);
      }
    }
  }

  // --------------------------------------------------------
  // NOTES
  // --------------------------------------------------------
  static getNotes(userId: string): NoteItem[] {
    const key = this.getKey(userId, 'notes');
    const data = getStorageItem(key);
    if (!data) {
      if (userId === 'user_maxamed') {
        setStorageItem(key, JSON.stringify(USER_A_NOTES));
        return USER_A_NOTES;
      }
      if (userId === 'user_hoodo') {
        setStorageItem(key, JSON.stringify(USER_B_NOTES));
        return USER_B_NOTES;
      }
      return [];
    }
    return JSON.parse(data);
  }

  static async fetchNotesRemote(userId: string): Promise<NoteItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const mapped: NoteItem[] = data.map(n => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            content: n.content,
            category: n.category,
            tags: n.tags || [],
            isFavorite: n.is_favorite,
            createdAt: n.created_at,
            updatedAt: n.updated_at
          }));
          setStorageItem(this.getKey(userId, 'notes'), JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchNotes error, using local storage:', err);
      }
    }
    return this.getNotes(userId);
  }

  static async saveNote(userId: string, note: NoteItem): Promise<void> {
    const notes = this.getNotes(userId);
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = { ...note, userId };
    } else {
      notes.unshift({ ...note, userId });
    }
    setStorageItem(this.getKey(userId, 'notes'), JSON.stringify(notes));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notes').upsert({
          id: note.id,
          user_id: userId,
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          is_favorite: note.isFavorite,
          created_at: note.createdAt,
          updated_at: note.updatedAt || new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase saveNote error:', err);
      }
    }
  }

  static async deleteNote(userId: string, noteId: string): Promise<void> {
    const notes = this.getNotes(userId).filter(n => n.id !== noteId);
    setStorageItem(this.getKey(userId, 'notes'), JSON.stringify(notes));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('notes').delete().eq('id', noteId);
      } catch (err) {
        console.warn('Supabase deleteNote error:', err);
      }
    }
  }

  // --------------------------------------------------------
  // MEMORIES
  // --------------------------------------------------------
  static getMemories(userId: string): MemoryItem[] {
    const key = this.getKey(userId, 'memories');
    const data = getStorageItem(key);
    if (!data) {
      if (userId === 'user_maxamed') {
        setStorageItem(key, JSON.stringify(USER_A_MEMORIES));
        return USER_A_MEMORIES;
      }
      if (userId === 'user_hoodo') {
        setStorageItem(key, JSON.stringify(USER_B_MEMORIES));
        return USER_B_MEMORIES;
      }
      return [];
    }
    return JSON.parse(data);
  }

  static async fetchMemoriesRemote(userId: string): Promise<MemoryItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('memories')
          .select('*')
          .order('date', { ascending: false });

        if (!error && data) {
          const mapped: MemoryItem[] = data.map(m => ({
            id: m.id,
            userId: m.user_id,
            title: m.title,
            description: m.description,
            date: m.date,
            photos: m.image_url ? [m.image_url] : [],
            tags: m.tags || [],
            isFavorite: m.is_favorite,
            createdAt: m.created_at
          }));
          setStorageItem(this.getKey(userId, 'memories'), JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchMemories error, using local storage:', err);
      }
    }
    return this.getMemories(userId);
  }

  static async saveMemory(userId: string, memory: MemoryItem): Promise<void> {
    const memories = this.getMemories(userId);
    const idx = memories.findIndex(m => m.id === memory.id);
    if (idx >= 0) {
      memories[idx] = { ...memory, userId };
    } else {
      memories.unshift({ ...memory, userId });
    }
    setStorageItem(this.getKey(userId, 'memories'), JSON.stringify(memories));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('memories').upsert({
          id: memory.id,
          user_id: userId,
          title: memory.title,
          description: memory.description,
          date: memory.date,
          category: 'Xusuus',
          tags: memory.tags,
          is_favorite: memory.isFavorite,
          image_url: memory.photos?.[0] || null,
          created_at: memory.createdAt
        });
      } catch (err) {
        console.warn('Supabase saveMemory error:', err);
      }
    }
  }

  static async deleteMemory(userId: string, memoryId: string): Promise<void> {
    const memories = this.getMemories(userId).filter(m => m.id !== memoryId);
    setStorageItem(this.getKey(userId, 'memories'), JSON.stringify(memories));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('memories').delete().eq('id', memoryId);
      } catch (err) {
        console.warn('Supabase deleteMemory error:', err);
      }
    }
  }

  // --------------------------------------------------------
  // REMINDERS
  // --------------------------------------------------------
  static getReminders(userId: string): ReminderItem[] {
    const key = this.getKey(userId, 'reminders');
    const data = getStorageItem(key);
    if (!data) {
      if (userId === 'user_maxamed') {
        setStorageItem(key, JSON.stringify(USER_A_REMINDERS));
        return USER_A_REMINDERS;
      }
      if (userId === 'user_hoodo') {
        setStorageItem(key, JSON.stringify(USER_B_REMINDERS));
        return USER_B_REMINDERS;
      }
      return [];
    }
    return JSON.parse(data);
  }

  static async fetchRemindersRemote(userId: string): Promise<ReminderItem[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .order('due_date', { ascending: true });

        if (!error && data) {
          const mapped: ReminderItem[] = data.map(r => ({
            id: r.id,
            userId: r.user_id,
            title: r.title,
            description: '',
            date: r.due_date,
            time: r.time,
            repeat: 'none',
            priority: r.priority === 'sare' || r.priority === 'hoose' ? r.priority : 'dhexe',
            isCompleted: r.is_completed,
            createdAt: r.created_at
          }));
          setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(mapped));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchReminders error, using local storage:', err);
      }
    }
    return this.getReminders(userId);
  }

  static async saveReminder(userId: string, reminder: ReminderItem): Promise<void> {
    const reminders = this.getReminders(userId);
    const idx = reminders.findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      reminders[idx] = { ...reminder, userId };
    } else {
      reminders.unshift({ ...reminder, userId });
    }
    setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(reminders));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reminders').upsert({
          id: reminder.id,
          user_id: userId,
          title: reminder.title,
          due_date: reminder.date,
          time: reminder.time,
          category: 'Guud',
          priority: reminder.priority,
          is_completed: reminder.isCompleted,
          created_at: reminder.createdAt
        });
      } catch (err) {
        console.warn('Supabase saveReminder error:', err);
      }
    }
  }

  static async deleteReminder(userId: string, reminderId: string): Promise<void> {
    const reminders = this.getReminders(userId).filter(r => r.id !== reminderId);
    setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(reminders));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('reminders').delete().eq('id', reminderId);
      } catch (err) {
        console.warn('Supabase deleteReminder error:', err);
      }
    }
  }

  // --------------------------------------------------------
  // VOICE NOTES
  // --------------------------------------------------------
  static getVoiceNotes(userId: string): VoiceNoteItem[] {
    const key = this.getKey(userId, 'voice');
    const data = getStorageItem(key);
    if (!data) {
      if (userId === 'user_maxamed') {
        setStorageItem(key, JSON.stringify(USER_A_VOICE));
        return USER_A_VOICE;
      }
      if (userId === 'user_hoodo') {
        setStorageItem(key, JSON.stringify(USER_B_VOICE));
        return USER_B_VOICE;
      }
      return [];
    }
    return JSON.parse(data);
  }

  static async saveVoiceNote(userId: string, voice: VoiceNoteItem): Promise<void> {
    const voices = this.getVoiceNotes(userId);
    const idx = voices.findIndex(v => v.id === voice.id);
    if (idx >= 0) {
      voices[idx] = { ...voice, userId };
    } else {
      voices.unshift({ ...voice, userId });
    }
    setStorageItem(this.getKey(userId, 'voice'), JSON.stringify(voices));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('voice_notes').upsert({
          id: voice.id,
          user_id: userId,
          title: voice.title,
          duration: `${voice.durationSeconds}s`,
          audio_url: voice.audioBlobUrl || '',
          category: 'Cod',
          is_favorite: voice.isFavorite,
          transcript: voice.transcript,
          created_at: voice.createdAt
        });
      } catch (err) {
        console.warn('Supabase saveVoiceNote error:', err);
      }
    }
  }

  static async deleteVoiceNote(userId: string, voiceId: string): Promise<void> {
    const voices = this.getVoiceNotes(userId).filter(v => v.id !== voiceId);
    setStorageItem(this.getKey(userId, 'voice'), JSON.stringify(voices));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('voice_notes').delete().eq('id', voiceId);
      } catch (err) {
        console.warn('Supabase deleteVoiceNote error:', err);
      }
    }
  }

  // --------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------
  static getNotifications(userId: string): NotificationItem[] {
    const key = this.getKey(userId, 'notifications');
    const data = getStorageItem(key);
    if (!data) {
      const defaultNotifs: NotificationItem[] = [
        {
          id: 'notif_welcome',
          title: 'Ku soo dhawoow Xasuus',
          message: 'Kusoo dhawaaw nidaamkaaga xafidista dukumiintiyada iyo xusuusyada gaarka ah.',
          type: 'info',
          isRead: false,
          timestamp: new Date().toISOString()
        }
      ];
      setStorageItem(key, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return JSON.parse(data);
  }

  static async saveNotifications(userId: string, notifs: NotificationItem[]): Promise<void> {
    setStorageItem(this.getKey(userId, 'notifications'), JSON.stringify(notifs));
  }

  // --------------------------------------------------------
  // AI CHAT HISTORY
  // --------------------------------------------------------
  static getAIChatHistory(userId: string, userName: string): AIChatMessage[] {
    const key = this.getKey(userId, 'aichat');
    const data = getStorageItem(key);
    if (!data) {
      const initialChat: AIChatMessage[] = [
        {
          id: 'chat_welcome',
          sender: 'ai',
          message: `Asc ${userName}! Waxaan ahay Xasuus AI Assistant. Maxaan maanta kugu caawin karaa? Waxaad i weydiin kartaa dukumiintiyadaada, qoraalladaada, ama xusuusahaaga.`,
          timestamp: new Date().toISOString()
        }
      ];
      setStorageItem(key, JSON.stringify(initialChat));
      return initialChat;
    }
    return JSON.parse(data);
  }

  static async saveAIChatMessage(userId: string, message: AIChatMessage): Promise<void> {
    const history = this.getAIChatHistory(userId, '');
    history.push(message);
    setStorageItem(this.getKey(userId, 'aichat'), JSON.stringify(history));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('ai_chats').insert({
          id: message.id,
          user_id: userId,
          sender: message.sender,
          message: message.message,
          timestamp: message.timestamp
        });
      } catch (err) {
        console.warn('Supabase saveAIChatMessage error:', err);
      }
    }
  }

  static clearAIChatHistory(userId: string): void {
    setStorageItem(this.getKey(userId, 'aichat'), JSON.stringify([]));
  }
}
