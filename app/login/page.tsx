'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-green p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-green-light/20 via-transparent to-transparent opacity-50"></div>
        <Link href="/" className="flex items-center gap-2.5 relative z-10 group mb-20 text-white">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-tiny flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight">TinyNest</span>
        </Link>
        <div className="relative z-10 mt-auto max-w-sm">
          <h2 className="font-serif text-5xl font-bold text-white mb-6 leading-tight">Welcome <span className="text-green-pale">Back.</span></h2>
          <p className="text-white/70 text-lg font-medium">Log in to manage your listings, chat with sellers, and continue your tiny home journey.</p>
        </div>
        {/* Abstract Shapes */}
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-green rounded-tiny flex items-center justify-center">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-green tracking-tight">TinyNest</span>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-charcoal mb-4">Sign in to your account</h1>
          <p className="text-gray-500 font-medium mb-10">Don't have an account? <Link href="/signup" className="text-green font-bold hover:underline">Join free today</Link></p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-green-light" />
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
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                <Link href="#" className="text-xs font-bold text-green hover:underline">Forgot password?</Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                  placeholder="••••••••"
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">
             <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 bg-white relative z-10">Or continue with social</span>
                <div className="h-px bg-gray-100 -mt-2"></div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-10">
                <button 
                  onClick={() => { setEmail('admin@tinynest.com'); setPassword('admin123'); }}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-tiny hover:bg-gray-50 transition-colors font-bold text-[10px] uppercase tracking-[0.15em] text-gray-500 shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" /> Google
                </button>
                <button 
                  onClick={() => { setEmail('sarah@example.com'); setPassword('password123'); }}
                  className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-tiny hover:bg-gray-50 transition-colors font-bold text-[10px] uppercase tracking-[0.15em] text-gray-500 shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" /> Facebook
                </button>
             </div>
             
             <div className="bg-green-pale/30 border border-green/10 rounded-tiny p-6 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center text-xs font-serif italic shadow-tiny-sm flex-shrink-0">i</div>
                <div>
                   <h4 className="text-xs font-bold text-green uppercase tracking-widest mb-1.5">Demo Access</h4>
                   <p className="text-[11px] text-green font-medium leading-relaxed opacity-80">Click the social buttons above to instantly pre-fill credentials for <strong>Admin</strong> or <strong>Seller</strong> accounts during this preview.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
