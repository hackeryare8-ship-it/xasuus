import { DocumentItem, NoteItem, MemoryItem, ReminderItem, VoiceNoteItem } from '../types';

export interface AISearchContext {
  documents: DocumentItem[];
  notes: NoteItem[];
  memories: MemoryItem[];
  reminders: ReminderItem[];
  voiceNotes: VoiceNoteItem[];
  userName: string;
}

export class AIService {
  static async querySomaliAssistant(
    prompt: string, 
    context: AISearchContext
  ): Promise<{ text: string; sources?: string[]; action?: { label: string; tab: string } }> {
    const q = prompt.toLowerCase().trim();
    const { documents, notes, memories, reminders, voiceNotes, userName } = context;

    // Simulate realistic AI thought processing latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Check for documents queries (heshiis, heshiiska, dukumiinti, shahaado, warbixin, caafimaad)
    if (q.includes('document') || q.includes('dukumiinti') || q.includes('heshiis') || q.includes('shahaado') || q.includes('pdf') || q.includes('warbixin')) {
      const matchedDocs = documents.filter(d => 
        q.includes(d.title.toLowerCase()) || 
        d.tags.some(t => q.includes(t.toLowerCase())) ||
        (q.includes('heshiis') && d.category.toLowerCase().includes('heshiis')) ||
        (q.includes('shahaado') && d.title.toLowerCase().includes('shahaado')) ||
        (q.includes('caafimaad') && d.category.toLowerCase().includes('caafimaad'))
      );

      if (matchedDocs.length > 0) {
        const docList = matchedDocs.map(d => `📄 **${d.title}** (${d.category}) - ${d.summary || d.fileName}`).join('\n');
        return {
          text: `Haa ${userName}, waxaan kuu helay dukumiintiyadan ku habboon codsigaaga:\n\n${docList}\n\nMa doonaysaa inaan faahfaahin dheeraad ah kaa siiyo mise inaad furto?`,
          sources: matchedDocs.map(d => d.title),
          action: { label: 'Fur Dukumiintiyada', tab: 'dukumiintiyo' }
        };
      } else if (documents.length > 0) {
        return {
          text: `Waxaad haysataa wadar ahaan **${documents.length}** dukumiinti. Kuwa ugu dambeeyay waxaa ka mid ah: ${documents.map(d => `"${d.title}"`).join(', ')}. Fadlan ii sheeg magaca dukumiintiga gaarka ah ee aad raadinayso.`,
          sources: documents.map(d => d.title),
          action: { label: 'Eeg dhammaan Dukumiintiyada', tab: 'dukumiintiyo' }
        };
      } else {
        return {
          text: `Weli ma aadan soo galin wax dukumiinti ah. Waxaad riixi kartaa badhanka **"+ Add New"** si aad u keydiso dukumiintigaagii ugu horreeyay.`,
          action: { label: 'Ku dar Dukumiinti', tab: 'dukumiintiyo' }
        };
      }
    }

    // 2. Check for reminders queries (berri, xasuusiye, xasuuso, ballan, biil, kulan, maxaan qabanayaa)
    if (q.includes('berri') || q.includes('xasuusiye') || q.includes('xasuusanayaa') || q.includes('ballan') || q.includes('kulan') || q.includes('biil') || q.includes('reminder') || q.includes('maanta')) {
      const activeReminders = reminders.filter(r => !r.isCompleted);
      
      if (activeReminders.length > 0) {
        const remList = activeReminders.map(r => `⏰ **${r.title}** (${r.date} saacadda ${r.time}) - Ahmiyadda: *${r.priority.toUpperCase()}*`).join('\n');
        return {
          text: `Halkan waxaa ah xasuusiyeyaashaada iyo ballamaha kuu diiwaangashan:\n\n${remList}\n\nFadlan xasuuso inaad waqtigooda fuliso!`,
          sources: activeReminders.map(r => r.title),
          action: { label: 'Eeg Xasuusiyeyaasha', tab: 'xasuusiyayaal' }
        };
      } else {
        return {
          text: `Ma jiraan wax xasuusiye ah oo kuu dhiman xilligan. Wax kasta waa nidaamsan yihiin!`,
          action: { label: 'Ku dar Xasuusiye Cusub', tab: 'xasuusiyayaal' }
        };
      }
    }

    // 3. Check for notes queries (qoraal, qoraallo, buug, fikrad, liis)
    if (q.includes('qoraal') || q.includes('qoraallo') || q.includes('note') || q.includes('fikrad') || q.includes('liis')) {
      if (notes.length > 0) {
        const noteList = notes.map(n => `📝 **${n.title}** (${n.category})\n${n.content.slice(0, 80)}...`).join('\n\n');
        return {
          text: `Waxaad leedahay **${notes.length}** qoraal. Halkan waa dulmar ku saabsan:\n\n${noteList}`,
          sources: notes.map(n => n.title),
          action: { label: 'Fur Qoraallada', tab: 'qoraallo' }
        };
      } else {
        return {
          text: `Weli ma lihid qoraallo keydsan. Waxaad abuuri kartaa qoraal cusub adigoo tagaya qeybta Qoraallada.`,
          action: { label: 'Qor Qoraal', tab: 'qoraallo' }
        };
      }
    }

    // 4. Check for memories queries (xusuus, xusuuso, sawirro, safar, xeeb, aroos)
    if (q.includes('xusuus') || q.includes('xusuuso') || q.includes('memory') || q.includes('sawir') || q.includes('safar') || q.includes('liido') || q.includes('aroos')) {
      if (memories.length > 0) {
        const memList = memories.map(m => `✨ **${m.title}** (${m.date}${m.location ? ` - ${m.location}` : ''})\n${m.description}`).join('\n\n');
        return {
          text: `Halkan waa xusuusahaagii qaaliga ahaa:\n\n${memList}`,
          sources: memories.map(m => m.title),
          action: { label: 'Eeg Xusuusaha', tab: 'xusuuso' }
        };
      } else {
        return {
          text: `Weli ma aadan kaydin xusuuso. Waxaad ku dari kartaa sawirro, codad iyo faahfaahin qeybta Xusuuso.`,
          action: { label: 'Ku dar Xusuus', tab: 'xusuuso' }
        };
      }
    }

    // 5. Check for voice queries (cod, codad, duubid, audio)
    if (q.includes('cod') || q.includes('voice') || q.includes('duub') || q.includes('audio')) {
      if (voiceNotes.length > 0) {
        const voiceList = voiceNotes.map(v => `🎙️ **${v.title}** (${v.durationSeconds} ilbiriqsi)\nQoraalka: "${v.transcript || 'Duubitaan cod ah'}"`).join('\n\n');
        return {
          text: `Waxaad haysataa **${voiceNotes.length}** cod oo keydsan:\n\n${voiceList}`,
          sources: voiceNotes.map(v => v.title),
          action: { label: 'Dhageyso Codadka', tab: 'codad' }
        };
      } else {
        return {
          text: `Ma jiraan codad hadda kuu keydsan. Waxaad si toos ah makarafoonka uga duubi kartaa qeybta Codadka.`,
          action: { label: 'Duub Cod', tab: 'codad' }
        };
      }
    }

    // 6. General Greetings and Conversational Somali
    if (q.includes('asc') || q.includes('salaam') || q.includes('subax') || q.includes('galab') || q.includes('hi') || q.includes('hello')) {
      return {
        text: `Wa calaykumu salaam ${userName}! 👋 Waxaan diyaar u ahay inaan kugu caawiyo baaritaanka dukumiintiyadaada, diiwaangelinta qoraallada, soo saarista xusuusaha, iyo hubinta ballamahaaga. Maxaad jeclaan lahayd inaad maanta qabato?`
      };
    }

    if (q.includes('mahadsanid') || q.includes('thx') || q.includes('thanks')) {
      return {
        text: `Adaa mudan ${userName}! Mar walba diyaar ayaan kuu ahay. Haddii wax kale aad u baahato, kaliya ii sheeg.`
      };
    }

    // 7. General Fallback with intelligent overview
    const totalItems = documents.length + notes.length + memories.length + reminders.length + voiceNotes.length;
    return {
      text: `Waad ku mahadsan tahay su'aashaada, ${userName}.\n\nWaxaan ku baaray dhammaan xogtaada (${totalItems} shay oo keydsan). Waxaad i weydiin kartaa waxyaabaha soo socda:\n- *"Ii soo hel heshiisyada aan hayo"*\n- *"Maxaan berri xasuusanayaa?"*\n- *"Ii soo koob qoraalladayda shaqada"*\n- *"Miyaan leeyahay sawirro iyo xusuuso?"*`,
      sources: [`Xogta guud ee ${userName}`]
    };
  }
}
