'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Search, Send, ArrowRight, Loader2, CheckCheck, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────
type PresenceStatus = 'online' | 'away' | 'offline';

interface PresenceMap {
  [email: string]: PresenceStatus;
}

// ─── Online Dot Component ────────────────────────────
function OnlineDot({ status }: { status: PresenceStatus }) {
  const cls =
    status === 'online'
      ? 'online-dot'
      : status === 'away'
      ? 'online-dot away'
      : 'online-dot offline';
  return <span className={cls} aria-label={`${status}`} title={`Status: ${status}`} />;
}

function StatusText({ status }: { status: PresenceStatus }) {
  if (status === 'online') {
    return <span className="text-[11px] font-semibold text-green-500">● Online</span>;
  }
  if (status === 'away') {
    return <span className="text-[11px] font-semibold text-amber-500">● Away</span>;
  }
  return <span className="text-[11px] font-medium text-gray-400">Last seen recently</span>;
}

// ─── Avatar with Online Dot ───────────────────────────
function Avatar({
  name,
  email,
  size = 10,
  status,
}: {
  name: string;
  email?: string;
  size?: number;
  status?: PresenceStatus;
}) {
  const initials = name?.[0]?.toUpperCase() || '?';
  return (
    <div className={`relative flex-shrink-0 w-${size} h-${size}`}>
      <div
        className={`w-full h-full rounded-full bg-green text-white flex items-center justify-center font-bold text-sm shadow-sm select-none`}
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
      const allMessages = msgData.messages || [];
      setMessages(allMessages);
      setLoading(false);

      const toParam = searchParams.get('to');
      if (toParam) {
        setSelectedConv(toParam);
      } else if (allMessages.length > 0) {
        const first = allMessages[0];
        const firstPartner = first.from === userData.user.email ? first.to : first.from;
        setSelectedConv(firstPartner);
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
        messages.map((m) =>
          m.from === currentUser.email ? m.to : m.from
        )
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConv]);

  // ── Mark messages as read
  const markAsRead = async (convEmail: string) => {
    const unread = messages.filter(
      (m) => m.from === convEmail && m.status === 'unread'
    );
    for (const msg of unread) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: msg._id, status: 'read' }),
        });
      } catch {}
    }
    setMessages((prev) =>
      prev.map((m) => (m.from === convEmail ? { ...m, status: 'read' } : m))
    );
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

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
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
      : 'Now';

    // Determine the actual partner email for presence lookup
    const partnerEmail = id.includes('<->') ? email : id;
    const userPresence: PresenceStatus = presence[partnerEmail] ?? 'offline';

    return {
      id,
      email: id,
      displayEmail: email,
      name,
      lastText: lastMsg?.text || 'Start a conversation...',
      time,
      listing: lastMsg?.listingTitle || searchParams.get('title'),
      listingId: lastMsg?.listingId || searchParams.get('listingId'),
      unreadCount,
      presence: userPresence,
    };
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
  const activePresence: PresenceStatus = activeConv?.presence ?? 'offline';

  // ── Render
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav user={currentUser} />

      <div
        className="flex-1 flex max-w-7xl mx-auto w-full overflow-hidden border-x border-gray-100 mt-2 shadow-tiny"
        style={{ height: 'calc(100vh - 130px)', minHeight: '500px' }}
      >
        {/* ─── Sidebar ──────────────────────────── */}
        <aside className="w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white flex-shrink-0">
          {/* Header */}
          <div className="px-5 py-5 border-b border-gray-100">
            <h1 className="text-xl font-bold text-charcoal mb-4">Messages</h1>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-[15px] font-medium focus:bg-white focus:border-green-light transition-all outline-none placeholder:text-gray-400"
                placeholder="Search conversations..."
                aria-label="Search conversations"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
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
                    className={`w-full text-left px-5 py-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 flex items-center gap-3 relative ${
                      isActive ? 'bg-green-pale/40 border-l-[3px] border-l-green' : 'border-l-[3px] border-l-transparent'
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Avatar with online dot */}
                    <Avatar
                      name={conv.name}
                      email={conv.displayEmail}
                      size={10}
                      status={conv.presence}
                    />

                    {/* Conv info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span
                          className={`font-semibold text-[15px] truncate ${
                            conv.unreadCount > 0 ? 'text-charcoal' : 'text-gray-700'
                          }`}
                        >
                          {conv.name}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                          {conv.time}
                        </span>
                      </div>

                      {/* Online status pill */}
                      <div className="mb-1">
                        <StatusText status={conv.presence} />
                      </div>

                      <p
                        className={`text-[13px] truncate leading-snug ${
                          conv.unreadCount > 0
                            ? 'text-charcoal font-semibold'
                            : 'text-gray-500 font-normal'
                        }`}
                      >
                        {conv.lastText}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-green text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-1">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-16 text-center text-gray-400 text-[15px] font-medium">
                No conversations yet
              </div>
            )}
          </div>
        </aside>

        {/* ─── Chat Area ─────────────────────────── */}
        <section className="flex-1 flex flex-col bg-[#F0F2F5] relative overflow-hidden">
          {selectedConv ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={activeConv?.name || '?'}
                    size={11}
                    status={activePresence}
                  />
                  <div>
                    <div className="font-semibold text-[15px] text-charcoal leading-tight">
                      {activeConv?.name}
                    </div>
                    <StatusText status={activePresence} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {activeConv?.listingId && (
                    <Link
                      href={`/listings/${activeConv.listingId}`}
                      className="btn btn-outline btn-sm text-[13px] px-4 py-2 flex items-center gap-2 group/btn"
                    >
                      View Listing
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Listing context bar */}
              {activeConv?.listing && (
                <div className="px-5 py-2 bg-green-pale/40 border-b border-green-pale text-[13px] font-medium text-green-700 flex items-center gap-2">
                  <span className="text-green text-xs">🏡</span>
                  Re: <span className="font-semibold">{activeConv.listing}</span>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
                {currentMessages.length === 0 && (
                  <div className="text-center text-gray-400 text-[14px] font-medium py-8">
                    No messages yet. Say hello! 👋
                  </div>
                )}
                {currentMessages.map((msg, i) => {
                  let isRightSide = msg.from === currentUser?.email;
                  let bubbleClass = 'bg-white text-charcoal rounded-tl-none shadow-sm border border-gray-100';
                  let wrapClass = 'items-start';

                  if (selectedConv?.includes('<->') && currentUser?.role === 'admin') {
                    const parts = selectedConv.split('<->');
                    const isParticipant = parts.includes(currentUser?.email);
                    if (isParticipant) {
                      isRightSide = msg.from === currentUser?.email;
                    } else {
                      isRightSide = msg.from === parts[1];
                    }
                  }

                  if (isRightSide) {
                    bubbleClass = 'bg-green text-white rounded-tr-none shadow-sm';
                    wrapClass = 'items-end';
                  } else if (
                    selectedConv?.includes('<->') &&
                    currentUser?.role === 'admin' &&
                    msg.from !== currentUser?.email
                  ) {
                    bubbleClass =
                      'bg-blue-50 text-charcoal rounded-tl-none shadow-sm border border-blue-100';
                  }

                  const isRead = msg.status === 'read';

                  return (
                    <div key={i} className={`flex flex-col ${wrapClass}`}>
                      {/* Sender name (only for non-self in group/admin view) */}
                      {!isRightSide && (
                        <span className="text-[11px] font-semibold text-gray-500 mb-1 ml-1">
                          {msg.fromName || msg.from?.split('@')[0]}
                        </span>
                      )}

                      <div
                        className={`max-w-[70%] md:max-w-[60%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed font-normal ${bubbleClass}`}
                      >
                        {msg.text}
                      </div>

                      {/* Timestamp + read receipt */}
                      <div className={`flex items-center gap-1 mt-1 ${isRightSide ? 'mr-1' : 'ml-1'}`}>
                        <span className="text-[11px] text-gray-400">
                          {msg.time ||
                            (msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '')}
                        </span>
                        {isRightSide && (
                          isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-green-400" title="Read" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-gray-300" title="Delivered" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div className="px-5 py-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-3 items-center">
                  <input
                    id="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-gray-50 px-5 py-3 rounded-full border border-transparent focus:bg-white focus:border-green-light transition-all outline-none text-[15px] font-normal placeholder:text-gray-400"
                    placeholder="Type a message..."
                    aria-label="Type your message"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    id="send-message-btn"
                    className="w-11 h-11 bg-green text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#225C3E] transition-colors active:scale-95 flex-shrink-0"
                    aria-label="Send message"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-center text-[11px] text-gray-300 mt-2.5 font-medium">
                  🔒 End-to-end encrypted messaging
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="text-7xl mb-6 grayscale opacity-30 select-none">💬</div>
              <h2 className="text-xl font-bold text-charcoal/40 mb-2">
                Select a Conversation
              </h2>
              <p className="text-[15px] text-gray-400 max-w-xs leading-relaxed">
                Your private messages with buyers and sellers will appear here.
              </p>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-green" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
