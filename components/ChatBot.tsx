'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isHtml?: boolean;
};

const FAQ_DATABASE: Record<string, string> = {
  'what is tinyliving?': 'Tiny Living Market is the premier marketplace for buying, selling, and renting tiny homes across the country.',
  'how do i contact a seller?': 'Navigate to any listing and click the <b>Message Seller</b> button to start a secure, end-to-end encrypted chat.',
  'what about zoning laws?': 'Zoning varies drastically by state and county. We recommend downloading our <a href="https://drive.google.com/file/d/1qr_BeiaLUEn0xj-29EeHZRACqODZ73a_/view" target="_blank" class="text-green underline">Zoning Laws 2026 guide</a> from our resources section.',
  'do you offer financing?': 'We do not provide direct financing, but many of our certified sellers accept third-party tiny home loans. Check our <a href="https://drive.google.com/file/d/1SWqzToHyludoVLrV2U90fCo17Axj9gRk/view" target="_blank" class="text-green underline">Buyer\'s Checklist</a> to prepare!',
  'how do i list a home?': 'Log in, go to your dashboard, and click <b>Create Listing</b>. Admins will review and approve your listing shortly after.',
  'how can i sign in': 'Click the <b>Login</b> button gracefully located at the top right header of the page! Or go to <a href="/signup" class="text-green underline">Signup</a> to create a new account.',
  'how can i signin': 'Click the <b>Login</b> button gracefully located at the top right header of the page! Or go to <a href="/signup" class="text-green underline">Signup</a> to create a new account.',
  'how to register': 'Click the <b>Login</b> button at the top right header of the page then navigate to <a href="/signup" class="text-green underline">Join free today</a>, and choose either Buyer or Seller account.',
};

const SUGGESTIONS = [
  'What is Tiny Living Market?',
  'How do I contact a seller?',
  'What about zoning laws?',
  'Do you offer financing?'
];

export function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: '👋 Hi there! Welcome to Tiny Living Market. How can I help you find your dream tiny home today?'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto layout open disabled by default
  useEffect(() => {
    // Chatbot no longer opens by default on the home page
  }, [pathname, hasOpened]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    const userText = text.trim();
    if (!userText) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate bot thinking
    setTimeout(() => {
      const query = userText.toLowerCase();
      
      // Match exact FAQ or keyword matching
      let response = "I'm sorry, I don't know the answer to that. Please send a message to a specific seller for home inquiries, or check our Resources!";
      
      for (const [key, answer] of Object.entries(FAQ_DATABASE)) {
        if (query.includes(key.toLowerCase().replace('?', '')) || key.includes(query)) {
          response = answer;
          break;
        }
      }

      // Keyword fallback logic
      if (query.includes('zoning') || query.includes('law') || query.includes('legal')) {
        response = FAQ_DATABASE['what about zoning laws?'];
      } else if (query.includes('finance') || query.includes('loan') || query.includes('pay')) {
         response = FAQ_DATABASE['do you offer financing?'];
      } else if (query.includes('contact') || query.includes('message') || query.includes('chat')) {
         response = FAQ_DATABASE['how do i contact a seller?'];
      }

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'bot', 
        text: response,
        isHtml: true,
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Bot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-green text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-[10000] w-80 sm:w-[360px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'
        }`}
        style={{ height: '520px', maxHeight: 'calc(100vh - 40px)' }}
      >
        {/* Header */}
        <div className="bg-charcoal text-white px-5 py-4 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green/20 rounded-full flex items-center justify-center border border-green/30">
              <Bot className="w-5 h-5 text-green-400" />
            </div>
            <div>
               <h3 className="font-bold text-sm">Tiny Living Market Guide</h3>
               <div className="flex items-center gap-1.5 text-[11px] text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
               </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 py-5 bg-gray-50 flex flex-col gap-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-green text-white rounded-tr-sm' 
                : 'bg-white text-charcoal border border-gray-100 rounded-tl-sm'
              }`}>
                {msg.isHtml ? (
                   <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                   msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Suggestions */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              className="px-3 py-1.5 bg-white border border-green-light/30 text-green text-[12px] font-medium rounded-full hover:bg-green-pale transition-colors flex-shrink-0 shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-50 px-4 py-2.5 rounded-full text-[14px] focus:outline-none focus:ring-1 focus:ring-green border border-transparent transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 bg-green text-white flex items-center justify-center rounded-full flex-shrink-0 disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
      `}} />
    </>
  );
}
