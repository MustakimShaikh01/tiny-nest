'use client';

import { useState } from 'react';
import { Send, CheckCircle2, X, Mail, MessageSquare, Hash } from 'lucide-react';

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-green to-green-dark px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">Contact Support</h2>
                <p className="text-white/70 text-sm mt-1">We typically reply within 24-48 hours</p>
              </div>
              <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {submitted ? (
                /* Success State */
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-charcoal mb-3">Query Received!</h3>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                    We've received your query and sent a confirmation to <strong>{form.email}</strong>
                  </p>
                  <div className="bg-green-pale/40 border border-green/20 rounded-2xl p-5 mb-8 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-green" />
                      <span className="text-xs font-bold uppercase tracking-widest text-green">Your Support ID</span>
                    </div>
                    <div className="text-3xl font-bold text-charcoal">#{supportId}</div>
                    <p className="text-xs text-gray-400 mt-2">Save this ID to track your inquiry</p>
                  </div>
                  <button onClick={handleClose} className="btn btn-primary w-full justify-center">
                    Done
                  </button>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name</label>
                      <input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-green/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="you@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-green/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject <span className="text-red-400">*</span></label>
                    <input
                      required
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Issue with my listing approval"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-green/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message <span className="text-red-400">*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your issue or question in detail..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-green/20 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !form.subject || !form.message || !form.email}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green text-white font-bold rounded-xl hover:bg-green-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Inquiry
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    A unique Support ID and confirmation will be sent to your email
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
