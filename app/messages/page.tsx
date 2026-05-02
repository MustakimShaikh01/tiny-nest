'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Nav from '../../components/Nav';
import Link from 'next/link';
import { Search, Send, ArrowRight, Loader2, CheckCheck, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────
type PresenceStatus = 'online' | 'away' | 'offline';

interface PresenceData {
  status: PresenceStatus;
  lastSeen?: number;
}

interface PresenceMap {
  [email: string]: PresenceData;
}

function formatLastSeen(ts?: number) {
  if (!ts) return 'offline';
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return `today at ${timeStr}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `yesterday at ${timeStr}`;
  }
  
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric'})} at ${timeStr}`;
}

// ─── Online Dot Component ────────────────────────────
function OnlineDot({ status }: { status?: PresenceStatus }) {
  if (!status || status === 'offline') return null; // WhatsApp only shows dot for online/away on avatars usually, but we can show it
  const cls = status === 'online' ? 'online-dot' : 'online-dot away';
  return <span className={cls} aria-label={`${status}`} title={`Status: ${status}`} />;
}

// ─── Status Text (Header) ─────────────────────────────
function StatusText({ data }: { data?: PresenceData }) {
  if (!data) return <span className="text-[12px] text-gray-400">offline</span>;
  
  if (data.status === 'online') {
    return <span className="text-[12px] text-green-500 font-medium">online</span>;
  }
  if (data.status === 'away') {
    return <span className="text-[12px] text-amber-500 font-medium">away</span>;
  }
  if (data.lastSeen) {
    return <span className="text-[12px] text-gray-500">last seen {formatLastSeen(data.lastSeen)}</span>;
  }
  return <span className="text-[12px] text-gray-500">offline</span>;
}

// ─── Avatar ───────────────────────────────────────────
function Avatar({
  name,
  size = 11,
  status,
}: {
  name: string;
  size?: number;
  status?: PresenceStatus;
}) {
  const initials = name?.[0]?.toUpperCase() || '?';
  return (
    <div className={`relative flex-shrink-0 w-${size} h-${size}`}>
      <div
        className={`w-full h-full rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-semibold text-[15px] shadow-sm select-none`}
      >
        {initials}
      </div>
      {status !== undefined && <OnlineDot status={status} />}
    </div>
  );
}

// ─── Main Messages Content ───────────────────────────
function MessagesContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [presence, setPresence] = useState<PresenceMap>({});
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Poll for new messages with smart triggers (Change 8)
  useEffect(() => {
    if (!currentUser) return;
    
    let isFetching = false;
    const pollMessages = async () => {
      if (document.visibilityState !== 'visible' || isFetching) return;
      isFetching = true;
      try {
        const res = await fetch(`/api/messages?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.messages) {
          setMessages((prev) => {
             const prevMap = new Map(prev.map(m => [m._id, m]));
             let hasChanged = false;

             data.messages.forEach((m: any) => {
               const existing = prevMap.get(m._id);
               if (!existing) {
                  // New message
                  prevMap.set(m._id, m);
                  hasChanged = true;

                  // Auto-read if newly received msg is in open chat
                  if (selectedConv && (m.from === selectedConv || m.to === selectedConv)) {
                     if (m.to === currentUser?.email && m.status === 'unread') {
                         fetch('/api/messages', {
                           method: 'PATCH',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ id: m._id, status: 'read' }),
                         }).catch(() => {});
                         m.status = 'read';
                     }
                  }
               } else if (existing.status !== m.status) {
                  // Message status updated (e.g. read by partner)
                  prevMap.set(m._id, m); // Update with new status
                  hasChanged = true;
               }
             });

             if (!hasChanged) return prev;
              
             // Push update to Nav unread count
             window.dispatchEvent(new Event('messagesUpdated'));

             return Array.from(prevMap.values()).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      } finally {
        isFetching = false;
      }
    };

    const id = setInterval(pollMessages, 2000);
    
    // Immediate fetch on focus or visibility change
    const handleFocus = () => pollMessages();
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(id);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [currentUser]);

  // ── Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (!userData.user) {
        router.push('/login');
        return;
      }
      setCurrentUser(userData.user);

      const msgRes = await fetch('/api/messages');
      const msgData = await msgRes.json();
      
      // Remove any exact DB duplicates just in case there's a glitch
      const uniqueMessages = Array.from(
        new Map((msgData.messages || []).map((m: any) => [m._id, m])).values()
      ) as any[];

      setMessages(uniqueMessages);
      setLoading(false);

      const toParam = searchParams.get('to');
      if (toParam) {
        setSelectedConv(toParam);
        markAsRead(toParam);
      }
    };
    fetchData();
  }, [router, searchParams]);

  // ── Heartbeat: broadcast current user's online status every 30s
  useEffect(() => {
    if (!currentUser) return;
    const sendHeartbeat = () => fetch('/api/presence', { method: 'POST' }).catch(() => {});
    sendHeartbeat(); // immediate
    const id = setInterval(sendHeartbeat, 30_000);
    return () => clearInterval(id);
  }, [currentUser]);

  // ── Poll presence for all conversation partners
  useEffect(() => {
    if (!currentUser || messages.length === 0) return;

    const partnerEmails = Array.from(
      new Set(
        messages.flatMap((m) => [m.from, m.to])
      )
    ).filter((e) => e !== currentUser.email);

    if (partnerEmails.length === 0) return;

    const fetchPresence = async () => {
      try {
        const res = await fetch(`/api/presence?emails=${partnerEmails.join(',')}`);
        const data = await res.json();
        setPresence(data.presence || {});
      } catch {}
    };

    fetchPresence();
    const id = setInterval(fetchPresence, 20_000); // poll every 20s
    return () => clearInterval(id);
  }, [currentUser, messages]);

  // ── Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
    }
  }, [messages, selectedConv]);

  // ── Mark messages as read
  const markAsRead = async (convEmail: string) => {
    const unread = messages.filter(
      (m) => m.from === convEmail && m.to === currentUser?.email && m.status === 'unread'
    );
    if (unread.length === 0) return;

    try {
      await Promise.all(
        unread.map((msg) =>
          fetch('/api/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: msg._id, status: 'read' }),
          })
        )
      );
      
      setMessages((prev) =>
        prev.map((m) => (m.from === convEmail && m.to === currentUser?.email ? { ...m, status: 'read' } : m))
      );

      // Dispatch event to update Nav unread count immediately
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // ── Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    let partnerEmail = selectedConv;
    if (selectedConv.includes('<->')) {
      const parts = selectedConv.split('<->');
      partnerEmail = parts[0] === currentUser?.email ? parts[1] : parts[0];
    }

    const partnerMsg = messages.find(
      (m) => m.from === partnerEmail || m.to === partnerEmail
    );

    const payload = {
      to: partnerEmail,
      toName:
        partnerMsg?.from === partnerEmail
          ? partnerMsg.fromName
          : partnerMsg?.toName || 'User',
      listingId: partnerMsg?.listingId || searchParams.get('listingId'),
      listingTitle: partnerMsg?.listingTitle || searchParams.get('title'),
      text: newMessage,
    };

    // Optimistic UI update
    const tempId = Date.now().toString();
    const optimisticMsg = {
        _id: tempId,
        ...payload,
        from: currentUser.email,
        fromName: currentUser.name || currentUser.email.split('@')[0],
        status: 'unread',
        createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const { message } = await res.json();
      // Replace optimistic message with real message
      setMessages((prev) => prev.map(m => m._id === tempId ? message : m));
    } else {
      // Remove if failed
      setMessages((prev) => prev.filter(m => m._id !== tempId));
    }
  };

  // ── Build conversation list
  const conversationsMap = new Map<string, any>();
  messages.forEach((m) => {
    let convId: string;
    if (currentUser?.role === 'admin') {
      const pair = [m.from, m.to].sort();
      convId = `${pair[0]}<->${pair[1]}`;
    } else {
      convId = m.from === currentUser?.email ? m.to : m.from;
    }
    if (
      !conversationsMap.has(convId) ||
      new Date(m.createdAt) > new Date(conversationsMap.get(convId).createdAt)
    ) {
      conversationsMap.set(convId, m);
    }
  });

  const convList = Array.from(conversationsMap.entries()).map(([id, lastMsg]) => {
    let email = id;
    let label = '';

    if (id.includes('<->')) {
      const parts = id.split('<->');
      email = parts[0] === currentUser?.email ? parts[1] : parts[0];
      label = `${parts[0].split('@')[0]} & ${parts[1].split('@')[0]}`;
    }

    const unreadCount = messages.filter(
      (m) =>
        m.from === email &&
        m.to === currentUser?.email &&
        m.status === 'unread'
    ).length;

    const name =
      label ||
      (lastMsg?.from === email
        ? lastMsg.fromName
        : lastMsg?.toName ||
          (email === searchParams.get('to') ? 'New Contact' : email.split('@')[0]));

    const time = lastMsg?.createdAt
      ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    // Determine the actual partner email for presence lookup
    const partnerEmail = id.includes('<->') ? email : id;
    const pData: PresenceData = presence[partnerEmail] || { status: 'offline' };

    return {
      id,
      email: id,
      displayEmail: email,
      name,
      lastText: lastMsg?.text || '',
      time,
      listing: lastMsg?.listingTitle || searchParams.get('title'),
      listingId: lastMsg?.listingId || searchParams.get('listingId'),
      unreadCount,
      presenceData: pData,
    };
  }).sort((a,b) => {
      // Sort conversations by most recent message
      const timeA = messages.find(m => m._id === conversationsMap.get(a.id)?._id)?.createdAt || 0;
      const timeB = messages.find(m => m._id === conversationsMap.get(b.id)?._id)?.createdAt || 0;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  const currentMessages = messages
    .filter((m) => {
      if (selectedConv?.includes('<->')) {
        const pair = [m.from, m.to].sort();
        return `${pair[0]}<->${pair[1]}` === selectedConv;
      }
      return m.from === selectedConv || m.to === selectedConv;
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const activeConv = convList.find((c) => c.email === selectedConv);
  const activePresenceData: PresenceData = activeConv?.presenceData || { status: 'offline' };

  // ── Render - Strict 100vh layout with overflow-hidden on body wrapper
  return (
    <main className="h-screen flex flex-col bg-[#f0f2f5] overflow-hidden">
      {/* Keeping top Nav, but preventing the page itself from scrolling */}
      <div className="flex-shrink-0 z-50 shadow-sm relative">
         <Nav user={currentUser} />
      </div>

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto overflow-hidden bg-white shadow-sm sm:mt-4 sm:mb-4 sm:rounded-md sm:border border-gray-200 min-h-0 relative z-0">
        
        {/* ─── Sidebar ──────────────────────────── */}
        <aside className={`w-full sm:w-80 md:w-[400px] border-r border-gray-200 flex flex-col bg-white flex-shrink-0 h-full ${selectedConv ? 'hidden sm:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center h-[60px] flex-shrink-0">
            <h1 className="text-[20px] font-semibold text-charcoal">Chats</h1>
          </div>
          
          {/* Search */}
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex-shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-1.5 bg-[#f0f2f5] rounded-lg text-[14px] focus:outline-none transition-all placeholder:text-gray-500"
                placeholder="Search or start new chat"
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-green" />
              </div>
            ) : convList.length > 0 ? (
              convList.map((conv, i) => {
                const isActive = selectedConv === conv.email;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedConv(conv.email);
                      markAsRead(conv.displayEmail);
                    }}
                    className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-[#f5f6f6] flex items-center gap-3 transition-colors ${
                      isActive ? 'bg-[#f0f2f5]' : ''
                    }`}
                  >
                    <Avatar
                      name={conv.name}
                      size={12}
                      status={conv.presenceData.status}
                    />

                    <div className="flex-1 min-w-0 border-b border-transparent">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[16px] truncate text-charcoal">
                          {conv.name}
                        </span>
                        <span className={`text-[12px] flex-shrink-0 ${conv.unreadCount > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          {conv.time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                         <p className={`text-[14px] truncate ${conv.unreadCount > 0 ? 'text-charcoal font-medium' : 'text-gray-500'}`}>
                           {conv.lastText}
                         </p>
                         {conv.unreadCount > 0 && (
                           <span className="w-5 h-5 bg-green-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0 ml-2 shadow-sm">
                             {conv.unreadCount}
                           </span>
                         )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-16 text-center text-gray-400 text-[14px]">
                No conversations yet
              </div>
            )}
          </div>
        </aside>

      {/* ─── Chat Area ─────────────────────────── */}
        <section className={`flex-1 flex flex-col bg-[#efeae2] relative min-w-0 h-full ${selectedConv ? 'flex' : 'hidden sm:flex'}`}>
            {/* WhatsApp Web Classic Chat Background Image (CSS pattern equivalent via pseudo element) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #d4d0ce 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {selectedConv ? (
            <div className="flex flex-col h-full relative z-10">
              {/* Chat Header */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between shadow-sm h-[60px] flex-shrink-0">
                <div className="flex items-center gap-3 cursor-pointer">
                  {/* Mobile back button */}
                  <button
                    className="sm:hidden p-1 text-gray-500 hover:text-green transition-colors"
                    onClick={() => setSelectedConv(null)}
                    aria-label="Back to conversations"
                  >
                    ←
                  </button>
                  <Avatar
                    name={activeConv?.name || '?'}
                    size={10}
                    status={activePresenceData.status}
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-medium text-[16px] text-charcoal leading-tight">
                      {activeConv?.name}
                    </span>
                    <StatusText data={activePresenceData} />
                  </div>
                </div>

                <div className="flex items-center">
                  {activeConv?.listingId && (
                    <Link
                      href={`/listings/${activeConv.listingId}`}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-[13px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      View Listing
                    </Link>
                  )}
                </div>
              </div>

              {/* Chat Scroll Area (The strictly scrollable part) */}
              <div className="flex-1 overflow-y-auto px-[5%] py-4 custom-scrollbar flex flex-col">
                
                {/* Security Message */}
                <div className="flex justify-center mb-6">
                    <span className="bg-[#ffeecd] text-charcoal/70 text-[12.5px] px-4 py-1.5 rounded-lg text-center shadow-sm max-w-md">
                        🔒 Messages are end-to-end encrypted. No one outside of this chat, not even TinyNest, can read to them.
                    </span>
                </div>

                {/* Messages Rendering */}
                {currentMessages.map((msg, i) => {
                  let isRightSide = msg.from === currentUser?.email;
                  
                  if (selectedConv?.includes('<->') && currentUser?.role === 'admin') {
                    const parts = selectedConv.split('<->');
                    const isParticipant = parts.includes(currentUser?.email);
                    if (isParticipant) {
                      isRightSide = msg.from === currentUser?.email;
                    } else {
                      isRightSide = msg.from === parts[1]; // arbitrary deterministic side
                    }
                  }

                  const isRead = msg.status === 'read';
                  
                  // Bubble styling identical to WhatsApp
                  const bubbleBg = isRightSide ? 'bg-[#d9fdd3]' : 'bg-white';
                  const bubbleTail = isRightSide ? 'rounded-tr-none' : 'rounded-tl-none';

                  // Format time
                  const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg._id || i} className={`flex w-full mb-2 ${isRightSide ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative max-w-[85%] md:max-w-[70%] px-2.5 py-1.5 rounded-lg shadow-sm ${bubbleBg} ${bubbleTail}`}
                      >
                        {/* Render Name for Group/Admin contexts */}
                        {!isRightSide && selectedConv?.includes('<->') && (
                            <div className="text-[12px] font-bold text-emerald-600 mb-0.5">
                                {msg.fromName || msg.from.split('@')[0]}
                            </div>
                        )}
                        
                        <span className="text-[14.5px] text-[#111b21] leading-relaxed break-words whitespace-pre-wrap">
                          {msg.text}
                          {/* Invisible placeholder to make room for time/ticks on the last line */}
                          <span className="inline-block w-14 h-4"></span>
                        </span>

                        {/* Floating Time and Ticks */}
                        <div className="absolute right-2.5 bottom-1 flex items-center justify-end gap-1 text-[#667781] select-none">
                          <span className="text-[11px] leading-none mt-[2px]">{msgTime}</span>
                          {isRightSide && (
                            isRead ? (
                                <CheckCheck className="w-[15px] h-[15px] text-[#53bdeb] ml-0.5 mt-[1px]" />
                            ) : (
                                <Check className="w-[14px] h-[14px] ml-0.5 mt-[1px]" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-1 w-full" />
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 bg-[#f0f2f5] flex items-center gap-3 min-h-[62px] flex-shrink-0 z-20">
                <form onSubmit={handleSend} className="flex-1 flex items-center gap-3 w-full">
                  <div className="flex-1 relative">
                      <input
                        id="message-input"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-lg border-transparent focus:outline-none text-[15px] shadow-sm placeholder:text-gray-500"
                        placeholder="Type a message"
                        autoComplete="off"
                      />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 flex-shrink-0"
                    aria-label="Send message"
                  >
                    {newMessage.trim() ? (
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm text-white hover:bg-green-600">
                            <Send className="w-4 h-4 ml-0.5" />
                        </div>
                    ) : (
                        <Send className="w-6 h-6" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex-col items-center justify-center text-center px-4 bg-[#f0f2f5] z-10 border-b-[6px] border-b-green-500 hidden sm:flex">
              <div className="w-[320px] mb-8">
                  <div className="w-full aspect-square max-h-[250px] bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center text-[80px] shadow-inner font-mono text-slate-300">
                      TN
                  </div>
              </div>
              <h2 className="text-[32px] font-light text-[#41525d] mb-4">
                TinyNest for Web
              </h2>
              <p className="text-[14px] text-[#667781] max-w-md leading-relaxed mb-8">
                Send and receive messages privately with buyers and sellers. <br/>
                Messages are secured with end-to-end encryption.
              </p>
              <div className="flex items-center justify-center gap-2 text-[13px] text-[#8696a0]">
                 🔒 End-to-end encrypted
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Inject custom scrollbar CSS just for this page */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.3);
        }
      `}} />
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#f0f2f5]">
          <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
