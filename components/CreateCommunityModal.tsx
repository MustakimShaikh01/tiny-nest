'use client';

import { useState } from 'react';
import { X, Globe, MapPin, TextQuote, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateCommunityModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
    rules: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-pale/30 text-green rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-2">Application Submitted!</h3>
              <p className="text-gray-500">
                Your community request has been sent to the admins for validation. 
                You'll be notified once it's approved.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-charcoal mb-2">Create a New Community</h2>
                <p className="text-gray-400 text-sm font-medium">
                  Help others find their home. New communities require admin validation to maintain quality.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Community Name</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Tiny Valley Haven"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green transition-all focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Target Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      required
                      type="text"
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. Austin, TX"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green transition-all focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell people what this community is about..."
                    rows={3}
                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green transition-all focus:outline-none text-sm font-medium resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Initial Rules/Updates (Optional)</label>
                  <div className="relative">
                    <TextQuote className="absolute left-4 top-4 text-gray-400 w-4 h-4" />
                    <textarea 
                      value={formData.rules}
                      onChange={e => setFormData({ ...formData, rules: e.target.value })}
                      placeholder="e.g. No noise after 10 PM. New solar grid coming soon..."
                      rows={2}
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green transition-all focus:outline-none text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-green text-white font-bold rounded-2xl hover:bg-green-dark transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>Submit Request <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
