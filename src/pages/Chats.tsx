import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, MapPin, Image, X, Globe, 
  CheckCheck, ArrowLeft, Building, Navigation, User 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getConversations, getConversationById, sendMessage } from '../api/conversationsApi';
import { getSignalRConnection, startSignalRConnection, joinSignalRSession, leaveSignalRSession } from '../realtime/signalRClient';
import { ChatSession, ChatMessage } from '../types/models';

export default function Chats() {
  const { t, language, dir } = useLanguage();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Message form inputs
  const [msgText, setMsgText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('userId') || 'user_sarah';

  const loadSessions = () => {
    getConversations()
      .then(res => {
        const mapped: ChatSession[] = res.map(c => ({
          id: c.id,
          participants: c.participants,
          messages: (c.messages || []).map(m => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            text: m.text,
            imageUrl: m.imageUrl,
            location: m.location,
            createdAt: m.createdAt
          }))
        }));

        const sorted = [...mapped].sort((a, b) => {
          const aTime = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].createdAt).getTime() : 0;
          const bTime = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setSessions(sorted);
        if (activeSession) {
          const updated = sorted.find(s => s.id === activeSession.id);
          if (updated) setActiveSession(updated);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
    startSignalRConnection();

    const conn = getSignalRConnection();
    const handleReceiveMessage = (msgPayload: any) => {
      loadSessions();
    };

    conn.on('ReceiveMessage', handleReceiveMessage);

    return () => {
      conn.off('ReceiveMessage', handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    if (activeSession?.id) {
      joinSignalRSession(activeSession.id);
      return () => {
        leaveSignalRSession(activeSession.id);
      };
    }
  }, [activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || (!msgText.trim() && !imageUrl.trim())) return;

    try {
      await sendMessage(activeSession.id, {
        text: msgText,
        imageUrl: imageUrl.trim() ? imageUrl : undefined
      });

      setMsgText('');
      setImageUrl('');
      setShowImageInput(false);
      
      const updated = await getConversationById(activeSession.id);
      setActiveSession({
        id: updated.id,
        participants: updated.participants,
        messages: (updated.messages || []).map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          text: m.text,
          imageUrl: m.imageUrl,
          location: m.location,
          createdAt: m.createdAt
        }))
      });
      loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    }
  };

  const handleShareLocation = async () => {
    if (!activeSession) return;
    try {
      // Simulate sharing guide meeting point coordinates
      await sendMessage(activeSession.id, {
        text: language === 'ar' ? 'شاركت موقع نقطة التجمع للمسار الجبلي.' : 'Shared mountain trail gathering coordinates.',
        latitude: 18.2164,
        longitude: 42.5053
      });
      loadSessions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto h-[100dvh] pb-24 flex flex-col md:flex-row bg-slate-50 overflow-hidden" dir={dir}>
      
      {/* Sidebar - Threads list */}
      <div className="w-full md:w-[320px] bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0">
        <div className="p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-black text-primary flex items-center gap-1.5">
            <MessageSquare className="w-5.5 h-5.5 text-secondary" />
            {language === 'ar' ? 'المحادثات الفورية' : 'In-App Messenger'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bold text-xs">
              {language === 'ar' ? 'لا توجد محادثات نشطة.' : 'No active chat threads.'}
            </div>
          ) : (
            sessions.map(s => {
              const lastMsg = s.messages[s.messages.length - 1];
              const partnerName = s.participants.find(p => p !== currentUserId) || 'Guide Abdullah';
              
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSession(s)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all hover:bg-slate-50 border flex gap-3 ${
                    activeSession?.id === s.id ? 'bg-blue-50/50 border-secondary' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-secondary shrink-0 border border-slate-200">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-xs text-slate-800 block truncate">{partnerName.replace('user_', '').replace('guide_', '')}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">{lastMsg?.text || 'Sent media'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat log window */}
      <div className="flex-1 bg-white border border-slate-200 flex flex-col h-full overflow-hidden">
        {!activeSession ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-450 font-bold text-xs gap-3">
            <MessageSquare className="w-10 h-10 text-slate-200" />
            <span>{language === 'ar' ? 'اختر محادثة لبدء المراسلة الفورية.' : 'Select a chat thread to inspect instant messages.'}</span>
          </div>
        ) : (
          <>
            {/* Active partner bar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/40">
              <span className="font-extrabold text-sm text-slate-850 flex items-center gap-1.5">
                <User className="w-4 h-4 text-secondary" />
                <span>{activeSession.participants.find(p => p !== currentUserId)?.replace('user_', '').replace('guide_', '')}</span>
              </span>
              <button
                onClick={() => setActiveSession(null)}
                className="md:hidden text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer border-none bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Message logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-1">
              {activeSession.messages.map((m, idx) => {
                const isMe = m.senderId === currentUserId;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe ? 'bg-secondary text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      <span className="font-extrabold text-[9px] opacity-80 block mb-0.5">{m.senderName}</span>
                      <p>{m.text}</p>
                      
                      {/* Image attachments */}
                      {m.imageUrl && (
                        <div className="h-32 rounded-lg overflow-hidden border border-white/20 mt-2">
                          <img src={m.imageUrl} alt="Chat attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Map Coordinate attachment representation */}
                      {m.location && (
                        <div className="bg-white/20 border border-white/10 p-2.5 rounded-xl text-[10px] font-bold mt-2 flex items-center gap-1.5 justify-between">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-secondary" /> Lat: {m.location.lat}, Lng: {m.location.lng}</span>
                          <button
                            onClick={() => alert(`Navigating coordinates: ${m.location?.lat}, ${m.location?.lng}`)}
                            className="bg-white/95 text-secondary px-2 py-0.5 rounded text-[8px] border-none cursor-pointer font-black uppercase"
                          >
                            {language === 'ar' ? 'عرض' : 'View'}
                          </button>
                        </div>
                      )}

                      <span className="text-[8px] opacity-60 block mt-1.5 text-right">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input send controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/20 shrink-0">
              
              {/* Optional image input drawer */}
              {showImageInput && (
                <div className="mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg..."
                    className="flex-1 h-9 px-3 border border-slate-200 rounded-xl text-[10px] outline-none"
                  />
                  <button
                    onClick={() => setShowImageInput(false)}
                    className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShareLocation}
                  className="p-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer border-none transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="p-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer border-none transition-colors"
                >
                  <Image className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  placeholder={language === 'ar' ? 'اكتب رسالة هنا...' : 'Type message here...'}
                  className="flex-1 h-11 px-4 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
                />
                <button
                  type="submit"
                  className="p-3.5 bg-primary text-white hover:scale-102 rounded-xl cursor-pointer border-none transition-transform"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
