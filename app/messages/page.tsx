'use client';

import { useState, useEffect, Suspense } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Search, Send, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function MessagesContent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

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
      
      const toParam = searchParams.get('to');
      if (toParam) {
        setSelectedConv(toParam);
      } else if (allMessages.length > 0) {
        const firstPartner = allMessages[0].from === userData.user.email ? allMessages[0].to : allMessages[0].from;
        setSelectedConv(firstPartner);
      }
    };
    fetchData();
  }, [router, searchParams]);

  const markAsRead = async (convEmail: string) => {
    const unreadFromThisUser = messages.filter(m => m.from === convEmail && m.status === 'unread');
    for (const msg of unreadFromThisUser) {
      try {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: msg._id, status: 'read' }),
        });
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    // Update local state
    setMessages(prev => prev.map(m => m.from === convEmail ? { ...m, status: 'read' } : m));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    // Determine partner email
    let partnerEmail = selectedConv;
    if (selectedConv.includes('<->')) {
      const parts = selectedConv.split('<->');
      partnerEmail = parts[0] === currentUser?.email ? parts[1] : parts[0];
    }

    const partnerMsg = messages.find(m => m.from === partnerEmail || m.to === partnerEmail);
    
    const msgData = {
      to: partnerEmail,
      toName: partnerMsg?.from === partnerEmail ? partnerMsg.fromName : partnerMsg?.toName || 'User',
      listingId: partnerMsg?.listingId || searchParams.get('listingId'),
      listingTitle: partnerMsg?.listingTitle || searchParams.get('title'),
      text: newMessage
    };

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  // Group messages into unique conversations
  const conversationsMap = new Map();
  messages.forEach(m => {
    let convId;
    if (currentUser?.role === 'admin') {
      const pair = [m.from, m.to].sort();
      convId = `${pair[0]}<->${pair[1]}`;
    } else {
      convId = m.from === currentUser?.email ? m.to : m.from;
    }
    
    if (!conversationsMap.has(convId) || new Date(m.createdAt) > new Date(conversationsMap.get(convId).createdAt)) {
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

    const unreadCount = messages.filter(m => m.from === email && m.to === currentUser?.email && m.status === 'unread').length;

    return {
      email: id,
      displayEmail: email,
      name: label || (lastMsg?.from === email ? lastMsg.fromName : (lastMsg?.toName || (email === searchParams.get('to') ? 'New Contact' : email.split('@')[0]))),
      lastText: lastMsg?.text || 'Start a conversation...',
      time: lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
      listing: lastMsg?.listingTitle || searchParams.get('title'),
      listingId: lastMsg?.listingId || searchParams.get('listingId'),
      unreadCount
    };
  });

  const currentMessages = messages.filter(m => {
    if (selectedConv?.includes('<->')) {
      const pair = [m.from, m.to].sort();
      return `${pair[0]}<->${pair[1]}` === selectedConv;
    }
    return m.from === selectedConv || m.to === selectedConv;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Nav user={currentUser} />

      <div className="flex-1 flex max-w-7xl mx-auto w-full group overflow-hidden border-x border-gray-100 mt-2 shadow-tiny">
        {/* Sidebar */}
        <aside className="w-96 border-r border-gray-100 flex flex-col bg-white">
          <div className="p-8 border-b border-gray-50">
             <h1 className="text-2xl font-bold text-charcoal mb-6">Messages</h1>
             <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-gray-400" />
                <input className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-tiny-sm font-medium focus:bg-white focus:border-green-light transition-all outline-none text-sm" placeholder="Search conversations..." />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {convList.length > 0 ? convList.map((conv, i) => (
                 <div 
                   key={i} 
                   onClick={() => { setSelectedConv(conv.email); markAsRead(conv.displayEmail); }}
                   className={`p-6 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 relative ${selectedConv === conv.email ? 'bg-green-pale/30 border-l-4 border-l-green' : ''}`}
                 >
                    <div className="flex justify-between items-start mb-1">
                       <span className={`font-bold text-sm ${conv.unreadCount > 0 ? 'text-charcoal' : 'text-gray-600'}`}>
                         {conv.name}
                         {conv.unreadCount > 0 && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">{conv.time}</span>
                    </div>
                   <div className="text-xs font-bold text-green mb-2 opacity-70 truncate uppercase tracking-widest">{conv.listing}</div>
                   <p className="text-sm text-gray-500 font-medium truncate leading-normal">{conv.lastText}</p>
                </div>
             )) : (
               <div className="p-12 text-center text-gray-400 font-medium italic text-sm">No conversations yet</div>
             )}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-gray-50/50 backdrop-blur-sm relative">
           {selectedConv ? (
             <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-6 bg-white border-b border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green text-white flex items-center justify-center font-bold text-sm shadow-tiny-sm text-uppercase">
                        {convList.find(c => c.email === selectedConv)?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-charcoal text-sm">{convList.find(c => c.email === selectedConv)?.name}</div>
                        <div className="text-[10px] font-bold text-green uppercase tracking-widest leading-none mt-1">Active Now</div>
                      </div>
                   </div>
                   {convList.find(c => c.email === selectedConv)?.listingId && (
                     <Link href={`/listings/${convList.find(c => c.email === selectedConv)?.listingId}`} className="btn btn-outline btn-sm font-bold text-xs px-4 flex items-center gap-2 group/btn">
                       View Listing 
                       <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                     </Link>
                   )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6">
                   {currentMessages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.from === currentUser?.email ? 'items-end' : 'items-start'}`}>
                         <div className={`max-w-md p-5 rounded-tiny shadow-tiny-sm font-medium text-sm leading-relaxed ${msg.from === currentUser?.email ? 'bg-green text-white rounded-br-none' : 'bg-white text-charcoal rounded-bl-none border border-gray-100'}`}>
                            {msg.text}
                         </div>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{msg.time}</span>
                      </div>
                   ))}
                </div>

                {/* Input Area */}
                <div className="p-8 bg-white border-t border-gray-50">
                   <form onSubmit={handleSendMessage} className="flex gap-4">
                      <input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-gray-50 px-6 py-4 rounded-tiny border border-transparent focus:bg-white focus:border-green transition-all outline-none font-medium text-sm" 
                        placeholder="Type your message securely..." 
                      />
                      <button type="submit" className="w-14 h-14 bg-green text-white rounded-tiny flex items-center justify-center shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                         <Send className="w-6 h-6" />
                      </button>
                   </form>
                   <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                      <span className="w-2 h-2 rounded-full bg-green/20"></span>
                      End-to-end encrypted messaging
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="text-8xl mb-8 grayscale animate-pulse">💬</div>
                <h2 className="text-2xl font-bold text-charcoal mb-4">Select a Conversation</h2>
                <p className="max-w-xs text-gray-500 font-medium">Your private messages with buyers and sellers will appear here.</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-green" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
