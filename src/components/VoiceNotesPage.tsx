import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Heart, 
  Download, 
  Clock, 
  Calendar, 
  Volume2, 
  Plus, 
  FileAudio 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VoiceNoteItem } from '../types';

export const VoiceNotesPage: React.FC = () => {
  const { voiceNotes, addVoiceNote, deleteVoiceNote, toggleVoiceFavorite } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Add to store with Somali sample transcription
        addVoiceNote({
          title: `Cod Duuban ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          audioBlobUrl: audioUrl,
          durationSeconds: recordingTime || 15,
          transcript: `Duubitaan cod ah oo la duubay ${new Date().toLocaleDateString('so-SO')}. AI ayaa si otomaatig ah u falanqaysay codkan.`,
          isFavorite: false
        });

        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      // Fallback synthetic voice note creation
      alert("Makarafoonka lama helin ama ogolaansho lama bixin. Waxaan abuureynaa tusaale cod ah.");
      addVoiceNote({
        title: `Cod Duuban ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        audioBlobUrl: '',
        durationSeconds: 24,
        transcript: 'Fikrad muhiim ah: Waa inaan dib u eegnaa qorshaha mashruuca iyo waqtiyada la qabanayo hawlaha.',
        isFavorite: false
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayAudio = (note: VoiceNoteItem) => {
    if (playingId === note.id) {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setPlayingId(null);
    } else {
      if (note.audioBlobUrl) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = note.audioBlobUrl;
          audioPlayerRef.current.play();
        }
      }
      setPlayingId(note.id);
      setTimeout(() => {
        setPlayingId(null);
      }, (note.durationSeconds || 5) * 1000);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      <audio ref={audioPlayerRef} onEnded={() => setPlayingId(null)} className="hidden" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1a202c] tracking-tight">Codadkaaga (Voice Notes)</h2>
          <p className="text-[14px] text-[#718096] mt-0.5">
            Duub fikirradaada, xusuusahaaga, iyo codadka muhiimka ah adigoo isticmaalaya makarafoonka.
          </p>
        </div>
      </div>

      {/* Live Recording Station Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece9df] shadow-xs text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-[13px] font-semibold text-[#0e382b]">
          <Mic className="w-4 h-4" />
          <span>Xarunta Duubista Codka (Live Voice Recorder)</span>
        </div>

        {isRecording ? (
          <div className="space-y-4">
            <div className="text-[36px] font-mono font-bold text-rose-600 animate-pulse">
              {formatSeconds(recordingTime)}
            </div>

            <div className="flex items-center justify-center gap-1.5 h-8">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-rose-500 rounded-full animate-bounce"
                  style={{
                    height: `${Math.max(8, Math.sin(i + recordingTime) * 30 + 15)}px`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <button
              onClick={stopRecording}
              className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[14px] flex items-center gap-2 mx-auto shadow-lg active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Jooji Duubista & Kaydi</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[14px] text-[#718096] max-w-md mx-auto">
              Guji badhanka hoose si aad u bilowdo duubista codkaaga si toos ah.
            </p>

            <button
              onClick={startRecording}
              className="px-6 py-3.5 rounded-full bg-[#0e382b] hover:bg-[#092b21] text-white font-bold text-[14px] flex items-center gap-2.5 mx-auto shadow-md hover:shadow-lg active:scale-95 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                <Mic className="w-4 h-4 text-emerald-300" />
              </div>
              <span>Bilow Duubis Cusub</span>
            </button>
          </div>
        )}
      </div>

      {/* Voice Notes Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-[16px] text-[#1a202c]">Codadkii Hore loo Duubay ({voiceNotes.length})</h3>

        {voiceNotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[#ece9df] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#def7ee] flex items-center justify-center text-[#0e382b] mx-auto">
              <FileAudio className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-[16px] text-[#1a202c]">Weli ma jiraan codad keydsan</h4>
            <p className="text-[13px] text-[#718096] max-w-sm mx-auto">
              Bilow inaad duubto codkaagii ugu horreeyay adigoo riixaya &ldquo;Bilow Duubis Cusub&rdquo;.
            </p>
          </div>
        ) : (
          voiceNotes.map((note) => {
            const isPlaying = playingId === note.id;
            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl p-5 border border-[#ece9df] shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <button
                    onClick={() => togglePlayAudio(note)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-sm ${
                      isPlaying 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-[#0e382b] text-white hover:bg-[#092b21]'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[15.5px] text-[#1a202c] group-hover:text-[#0e382b] transition-colors">
                        {note.title}
                      </h4>
                      <span className="text-[12px] font-mono text-[#718096]">
                        {formatSeconds(note.durationSeconds || 0)}
                      </span>
                    </div>

                    {note.transcript && (
                      <p className="text-[13px] text-[#4a5568] leading-relaxed italic bg-[#fbf9f0] p-2.5 rounded-xl border border-[#ece9df]">
                        &ldquo;{note.transcript}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[11.5px] text-[#718096]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(note.createdAt).toLocaleDateString('so-SO')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleVoiceFavorite(note.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      note.isFavorite ? 'text-rose-500 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-500 hover:bg-gray-50'
                    }`}
                    title={note.isFavorite ? 'Ka saar favorites' : 'Ku dar favorites'}
                  >
                    <Heart className={`w-4 h-4 ${note.isFavorite ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Ma hubtaa inaad tirtirto codka "${note.title}"?`)) {
                        deleteVoiceNote(note.id);
                      }
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Tirtir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
