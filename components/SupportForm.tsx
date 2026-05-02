'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, X, Mail, MessageSquare, Hash, Loader2 } from 'lucide-react';

interface SupportFormProps {
  userEmail?: string;
  userName?: string;
}

export default function SupportForm({ userEmail = '', userName = '' }: SupportFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [supportId, setSupportId] = useState('');
  const [form, setForm] = useState({
    name: userName,
    email: userEmail,
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (!userEmail || !userName) {
      fetch('/api/auth/session').then(res => res.json()).then(data => {
        if (data?.user) {
          setForm(f => ({ ...f, name: f.name || data.user.name, email: f.email || data.user.email }));
        }
      }).catch(() => {});
    }
  }, [userEmail, userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message || !form.email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSupportId(data.supportId);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setSubmitted(false); setForm({ name: userName, email: userEmail, subject: '', message: '' }); }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        id="contact-support-btn"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-xl font-bold text-sm hover:bg-green-dark transition-all shadow-lg"
      >
        <MessageSquare className="w-4 h-4" />
        Contact Support
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-gray-100">
            {/* Header */}
            <div className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100">
              <div>
                <h2 className="text-charcoal font-bold text-xl uppercase tracking-tight">Contact Support</h2>
                <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-bold">Inquiry Form</p>
              </div>
              <button onClick={handleClose} className="text-gray-300 hover:text-charcoal transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {submitted ? (
                /* Success State */
                <div className="text-center py-10 animate-fade-in">
                  <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal mb-2">Message Sent</h3>
                  <p className="text-gray-500 mb-8 text-sm font-medium">
                    We've received your query. A confirmation has been sent to your email.
                  </p>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-10">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your Support ID</div>
                    <div className="text-3xl font-bold text-charcoal tracking-tighter">#{supportId}</div>
                  </div>
                  <button onClick={handleClose} className="w-full py-4 bg-charcoal text-white font-bold rounded-xl hover:bg-black transition-all uppercase tracking-widest text-xs">
                    Close
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!userName && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none text-sm font-bold text-charcoal placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-green/10 border border-transparent focus:border-green/20 transition-all font-sans"
                      />
                    </div>
                  )}

                  {!userEmail && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none text-sm font-bold text-charcoal placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-green/10 border border-transparent focus:border-green/20 transition-all font-sans"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                    <input
                      required
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="Enter subject"
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none text-sm font-bold text-charcoal placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-green/10 border border-transparent focus:border-green/20 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Write Message</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Type your message here..."
                      className="w-full px-5 py-3.5 bg-gray-50 rounded-xl outline-none text-sm font-bold text-charcoal placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-green/10 border border-transparent focus:border-green/20 transition-all resize-none font-sans"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !form.subject || !form.message || !form.email || !form.name}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-green text-white font-bold rounded-xl hover:bg-green-dark transition-all shadow-xl shadow-green/10 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Inquiry
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    We will respond to {form.email || 'your email'} shortly.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
