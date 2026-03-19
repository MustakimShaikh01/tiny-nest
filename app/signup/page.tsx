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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-earth p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-earth-light/20 via-transparent to-transparent opacity-50"></div>
        <Link href="/" className="flex items-center gap-2.5 relative z-10 group mb-20 text-white">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-tiny flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight">TinyNest</span>
        </Link>
        <div className="relative z-10 mt-auto max-w-sm">
          <h2 className="font-serif text-5xl font-bold text-white mb-6 leading-tight">Start Your <span className="text-cream underline">Journey.</span></h2>
          <div className="space-y-6">
             <div className="flex gap-4">
               <CheckCircle2 className="w-6 h-6 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-lg leading-relaxed">Join 50K+ tiny home lovers across the USA.</span>
             </div>
             <div className="flex gap-4">
               <CheckCircle2 className="w-6 h-6 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-lg leading-relaxed">List your tiny house for free and reach millions of buyers.</span>
             </div>
             <div className="flex gap-4">
               <CheckCircle2 className="w-6 h-6 text-cream-dark shrink-0" />
               <span className="text-white font-medium text-lg leading-relaxed">Save your favorites and message sellers directly.</span>
             </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Create your free account</h1>
          <p className="text-gray-500 font-medium mb-10">Already have an account? <Link href="/login" className="text-green font-bold hover:underline">Sign in instead</Link></p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button 
                type="button" 
                onClick={() => setRole('buyer')}
                className={`p-4 rounded-tiny-sm border-2 transition-all font-bold text-[10px] uppercase tracking-widest text-center ${role === 'buyer' ? 'border-green bg-green-pale text-green' : 'border-gray-100 text-gray-400'}`}
              >
                Buyer
              </button>
              <button 
                type="button" 
                onClick={() => setRole('seller')}
                className={`p-4 rounded-tiny-sm border-2 transition-all font-bold text-[10px] uppercase tracking-widest text-center ${role === 'seller' ? 'border-green bg-green-pale text-green' : 'border-gray-100 text-gray-400'}`}
              >
                Seller
              </button>
              <button 
                type="button" 
                onClick={() => setRole('admin')}
                className={`p-4 rounded-tiny-sm border-2 transition-all font-bold text-[10px] uppercase tracking-widest text-center ${role === 'admin' ? 'border-green bg-green-pale text-green' : 'border-gray-100 text-gray-400'}`}
              >
                Admin
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Join TinyNest <ArrowRight className="w-5 h-5 ml-2" /></>}
            </button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-6">
              By joining, you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
