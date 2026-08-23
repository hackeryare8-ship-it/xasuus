import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Trash2, 
  FileText, 
  Calendar, 
  AlignLeft, 
  User, 
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIService } from '../services/aiService';
import { AIChatMessage } from '../types';

export const AIAssistantModal: React.FC = () => {
  const { 
    currentUser, 
    isAIModalOpen, 
    setIsAIModalOpen, 
    documents, 
    notes, 
    memories, 
    reminders, 
    voiceNotes,
    aiChatHistory,
    addAIMessage,
    clearAIChat,
    setActiveTab
  } = useApp();

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Ii soo hel document-kii heshiiska.',
    'Maxaan berri xasuusanayaa?',
    'Qoraalladayda shaqada ii soo koob.',
    'Xusuus ma leeyahay xeebta Liido?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAIModalOpen) {
      scrollToBottom();
    }
  }, [isAIModalOpen, aiChatHistory, isThinking]);

  if (!isAIModalOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isThinking) return;

    const userMsg: AIChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    addAIMessage(userMsg);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const response = await AIService.querySomaliAssistant(query, {
        documents,
        notes,
        memories,
        reminders,
        voiceNotes,
        userName: currentUser.name.split(' ')[0]
      });

      const assistantMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        suggestedActions: response.action ? [
          {
            label: response.action.label,
            action: () => {
              setActiveTab(response.action!.tab as any);
              setIsAIModalOpen(false);
            }
          }
        ] : undefined
      };

      addAIMessage(assistantMsg);
    } catch (err) {
      console.error(err);
      addAIMessage({
        id: `ai_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Waxbaa khaldamay. Fadlan mar kale isku day.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-200">
      <div className="bg-white h-full w-full max-w-lg shadow-2xl flex flex-col justify-between border-l border-[#ece9df] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#ece9df] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0e382b] flex items-center justify-center text-emerald-300 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-[16px] text-[#1a202c]">Xasuus AI Assistant</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11.5px] text-[#718096]">Af-Soomaali ku hadla & xogtaada u gaar ah</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearAIChat}
              className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-gray-100 transition-colors"
              title="Nadiifi sheekada"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fcfaf2]">
          {aiChatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#0e382b] text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-[#0e382b] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#1a202c] border border-[#ece9df] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-gray-100 flex flex-wrap gap-1 text-[11px] text-[#718096]">
                        <span className="font-semibold">Isha xogta:</span>
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="bg-[#f0ede0] px-1.5 py-0.5 rounded text-gray-700 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={act.action}
                          className="px-3.5 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-[#0e382b] text-[12px] font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[10px] text-[#a0aec0] px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-emerald-600/30"
                  />
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0e382b] text-emerald-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-[#ece9df] px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[12px] text-[#718096] ml-2 font-medium">AI ayaa fikiraysa...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset Quick Chips */}
        <div className="p-3 bg-white border-t border-[#ece9df] flex items-center gap-2 overflow-x-auto">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-3 py-1.5 rounded-full bg-[#fbf9f0] hover:bg-[#def7ee] hover:text-[#0e382b] border border-[#ece9df] text-[12px] text-[#4a5568] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-[#ece9df]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Weydii wax kasta af-Soomaali..."
              className="flex-1 bg-[#fbf9f0] border border-[#ece9df] rounded-full px-4 py-3 text-[13.5px] outline-none focus:ring-2 focus:ring-[#0e382b]/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="w-11 h-11 rounded-full bg-[#0e382b] hover:bg-[#092b21] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
