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

// Initial data for User A (Maxamed)
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
    title: 'Socdaalkii Xeebta Liido & Qorrax dhicii',
    description: 'Galab aad u qurux badan oo aan la qaatay asxaabta jaamacadda. Dabayl qabow iyo sheekooyin xusuus reebay.',
    date: '2026-02-05',
    location: 'Liido Beach, Muqdisho',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80'
    ],
    people: ['Cumar', 'Khaalid', 'Mustafe'],
    tags: ['Xeeb', 'Liido', 'Asxaab', 'Nasasho'],
    isFavorite: true,
    createdAt: '2026-02-05T19:00:00Z'
  },
  {
    id: 'mem_a_2',
    userId: 'user_maxamed',
    title: 'Xafladdii Qalinjabinta Saaxiibkay',
    description: 'Maalin taariikhi ah oo saaxiibkay Axmed qaatay Master-ka. Farxad weyn iyo qoyska oo dhan oo wada jira.',
    date: '2026-01-25',
    location: 'Hoteel Jazeera, Muqdisho',
    photos: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80'
    ],
    people: ['Axmed', 'Farxaan', 'Cali'],
    tags: ['Qalinjabin', 'Farxad', 'Guul'],
    isFavorite: true,
    createdAt: '2026-01-25T20:30:00Z'
  }
];

