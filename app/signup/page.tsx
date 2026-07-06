'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-earth p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-earth-light/20 via-transparent to-transparent opacity-50"></div>
        <Link href="/" className="flex items-center gap-2.5 relative z-10 group mb-12 text-white">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-tiny flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight">Tiny Living Market</span>
        </Link>
        <div className="relative z-10 mt-auto max-w-sm">
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">Start Your <span className="text-cream underline">Journey.</span></h2>
          <div className="space-y-4">
             <div className="flex gap-4">
               <CheckCircle2 className="w-5 h-5 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-base leading-relaxed">Join 50K+ tiny home lovers across the USA.</span>
             </div>
             <div className="flex gap-4">
               <CheckCircle2 className="w-5 h-5 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-base leading-relaxed">List your tiny house for free and reach millions of buyers.</span>
             </div>
             <div className="flex gap-4">
               <CheckCircle2 className="w-5 h-5 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-base leading-relaxed">Save your favorites and message sellers directly.</span>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Create your free account</h1>
          <p className="text-gray-500 font-medium mb-10">Already have an account? <Link href="/login" className="text-green font-bold hover:underline">Sign in instead</Link></p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                type="button" 
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-[12px] uppercase tracking-widest text-center ${role === 'buyer' ? 'border-green bg-green-50 text-green' : 'border-gray-100 text-gray-400 hover:border-green-100 hover:bg-gray-50'}`}
              >
                Buy a Home
              </button>
              <button 
                type="button" 
                onClick={() => setRole('seller')}
                className={`p-4 rounded-xl border-2 transition-all font-bold text-[12px] uppercase tracking-widest text-center ${role === 'seller' ? 'border-green bg-green-50 text-green' : 'border-gray-100 text-gray-400 hover:border-green-100 hover:bg-gray-50'}`}
              >
                Sell a Home
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-tiny text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn btn-primary py-4 text-base justify-center shadow-xl hover:-translate-y-1 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join Tiny Living Market <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
             <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 bg-white relative z-10">Or register with social</span>
                <div className="h-px bg-gray-100 -mt-2"></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => window.location.href = '/api/auth/google'}
                  className="flex items-center justify-center gap-2 p-3.5 border border-gray-200 rounded-[1rem] hover:bg-gray-50 transition-colors font-bold text-[11px] uppercase tracking-[0.1em] text-gray-600 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg> Google
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="flex items-center justify-center gap-2 p-3.5 border border-gray-200 rounded-[1rem] hover:bg-gray-50 transition-colors font-bold text-[11px] uppercase tracking-[0.1em] text-gray-600 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook
                </button>
             </div>
          </div>
          
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-8">
            By joining, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
      
      {/* Coming Soon Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Coming Soon!</h3>
            <p className="text-gray-400 text-sm font-medium mb-8">
              Facebook registration is currently being integrated and will be available in the next update.
            </p>
            <button 
              onClick={() => setShowPopup(false)}
              className="w-full py-4 bg-charcoal text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
