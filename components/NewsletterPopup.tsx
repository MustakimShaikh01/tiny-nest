'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Sparkles, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Show popup after 30 seconds
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem('newsletter_dismissed');
      const subscribed = localStorage.getItem('newsletter_subscribed');
      if (!dismissed && !subscribed) {
        setShow(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('newsletter_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      localStorage.setItem('newsletter_subscribed', 'true');
      setTimeout(() => setShow(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-scale-in relative border border-gray-100">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-charcoal hover:bg-gray-50 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          {/* Image/Decoration Area */}
          <div className="h-48 bg-charcoal relative overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
             <img 
               src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=600" 
               className="absolute inset-0 w-full h-full object-cover opacity-60" 
               alt="Tiny house"
             />
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                   <Mail className="w-8 h-8 text-white" />
                </div>
                <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                   <Sparkles className="w-3.5 h-3.5 text-green" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Join the Tiny Movement</span>
                </div>
             </div>
          </div>

          {/* Content Area */}
          <div className="p-8 sm:p-10 text-center">
            {success ? (
              <div className="py-6 animate-fade-in">
                 <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green" />
                 </div>
                 <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">You're on the list!</h2>
                 <p className="text-gray-400 font-medium">Welcome to the TinyNest family. <br/>Check your inbox for something special.</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-serif font-bold text-charcoal mb-3 tracking-tight">Stay Inspired.</h2>
                <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed max-w-sm mx-auto">
                  Subscribe to our weekly newsletter for the latest tiny house listings, off-grid tips, and community stories.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green transition-colors" />
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none text-sm font-bold text-charcoal placeholder:text-gray-300 focus:bg-white focus:border-green/20 focus:ring-4 focus:ring-green/5 transition-all"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-green text-white font-bold rounded-2xl shadow-xl shadow-green/20 hover:bg-green-dark hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Subscribe Now
                      </>
                    )}
                  </button>
                </form>
                <button 
                  onClick={handleDismiss} 
                  className="mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors"
                >
                  Maybe later, thanks
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