const USER_A_REMINDERS: ReminderItem[] = [
  {
    id: 'rem_a_1',
    userId: 'user_maxamed',
    title: 'Bixi Biilka Korontada iyo Biyaha',
    description: 'Hubi in biilasha bishan la bixiyo ka hor inta aan la gaarin 25-ka bisha.',
    date: '2026-08-25',
    time: '10:00',
    repeat: 'monthly',
    priority: 'sare',
    isCompleted: false,
    createdAt: '2026-08-20T08:00:00Z'
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

// Initial data for User B (Hoodo) - COMPLETELY SEPARATE
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
  },
  {
    id: 'doc_b_2',
    userId: 'user_hoodo',
    title: 'Qorshaha Miisaaniyadda Mashruuca 2026',
    fileName: 'Project_Budget_2026.pdf',
    fileSize: 1450000,
    fileType: 'application/pdf',
    category: 'Maaliyadda',
    tags: ['Miisaaniyad', 'Finance', 'Mashruuc'],
    isFavorite: false,
    summary: 'Qiyaasta kharashaadka naqshadda iyo horumarinta website-ka cusub.',
    uploadedAt: '2026-02-08T12:00:00Z',
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
  },
  {
    id: 'rem_b_2',
    userId: 'user_hoodo',
    title: 'Kulan Macmiilka Cusub ee Hargeysa',
    description: 'Bandhigga horudhaca ah ee Website-ka cusub.',
    date: '2026-08-26',
    time: '11:00',
    repeat: 'none',
    priority: 'dhexe',
    isCompleted: false,
    createdAt: '2026-08-18T10:30:00Z'
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

  // Documents
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

  static saveDocument(userId: string, doc: DocumentItem): void {
    const docs = this.getDocuments(userId);
    const idx = docs.findIndex(d => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = { ...doc, userId };
    } else {
      docs.unshift({ ...doc, userId });
    }
    setStorageItem(this.getKey(userId, 'documents'), JSON.stringify(docs));
  }

  static deleteDocument(userId: string, docId: string): void {
    const docs = this.getDocuments(userId).filter(d => d.id !== docId);
    setStorageItem(this.getKey(userId, 'documents'), JSON.stringify(docs));
  }

  // Notes
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

  static saveNote(userId: string, note: NoteItem): void {
    const notes = this.getNotes(userId);
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = { ...note, userId };
    } else {
      notes.unshift({ ...note, userId });
    }
    setStorageItem(this.getKey(userId, 'notes'), JSON.stringify(notes));
  }

  static deleteNote(userId: string, noteId: string): void {
    const notes = this.getNotes(userId).filter(n => n.id !== noteId);
    setStorageItem(this.getKey(userId, 'notes'), JSON.stringify(notes));
  }

  // Memories
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

  static saveMemory(userId: string, memory: MemoryItem): void {
    const memories = this.getMemories(userId);
    const idx = memories.findIndex(m => m.id === memory.id);
    if (idx >= 0) {
      memories[idx] = { ...memory, userId };
    } else {
      memories.unshift({ ...memory, userId });
    }
    setStorageItem(this.getKey(userId, 'memories'), JSON.stringify(memories));
  }

  static deleteMemory(userId: string, memoryId: string): void {
    const memories = this.getMemories(userId).filter(m => m.id !== memoryId);
    setStorageItem(this.getKey(userId, 'memories'), JSON.stringify(memories));
  }

  // Reminders
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

  static saveReminder(userId: string, reminder: ReminderItem): void {
    const reminders = this.getReminders(userId);
    const idx = reminders.findIndex(r => r.id === reminder.id);
    if (idx >= 0) {
      reminders[idx] = { ...reminder, userId };
    } else {
      reminders.unshift({ ...reminder, userId });
    }
    setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(reminders));
  }

  static toggleReminderComplete(userId: string, reminderId: string): void {
    const reminders = this.getReminders(userId);
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.isCompleted = !reminder.isCompleted;
      setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(reminders));
    }
  }

  static deleteReminder(userId: string, reminderId: string): void {
    const reminders = this.getReminders(userId).filter(r => r.id !== reminderId);
    setStorageItem(this.getKey(userId, 'reminders'), JSON.stringify(reminders));
  }

  // Voice Notes
  static getVoiceNotes(userId: string): VoiceNoteItem[] {
    const key = this.getKey(userId, 'voice_notes');
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

  static saveVoiceNote(userId: string, voiceNote: VoiceNoteItem): void {
    const voiceNotes = this.getVoiceNotes(userId);
    const idx = voiceNotes.findIndex(v => v.id === voiceNote.id);
    if (idx >= 0) {
      voiceNotes[idx] = { ...voiceNote, userId };
    } else {
      voiceNotes.unshift({ ...voiceNote, userId });
    }
    setStorageItem(this.getKey(userId, 'voice_notes'), JSON.stringify(voiceNotes));
  }

  static deleteVoiceNote(userId: string, voiceNoteId: string): void {
    const voiceNotes = this.getVoiceNotes(userId).filter(v => v.id !== voiceNoteId);
    setStorageItem(this.getKey(userId, 'voice_notes'), JSON.stringify(voiceNotes));
  }

  // Notifications
  static getNotifications(userId: string): NotificationItem[] {
    const key = this.getKey(userId, 'notifications');
    const data = getStorageItem(key);
    if (!data) {
      const defaultNotifs: NotificationItem[] = [
        {
          id: `notif_${Date.now()}`,
          userId,
          title: 'Ku soo dhowow Xasuus!',
          message: 'Xogtaadu waa mid si buuxda u qarsoon oo adiga kuu gaar ah.',
          type: 'system',
          isRead: false,
          timestamp: new Date().toISOString()
        }
      ];
      setStorageItem(key, JSON.stringify(defaultNotifs));
      return defaultNotifs;
    }
    return JSON.parse(data);
  }

  static markNotificationRead(userId: string, notifId: string): void {
    const notifs = this.getNotifications(userId);
    const notif = notifs.find(n => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      setStorageItem(this.getKey(userId, 'notifications'), JSON.stringify(notifs));
    }
  }

  static clearAllNotifications(userId: string): void {
    setStorageItem(this.getKey(userId, 'notifications'), JSON.stringify([]));
  }

  // AI Chat History
  static getAIChatHistory(userId: string, userName: string): AIChatMessage[] {
    const key = this.getKey(userId, 'ai_chat');
    const data = getStorageItem(key);
    if (!data) {
      const defaultChat: AIChatMessage[] = [
        {
          id: 'ai_welcome',
          sender: 'assistant',
          text: `Asc ${userName}! 👋 Waxaan ahay Xasuus AI Assistant. Sideen maanta kuu caawin karaa? Waxaan marin u leeyahay oo kaliya xogtaada gaarka ah.`,
          timestamp: new Date().toISOString()
        }
      ];
      setStorageItem(key, JSON.stringify(defaultChat));
      return defaultChat;
    }
    return JSON.parse(data);
  }

  static saveAIChatHistory(userId: string, messages: AIChatMessage[]): void {
    setStorageItem(this.getKey(userId, 'ai_chat'), JSON.stringify(messages));
  }
}
